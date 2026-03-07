import { NextResponse } from 'next/server';

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: 'en' | 'ku', sourceLang?: string }
 * Returns: { translations: string[] }
 *
 * Uses the Google Translate public endpoint (no API key required for low volume).
 * This is a server-side proxy so the translation logic lives on the server,
 * keeping client code clean and avoiding CORS issues.
 */
export async function POST(request) {
  try {
    const { texts, targetLang, sourceLang = 'auto' } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 });
    }
    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    // Map our internal lang codes to Google Translate lang codes
    const GT_LANG = { ku: 'ckb', en: 'en' };
    const gtTarget = GT_LANG[targetLang] || targetLang;
    const gtSource = sourceLang === 'auto' ? 'auto' : (GT_LANG[sourceLang] || sourceLang);

    // Translate each text individually so we can handle HTML fragments
    const translations = await Promise.all(
      texts.map((text) => translateText(text, gtTarget, gtSource))
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('[/api/translate] Error:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

/**
 * Calls the Google Translate public endpoint for a single string.
 * Handles both plain text and HTML (using &dt=t for text, or we strip tags).
 */
async function translateText(text, targetLang, sourceLang) {
  if (!text || !text.trim()) return text;

  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  try {
    if (isHtml) {
      const plainText = stripHtml(text);
      const translated = await callGoogleTranslateApi(plainText, targetLang);
      return rewrapInParagraphs(text, translated);
    } else {
      return await callGoogleTranslateApi(text, targetLang);
    }
  } catch {
    return text;
  }
}

/**
 * Core Google Translate API call.
 * Always uses 'auto' source detection (more reliable than named 'ckb' for Kurdish).
 * Tries three endpoints in order.
 */
async function callGoogleTranslateApi(text, targetLang) {
  // Try dict-chrome-ex JSON endpoint (works well from cloud IPs)
  try {
    return await translateViaDictChrome(text, targetLang);
  } catch { /* fall through */ }

  // Try the mobile HTML endpoint
  try {
    return await translateViaMobile(text, targetLang);
  } catch { /* fall through */ }

  // Last resort: gtx
  try {
    return await translateViaGtx(text, targetLang);
  } catch {
    return text; // return original if all fail
  }
}

async function translateViaDictChrome(text, targetLang) {
  const params = new URLSearchParams({
    client: 'dict-chrome-ex',
    sl: 'auto',
    tl: targetLang,
    dt: 't',
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`dict-chrome-ex returned ${res.status}`);
  const data = await res.json();
  const result = data[0]?.map((s) => s?.[0] ?? '').join('');
  if (!result) throw new Error('empty result');
  return result;
}

async function translateViaMobile(text, targetLang) {
  const params = new URLSearchParams({ sl: 'auto', tl: targetLang, q: text });
  const url = `https://translate.google.com/m?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`mobile returned ${res.status}`);
  const html = await res.text();
  // Try multiple possible class names Google uses
  const match =
    html.match(/<div class="result-container"[^>]*>([\s\S]*?)<\/div>/) ||
    html.match(/class="t0"[^>]*>([\s\S]*?)<\/div>/) ||
    html.match(/<div dir="(?:ltr|rtl)">([\s\S]*?)<\/div>/);
  if (!match) throw new Error('could not parse mobile response');
  return match[1]
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

async function translateViaGtx(text, targetLang) {
  const params = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: targetLang, dt: 't', q: text });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`gtx returned ${res.status}`);
  const data = await res.json();
  const result = data[0]?.map((s) => s?.[0] ?? '').join('');
  if (!result) throw new Error('empty result');
  return result;
}

/**
 * Strip HTML tags to get plain text, preserving paragraph breaks.
 */
function stripHtml(html) {
  // Replace </p> and <br> with newlines, then strip remaining tags
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
 * Takes the original HTML and the translated plain text, and reconstructs
 * HTML paragraphs matching the original paragraph count.
 */
function rewrapInParagraphs(originalHtml, translatedText) {
  // Count original <p> tags
  const pCount = (originalHtml.match(/<p[^>]*>/gi) || []).length;

  if (pCount <= 1) {
    return `<p>${translatedText.trim()}</p>`;
  }

  // Split the translated text into roughly equal paragraph chunks
  const paragraphs = translatedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return `<p>${translatedText.trim()}</p>`;

  return paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}
