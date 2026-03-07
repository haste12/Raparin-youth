import { NextResponse } from 'next/server';

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: 'en' | 'ku', sourceLang?: string }
 * Returns: { translations: string[] }
 *
 * Uses LibreTranslate (open-source, self-hostable translation API).
 * Set LIBRETRANSLATE_URL and LIBRETRANSLATE_API_KEY in Vercel env vars.
 */

const LIBRE_URL = (process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com').replace(/\/$/, '');
const LIBRE_KEY = process.env.LIBRETRANSLATE_API_KEY || '';

// Fallback public instances tried in order if the primary fails
const FALLBACK_URLS = [
  'https://translate.fedilab.app',
  'https://lt.vern.cc',
];

export async function POST(request) {
  try {
    const { texts, targetLang } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 });
    }
    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    // Translate all texts in parallel
    const translations = await Promise.all(
      texts.map((text) => translateText(text, targetLang))
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('[/api/translate] Error:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

/**
 * Translate a single string. Strips HTML before translating, then
 * re-wraps in paragraph tags to preserve structure.
 */
async function translateText(text, targetLang) {
  if (!text || !text.trim()) return text;

  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  try {
    if (isHtml) {
      const plainText = stripHtml(text);
      const translated = await callLibreTranslate(plainText, targetLang);
      return rewrapInParagraphs(text, translated);
    } else {
      return await callLibreTranslate(text, targetLang);
    }
  } catch {
    // Fallback: return original text if all translation attempts fail
    return text;
  }
}

/**
 * Call LibreTranslate API.
 * Tries the primary instance first, then falls back to public mirrors.
 */
async function callLibreTranslate(text, targetLang) {
  const urls = [LIBRE_URL, ...FALLBACK_URLS];
  let lastError;

  for (const baseUrl of urls) {
    try {
      const body = {
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text',
      };
      // Only include api_key if set (public mirrors don't require it)
      if (LIBRE_KEY && baseUrl === LIBRE_URL) body.api_key = LIBRE_KEY;

      const res = await fetch(`${baseUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.status);
        throw new Error(`LibreTranslate ${baseUrl} returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      if (!data.translatedText) throw new Error('Empty response from LibreTranslate');
      return data.translatedText;
    } catch (err) {
      console.warn(`[translate] ${baseUrl} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Strip HTML tags to plain text, preserving paragraph breaks.
 */
function stripHtml(html) {
  return html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Re-wrap translated plain text into <p> tags matching the original structure.
 */
function rewrapInParagraphs(originalHtml, translatedText) {
  const pCount = (originalHtml.match(/<p[^>]*>/gi) || []).length;

  if (pCount <= 1) {
    return `<p>${translatedText.trim()}</p>`;
  }

  const paragraphs = translatedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return `<p>${translatedText.trim()}</p>`;

  return paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}

