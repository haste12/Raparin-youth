import { NextResponse } from 'next/server';

// ─── In-memory translation cache (persists across requests in the same process) ─
const translationCache = new Map();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Models to try in order — each has separate free quota
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

/**
 * Extract readable text from HTML by pulling text from <p> tags
 * or stripping all tags as fallback.
 */
function htmlToPlainText(html) {
  const pMatches = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) pMatches.push(text);
  }
  if (pMatches.length > 0) return pMatches.join('\n\n');
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Translate using Gemini API — tries multiple models.
 */
async function translateWithGemini(text) {
  const prompt = `Translate the following Kurdish (Sorani) text to English. Return ONLY the translated text, no explanation, no commentary, no markdown:\n\n${text}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
  });

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(geminiUrl(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.status === 429) continue;
      if (!res.ok) continue;

      const data = await res.json();
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (translated) return translated;
    } catch {
      continue;
    }
  }

  return null; // all models failed
}

/**
 * Fallback: Google Translate (free, no API key).
 */
async function googleTranslate(text) {
  const MAX_CHUNK = 1500;
  const chunks = [];

  if (text.length <= MAX_CHUNK) {
    chunks.push(text);
  } else {
    const paragraphs = text.split(/\n\n+/);
    let current = '';
    for (const para of paragraphs) {
      if (current && (current.length + para.length + 2) > MAX_CHUNK) {
        chunks.push(current);
        current = para;
      } else {
        current = current ? current + '\n\n' + para : para;
      }
    }
    if (current) chunks.push(current);
  }

  const translatedChunks = [];
  for (const chunk of chunks) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ku&tl=en&dt=t&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);
    const data = await res.json();
    translatedChunks.push(data[0].map((seg) => seg[0]).join(''));
  }

  return translatedChunks.join('\n\n');
}

/**
 * Translate text — tries Gemini first (better quality), falls back to Google Translate.
 * Handles both plain text and HTML content.
 */
async function translateText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;

  const trimmed = text.trim();
  if (translationCache.has(trimmed)) return translationCache.get(trimmed);

  const isHTML = /<[a-z][\s\S]*>/i.test(trimmed);
  const toTranslate = isHTML ? htmlToPlainText(trimmed) : trimmed;

  // Try Gemini first (better quality)
  let translated = GEMINI_API_KEY ? await translateWithGemini(toTranslate) : null;

  // Fallback to Google Translate
  if (!translated) {
    translated = await googleTranslate(toTranslate);
  }

  translationCache.set(trimmed, translated);
  return translated;
}

// ─── POST /api/translate ──────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { texts } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid "texts" array' },
        { status: 400 }
      );
    }

    if (texts.length > 20) {
      return NextResponse.json(
        { error: 'Too many texts. Maximum 20 per request.' },
        { status: 400 }
      );
    }

    const translations = await Promise.all(
      texts.map((t) => translateText(t))
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('Translation error:', err.message);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
