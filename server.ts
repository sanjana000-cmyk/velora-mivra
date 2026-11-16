import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.DEFAULT_APP_PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Server-side initialization of Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
const isValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10);
const ai = isValidKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const GEMINI_MODEL = 'gemini-4-hydrogen';

// Short-lived in-memory cache + rate-limit circuit breaker to prevent redundant API calls
const CACHE_TTL_MS = 2 * 60 * 1000;
const responseCache = new Map<string, { data: any; expiresAt: number }>();
let quotaCooldownUntil = 0;

function getCachedResponse(cacheKey: string): any | null {
  const entry = responseCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(cacheKey);
    return null;
  }
  return entry.data;
}

function setCachedResponse(cacheKey: string, data: any): void {
  if (responseCache.size >= 100) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function isQuotaError(error: any): boolean {
  const msg = String(error?.message || error || '');
  return (
    error?.status === 429 ||
    error?.code === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.toLowerCase().includes('quota')
  );
}

function getRetryDelaySeconds(error: any): number {
  const msg = String(error?.message || '');
  const match = msg.match(/retryDelay["']?\s*:\s*["']?(\d+)s/i) || msg.match(/retry in (\d+)/i);
  const parsed = match ? Number(match[1]) : 35;
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 120) : 35;
}

function handleGeminiFailure(endpoint: string, error: any): {
  quotaLimited: boolean;
  retryAfterSeconds?: number;
} {
  if (isQuotaError(error)) {
    const retryAfterSeconds = getRetryDelaySeconds(error);
    quotaCooldownUntil = Date.now() + retryAfterSeconds * 1000;
    console.info(
      `[Mivra] ${endpoint}: Gemini rate limit reached, using local matcher for ${retryAfterSeconds}s.`
    );
    return { quotaLimited: true, retryAfterSeconds };
  }
  console.info(`[Mivra] ${endpoint}: Using local campus matcher fallback.`);
  return { quotaLimited: false };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    ),
  ]);
}

function parseJsonSafe(rawText?: string): any {
  const cleaned = (rawText || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) return {};
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    return {};
  }
}

const VALID_OCCASIONS = new Set([
  'College Fests',
  'Traditional Day',
  'Placement & Interviews',
  'Farewell & Prom',
  'Lab Practicals',
  'Hackathons',
  'Everyday',
]);

const VALID_CATEGORIES = new Set([
  'Books & Academics',
  'Electronics & Gadgets',
  'Clothing & Outfits',
  'Lab & Studio Equipment',
  'Dorm & Living',
  'Bicycles & Mobility',
]);

function localNaturalSearch(query: string, availableItems: any[]) {
  const q = query.toLowerCase().trim();
  const stopWords = new Set([
    'i',
    'need',
    'want',
    'a',
    'an',
    'the',
    'for',
    'to',
    'under',
    'below',
    'less',
    'than',
    'with',
    'in',
    'on',
    'at',
    'my',
    'looking',
    'find',
    'borrow',
    'buy',
    'rent',
    'get',
  ]);
  const tokens = q
    .replace(/[^\w\s₹$]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));

  // Detect optional budget limit (supports both ₹ INR and $ USD)
  let maxBudgetUsd: number | null = null;
  const inrMatch = q.match(/(?:₹|rs\.?|inr)\s*(\d+)/i);
  const usdMatch = q.match(/\$\s*(\d+)/);
  if (inrMatch) {
    maxBudgetUsd = Number(inrMatch[1]) / 83;
  } else if (usdMatch) {
    maxBudgetUsd = Number(usdMatch[1]);
  }

  const scored = (Array.isArray(availableItems) ? availableItems : []).map((item: any) => {
    const title = String(item.title || '').toLowerCase();
    const desc = String(item.description || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';
    const occasions = Array.isArray(item.occasionTags)
      ? item.occasionTags.join(' ').toLowerCase()
      : '';
    const haystack = `${title} ${desc} ${cat} ${tags} ${occasions}`;

    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += 4;
      else if (tags.includes(token) || occasions.includes(token)) score += 3;
      else if (cat.includes(token) || desc.includes(token)) score += 2;
    }

    if (
      (q.includes('outfit') ||
        q.includes('kurta') ||
        q.includes('ethnic') ||
        q.includes('traditional') ||
        q.includes('dress') ||
        q.includes('blazer')) &&
      cat.includes('clothing')
    ) {
      score += 4;
    }
    if ((q.includes('calc') || q.includes('midterm') || q.includes('exam')) && title.includes('calc')) {
      score += 5;
    }
    if ((q.includes('lab') || q.includes('biotech') || q.includes('chem')) && cat.includes('lab')) {
      score += 4;
    }
    if (q.includes('fest') && occasions.includes('fest')) {
      score += 3;
    }

    if (maxBudgetUsd !== null && score > 0) {
      const effectivePrice =
        item.dealType === 'borrow' ? Number(item.borrowRatePerDay || 0) : Number(item.price || 0);
      if (effectivePrice <= maxBudgetUsd + 2) score += 2;
      else score -= 1;
    }

    return { item, score };
  });

  const matched = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  const suggestedOccasion = q.includes('traditional')
    ? 'Traditional Day'
    : q.includes('fest')
      ? 'College Fests'
      : q.includes('interview') || q.includes('placement')
        ? 'Placement & Interviews'
        : q.includes('farewell') || q.includes('prom')
          ? 'Farewell & Prom'
          : q.includes('lab') || q.includes('practical')
            ? 'Lab Practicals'
            : q.includes('hackathon')
              ? 'Hackathons'
              : undefined;

  const suggestedCategory =
    q.includes('outfit') || q.includes('kurta') || q.includes('blazer') || q.includes('dress')
      ? 'Clothing & Outfits'
      : q.includes('calc') || q.includes('laptop') || q.includes('electronic')
        ? 'Electronics & Gadgets'
        : q.includes('lab') || q.includes('coat')
          ? 'Lab & Studio Equipment'
          : q.includes('book') || q.includes('textbook')
            ? 'Books & Academics'
            : undefined;

  const borrowOrBuyTip =
    q.includes('fest') ||
    q.includes('traditional') ||
    q.includes('exam') ||
    q.includes('midterm') ||
    q.includes('interview')
      ? 'Borrowing from a verified peer for short events saves up to 80% compared to buying new.'
      : 'Check both daily borrow options and pre-owned sales to maximize semester value.';

  const chosen = matched.length > 0 ? matched.slice(0, 4) : availableItems.slice(0, 3);

  return {
    interpretation:
      matched.length > 0
        ? `Matched ${matched.length} campus listing${matched.length > 1 ? 's' : ''} for "${query}".`
        : `Showing top campus reuse picks related to "${query}".`,
    suggestedItemIds: chosen.map((i: any) => i.id),
    suggestedOccasion,
    suggestedCategory,
    borrowOrBuyTip,
  };
}

/**
 * Endpoint: POST /api/mivra/chat
 * Natural language chat with Mivra the campus assistant
 */
app.post('/api/mivra/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], activeItems = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const catalogSnippet = Array.isArray(activeItems)
      ? activeItems.slice(0, 15).map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          dealType: item.dealType,
          price: item.price,
          borrowRate: item.borrowRatePerDay,
          condition: item.condition,
          hostel: item.seller?.hostel || item.campusLocation,
          occasion: item.occasionTags?.[0] || 'General',
        }))
      : [];

    if (!ai || Date.now() < quotaCooldownUntil) {
      const local = localNaturalSearch(message, activeItems);
      res.json({
        reply: `Hi! I'm Mivra, your Velora campus reuse assistant. ${local.interpretation} ${local.borrowOrBuyTip}\n\nCheck out the matched campus listings below, or post on the Wanted Board if you need a specific peer to lend an item.`,
        suggestedItemIds: local.suggestedItemIds.slice(0, 2),
      });
      return;
    }

    const systemInstruction = `You are Mivra, the AI assistant for Velora: an eco-friendly campus reuse marketplace for college students.
Your personality is warm, clever, eco-conscious, and student-savvy.
You help college students buy, sell, borrow, lend, and exchange second-hand books, electronics, occasion outfits (college fests, farewell, traditional days, presentations), lab kits, and dorm essentials.

Here is a summary of active marketplace listings currently available on campus:
${JSON.stringify(catalogSnippet)}

Instructions:
1. Provide a direct, helpful, friendly answer in 2-3 short paragraphs.
2. Emphasize why borrowing or buying second-hand is great for students (saving money, avoiding single-use fest waste, reducing campus carbon footprint).
3. If any items in the catalog match the user's intent, mention them specifically.
4. Always end your response with a JSON block on a new line in the exact format:
###MATCHES###
{"itemIds": ["id1", "id2"]}
Only include valid item IDs from the provided catalog that match well. If none match, return {"itemIds": []} and recommend posting a request on the Wanted Board.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: contents as any,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const fullText = response.text || '';
    let reply = fullText;
    let suggestedItemIds: string[] = [];

    if (fullText.includes('###MATCHES###')) {
      const parts = fullText.split('###MATCHES###');
      reply = parts[0].trim();
      try {
        const jsonMatch = parts[1].trim();
        const parsed = JSON.parse(jsonMatch);
        if (Array.isArray(parsed.itemIds)) {
          suggestedItemIds = parsed.itemIds;
        }
      } catch {
        // Fallback parsing
      }
    }

    res.json({ reply, suggestedItemIds });
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/chat', error);
    const { message = '', activeItems = [] } = req.body || {};
    const local = localNaturalSearch(message, activeItems);
    res.json({
      reply: `Hi! I'm Mivra, your campus reuse assistant. ${local.interpretation} ${local.borrowOrBuyTip}`,
      suggestedItemIds: local.suggestedItemIds.slice(0, 2),
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/generate-listing
 * AI-assisted listing generator for students
 */
app.post('/api/mivra/generate-listing', async (req: Request, res: Response) => {
  try {
    const { rawNotes, category, condition, dealType } = req.body;

    if (!rawNotes || typeof rawNotes !== 'string') {
      res.status(400).json({ error: 'Item notes or description is required' });
      return;
    }

    const fallbackListing = {
      title: rawNotes.slice(0, 50) || 'Pre-owned Student Item',
      description: `${rawNotes}\n\nPre-owned by a fellow student. Clean, working, and ready for campus reuse. Available for safe handover at the Student Center or Library quad.`,
      suggestedPrice: dealType === 'free' ? 0 : 25,
      borrowRatePerDay: dealType === 'borrow' ? 3 : 0,
      tags: [category || 'General', condition || 'Good', 'Campus Reuse', 'Student Special'],
      occasion: category === 'Clothing & Outfits' ? 'College Fests' : 'Everyday',
      estimatedImpact: {
        co2Kg: 8.5,
        wasteKg: 1.2,
        moneySaved: 40,
      },
    };

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(fallbackListing);
      return;
    }

    const prompt = `As Mivra, generate a compelling, honest, student-friendly marketplace listing based on the student's input:
Item Notes: "${rawNotes}"
Category: "${category || 'General'}"
Condition: "${condition || 'Good'}"
Deal Type: "${dealType || 'sell'}" (Options: sell, borrow, lend, free, exchange)

Generate a JSON object with:
- "title": A clear, attractive product title (under 60 characters)
- "description": A concise, engaging description (1-2 paragraphs) mentioning condition, included accessories or features, why it's great for campus life, and a reminder about safe campus handover.
- "suggestedPrice": A reasonable student resale price in USD (integer, 0 if free)
- "borrowRatePerDay": Suggested daily borrow rate in USD if dealType is borrow/lend (integer or 0 if free)
- "tags": Array of 3 to 5 relevant searchable keywords/tags
- "occasion": One of ["College Fests", "Traditional Day", "Farewell & Prom", "Placement & Interviews", "Lab Practicals", "Hackathons", "Everyday"]
- "estimatedImpact": { "co2Kg": number (estimated kg CO2 avoided by reusing), "wasteKg": number (estimated kg solid waste kept from landfill), "moneySaved": number (estimated dollars saved compared to buying brand new) }

Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    res.json(parsed);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/generate-listing', error);
    const { rawNotes = '', category = 'General', dealType = 'borrow' } = req.body || {};
    res.json({
      title: rawNotes.slice(0, 50) || 'Pre-owned Student Item',
      description: `${rawNotes}\n\nPre-owned by a fellow student. Clean, working, and ready for campus reuse. Available for safe handover at the Student Center or Library quad.`,
      suggestedPrice: dealType === 'free' ? 0 : 25,
      borrowRatePerDay: dealType === 'borrow' ? 3 : 0,
      tags: [category || 'General', 'Campus Reuse', 'Student Special'],
      occasion: category === 'Clothing & Outfits' ? 'College Fests' : 'Everyday',
      estimatedImpact: {
        co2Kg: 8.5,
        wasteKg: 1.2,
        moneySaved: 40,
      },
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/smart-match
 * Mivra Smart Match for students with specific needs, budgets & occasions
 */
app.post('/api/mivra/smart-match', async (req: Request, res: Response) => {
  try {
    const { needQuery, occasion, budget, category, availableItems = [] } = req.body;

    if (!needQuery) {
      res.status(400).json({ error: 'Need query is required' });
      return;
    }

    const cacheKey = `smart-match:${needQuery.toLowerCase().trim()}:${occasion || ''}:${budget || ''}:${category || ''}:${availableItems.length}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const buildFallback = () => {
      const local = localNaturalSearch(needQuery, availableItems);
      const matchedItems = availableItems.filter((item: any) =>
        local.suggestedItemIds.includes(item.id)
      );
      const list = matchedItems.length > 0 ? matchedItems : availableItems.slice(0, 3);
      return {
        summary: `Found top campus matches for "${needQuery}". Reusing within campus saves you time and cuts down on shipping emissions!`,
        matches: list.slice(0, 3).map((item: any, idx: number) => ({
          itemId: item.id,
          matchScore: 95 - idx * 4,
          recommendationReason: `Strong peer listing in ${item.category} suited to your request and campus pickup.`,
          recommendedMode:
            item.dealType === 'borrow'
              ? 'Borrowing is best for temporary use'
              : 'Direct student purchase',
        })),
      };
    };

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(buildFallback());
      return;
    }

    const itemsSummary = availableItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      dealType: item.dealType,
      price: item.price,
      borrowRate: item.borrowRatePerDay,
      condition: item.condition,
      occasionTags: item.occasionTags,
      hostel: item.seller?.hostel,
    }));

    const prompt = `Student Request:
- What they need: "${needQuery}"
- Specific Occasion: "${occasion || 'Any'}"
- Budget limit: "${budget ? '$' + budget : 'Flexible'}"
- Category: "${category || 'Any'}"

Available campus inventory:
${JSON.stringify(itemsSummary)}

Task:
Analyze which items from the campus inventory best fulfill this student's need. Consider occasion, budget, condition, and whether borrowing vs buying is smarter.
Return a JSON object with:
{
  "summary": "Brief 1-2 sentence explanation of your recommendations for this student",
  "matches": [
    {
      "itemId": "id of the item",
      "matchScore": number (1 to 100),
      "recommendationReason": "1 concise sentence explaining why this item is a great match",
      "recommendedMode": "Buy / Borrow recommendation and why"
    }
  ]
}
Return up to 4 top matches ordered by matchScore descending. If none match well, return an empty array for matches and explain in summary.
Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/smart-match', error);
    const { needQuery = '', availableItems = [] } = req.body || {};
    const local = localNaturalSearch(needQuery, availableItems);
    const matchedItems = (availableItems || []).filter((item: any) =>
      local.suggestedItemIds.includes(item.id)
    );
    const list = matchedItems.length > 0 ? matchedItems : (availableItems || []).slice(0, 3);
    res.json({
      summary: `Found top campus matches for "${needQuery}". Reusing within campus saves you time and cuts down on shipping emissions!`,
      matches: list.slice(0, 3).map((item: any, idx: number) => ({
        itemId: item.id,
        matchScore: 95 - idx * 4,
        recommendationReason: `Peer listing in ${item.category} matching your campus request.`,
        recommendedMode:
          item.dealType === 'borrow'
            ? 'Borrowing is best for temporary use'
            : 'Direct student purchase',
      })),
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/natural-search
 * Interprets natural language search queries and matches marketplace items
 */
app.post('/api/mivra/natural-search', async (req: Request, res: Response) => {
  try {
    const { query, availableItems = [] } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const cacheKey = `natural-search:${query.toLowerCase().trim()}:${availableItems.length}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(localNaturalSearch(query, availableItems));
      return;
    }

    const itemsSummary = availableItems.map((i: any) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      price: i.price,
      borrowRate: i.borrowRatePerDay,
      occasionTags: i.occasionTags,
      dealType: i.dealType,
    }));

    const prompt = `As Mivra, analyze this student's natural language request: "${query}".
Campus inventory:
${JSON.stringify(itemsSummary)}

Interpret their intent:
1. What category, occasion, and max budget are they implying? (Handle both USD $ and INR ₹500 ≈ $6–$15 range).
2. Which item IDs from the inventory match best?
Return a JSON object:
{
  "interpretation": "A friendly 1-sentence note explaining what Mivra understood",
  "suggestedItemIds": ["id1", "id2"],
  "suggestedOccasion": "optional matching occasion from [College Fests, Traditional Day, Placement & Interviews, Farewell & Prom, Lab Practicals, Hackathons, Everyday]",
  "suggestedCategory": "optional matching category",
  "borrowOrBuyTip": "Short advice on whether borrowing or buying makes sense for this request"
}
Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    const normalized = {
      interpretation:
        parsed.interpretation || `Showing campus recommendations for "${query}".`,
      suggestedItemIds: Array.isArray(parsed.suggestedItemIds) ? parsed.suggestedItemIds : [],
      suggestedOccasion: VALID_OCCASIONS.has(parsed.suggestedOccasion)
        ? parsed.suggestedOccasion
        : undefined,
      suggestedCategory: VALID_CATEGORIES.has(parsed.suggestedCategory)
        ? parsed.suggestedCategory
        : undefined,
      borrowOrBuyTip: parsed.borrowOrBuyTip,
    };

    setCachedResponse(cacheKey, normalized);
    res.json(normalized);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/natural-search', error);
    const { query = '', availableItems = [] } = req.body || {};
    res.json({
      ...localNaturalSearch(query, availableItems),
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/borrow-or-buy-advisor
 * Mivra AI Advisor analyzing intended use, frequency, and budget to advise Borrow vs Buy
 */
app.post('/api/mivra/borrow-or-buy-advisor', async (req: Request, res: Response) => {
  try {
    const { itemName, intendedUsage, frequency, budget, estimatedPrice, estimatedBorrowRate } =
      req.body;

    if (!itemName) {
      res.status(400).json({ error: 'Item name is required' });
      return;
    }

    const cacheKey = `advisor:${itemName.toLowerCase().trim()}:${intendedUsage || ''}:${frequency || ''}:${budget || ''}:${estimatedPrice || ''}:${estimatedBorrowRate || ''}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const buildLocalAdvice = () => {
      const isTemporary =
        intendedUsage?.toLowerCase().includes('fest') ||
        intendedUsage?.toLowerCase().includes('interview') ||
        intendedUsage?.toLowerCase().includes('presentation') ||
        intendedUsage?.toLowerCase().includes('exam') ||
        intendedUsage?.toLowerCase().includes('weekend') ||
        frequency === 'One-time (1-3 days)';

      const rec = isTemporary ? 'borrow' : 'buy';

      return {
        recommendation: rec,
        confidence: 94,
        headline:
          rec === 'borrow'
            ? `Borrowing is 80%+ cheaper for your ${intendedUsage || 'upcoming event'}!`
            : `Buying pre-owned gives you better long-term campus value!`,
        detailedAnalysis:
          rec === 'borrow'
            ? `Since you only need this item for ${frequency || 'a short event'}, paying a daily rate of ~$${estimatedBorrowRate || 3} is far more economical than spending $${estimatedPrice || 35} on a permanent purchase that would sit idle in your dorm.`
            : `Because you will be using this across multiple semesters, buying an authenticated pre-owned copy on campus saves upfront cost while retaining resale value for juniors next year.`,
        financialBreakdown: {
          borrowCost: (estimatedBorrowRate || 3) * 3,
          buyCost: estimatedPrice || 30,
          netSavings: Math.max(10, (estimatedPrice || 30) - (estimatedBorrowRate || 3) * 3),
        },
        sustainabilityInsight: `Reusing through campus borrowing prevents raw fabric & electronic manufacturing emissions and stops packaging waste.`,
        peerTip:
          rec === 'borrow'
            ? 'Arrange the handover at the Student Union 1 day before your event so you can verify the fit or test the battery!'
            : 'Keep the item in good condition so you can relist it on Velora when your course ends!',
      };
    };

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(buildLocalAdvice());
      return;
    }

    const prompt = `As Mivra, provide an expert "Borrow-or-Buy Advisor" recommendation for a college student:
Item: "${itemName}"
Intended Use: "${intendedUsage || 'Not specified'}"
Frequency of Use: "${frequency || 'Uncertain'}"
Student Budget: "${budget ? '$' + budget : 'Flexible'}"
Estimated Resale Price: $${estimatedPrice || 30}
Estimated Daily Borrow Rate: $${estimatedBorrowRate || 3}/day

Evaluate:
1. Is borrowing or buying smarter financially and practically for campus life?
2. Compare the costs (e.g. 3-day borrow vs one-time purchase).
3. Highlight the environmental sustainability gain.
4. Provide a peer campus handover tip.

Return a JSON object:
{
  "recommendation": "borrow" or "buy",
  "confidence": number (80 to 99),
  "headline": "Catchy 1-sentence verdict",
  "detailedAnalysis": "2 concise paragraphs explaining the logic",
  "financialBreakdown": {
    "borrowCost": number,
    "buyCost": number,
    "netSavings": number
  },
  "sustainabilityInsight": "1-2 sentences on CO2 and waste reduction",
  "peerTip": "Practical advice for the campus exchange"
}
Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/borrow-or-buy-advisor', error);
    const { estimatedPrice = 35, estimatedBorrowRate = 3 } = req.body || {};
    res.json({
      recommendation: 'borrow',
      confidence: 90,
      headline: 'Borrowing is recommended for single-event needs on campus!',
      detailedAnalysis:
        'Borrowing allows you to access this item for your immediate need without tying up student funds in depreciating gear.',
      financialBreakdown: {
        borrowCost: Number(estimatedBorrowRate) * 3,
        buyCost: Number(estimatedPrice),
        netSavings: Math.max(10, Number(estimatedPrice) - Number(estimatedBorrowRate) * 3),
      },
      sustainabilityInsight: 'Reusing within your dorm network prevents new consumer waste.',
      peerTip: 'Inspect before handover at a verified campus meetup zone.',
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/draft-wanted-post
 * Conversational Wanted Board: converts natural student text into a structured wanted post
 */
app.post('/api/mivra/draft-wanted-post', async (req: Request, res: Response) => {
  try {
    const { conversationalText } = req.body;
    if (!conversationalText || typeof conversationalText !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const buildLocalDraft = () => ({
      title: conversationalText.slice(0, 50),
      description: conversationalText,
      category: conversationalText.toLowerCase().includes('calc')
        ? 'Electronics & Gadgets'
        : conversationalText.toLowerCase().includes('kurta') ||
            conversationalText.toLowerCase().includes('outfit')
          ? 'Clothing & Outfits'
          : 'Books & Academics',
      urgency:
        conversationalText.toLowerCase().includes('urgent') ||
        conversationalText.toLowerCase().includes('tomorrow')
          ? 'urgent'
          : 'this-week',
      needByDate: 'This Friday',
      maxBudget: 20,
      dealTypePreference: 'borrow',
      occasion: conversationalText.toLowerCase().includes('fest') ? 'College Fests' : 'Everyday',
    });

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(buildLocalDraft());
      return;
    }

    const prompt = `Convert this conversational student request into a structured campus Wanted Board post:
Request: "${conversationalText}"

Generate a JSON object:
{
  "title": "Clear concise wanted title (under 55 chars)",
  "description": "Clear polite description explaining what is needed and when",
  "category": "One of: Books & Academics, Electronics & Gadgets, Clothing & Outfits, Lab & Studio Equipment, Dorm & Living, Bicycles & Mobility",
  "urgency": "One of: urgent, this-week, flexible",
  "needByDate": "Short timeframe string (e.g. 'Tomorrow 9 AM', 'Friday Fest Night', 'Next Monday')",
  "maxBudget": integer number in USD,
  "dealTypePreference": "One of: borrow, sell, any",
  "occasion": "One of: College Fests, Traditional Day, Placement & Interviews, Farewell & Prom, Lab Practicals, Hackathons, Everyday"
}
Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    res.json(parsed);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/draft-wanted-post', error);
    const { conversationalText = '' } = req.body || {};
    res.json({
      title: conversationalText.slice(0, 45) || 'Looking for course gear',
      description: conversationalText,
      category: 'Books & Academics',
      urgency: 'this-week',
      needByDate: 'Within 2 days',
      maxBudget: 15,
      dealTypePreference: 'any',
      occasion: 'Everyday',
      ...status,
    });
  }
});

/**
 * Endpoint: POST /api/mivra/sustainability-advisor
 * Explains lifecycle benefits of reuse and provides personalized green campus habits
 */
app.post('/api/mivra/sustainability-advisor', async (req: Request, res: Response) => {
  try {
    const { itemCategory, query } = req.body;

    const cacheKey = `eco:${(query || itemCategory || 'general').toLowerCase().trim()}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const fallbackEco = {
      title: 'Campus Circular Economy Impact',
      carbonBenefit: 'Passing an item between college peers cuts manufacturing footprint by ~85%.',
      tips: [
        'Borrow formal attire for single-day fests instead of buying synthetic fast-fashion.',
        'Resell or pass down textbooks at the end of each semester before moving dorms.',
        'Share lab coats and specialized engineering tools across different semester cohorts.',
      ],
      equivalentMetric:
        'Estimated to save ~18kg of carbon emissions and keep ~1.5kg of plastics out of landfills.',
    };

    if (!ai || Date.now() < quotaCooldownUntil) {
      res.json(fallbackEco);
      return;
    }

    const prompt = `As Mivra, provide practical, motivating sustainability advice for a college student:
Topic: "${query || itemCategory || 'Campus circular reuse'}"

Generate a JSON object:
{
  "title": "Engaging title for the eco advice",
  "carbonBenefit": "1-2 sentences on lifecycle emissions prevented by reusing this item type",
  "tips": [
    "Practical actionable tip 1 for college students",
    "Practical actionable tip 2",
    "Practical actionable tip 3"
  ],
  "equivalentMetric": "A relatable real-world comparison (e.g. Estimated equivalent to planting 2 trees or sparing 100 plastic bottles)"
}
Return ONLY valid JSON.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const parsed = parseJsonSafe(response.text);
    setCachedResponse(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    const status = handleGeminiFailure('/api/mivra/sustainability-advisor', error);
    res.json({
      title: 'Smart Campus Reuse Advice',
      carbonBenefit:
        'Reusing gear on campus preserves natural resources and prevents landfill dumping.',
      tips: [
        'Borrow occasion clothing instead of single-wear purchases.',
        'Opt for pre-owned textbooks and scientific calculators.',
        'Clean and hand over items at designated campus spots.',
      ],
      equivalentMetric: 'Estimated ~12kg of CO2 emissions offset per student exchange.',
      ...status,
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vitePromise = (async () => {
      const { createServer } = await import('vite');
      return createServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        },
        appType: 'spa',
      });
    })();

    // Prevent unhandled rejection warning if Vite fails during startup
    vitePromise.catch((err) => {
      console.error('Failed to initialize Vite middleware:', err);
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Velora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
