import { NextResponse } from 'next/server';

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: 'en' | 'ku' }
 * Returns: { translations: string[] }
 *
 * Uses MyMemory API — completely free, no API key required.
 * Fallback: Google Translate unofficial endpoints.
 */

export async function POST(request) {
  try {
    const { texts, targetLang } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 });
    }
    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    const translations = await Promise.all(
      texts.map((text) => translateText(text, targetLang))
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('[/api/translate] Error:', err);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function translateText(text, targetLang) {
  if (!text || !text.trim()) return text;

  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  try {
    if (isHtml) {
      const plainText = stripHtml(text);
      const translated = await callTranslateApi(plainText, targetLang);
      return rewrapInParagraphs(text, translated);
    } else {
      return await callTranslateApi(text, targetLang);
    }
  } catch {
    return text;
  }
}

/**
 * Tries MyMemory first (free, reliable from cloud IPs), then Google fallbacks.
 */
async function callTranslateApi(text, targetLang) {
  // 1. MyMemory — free, no key, works from Vercel
  try {
    return await translateViaMyMemory(text, targetLang);
  } catch { /* fall through */ }

  // 2. Google gtx fallback
  try {
    return await translateViaGtx(text, targetLang);
  } catch { /* fall through */ }

  // 3. Google dict-chrome-ex fallback
  try {
    return await translateViaDictChrome(text, targetLang);
  } catch {
    return text;
  }
}

async function translateViaMyMemory(text, targetLang) {
  // MyMemory uses ISO codes: Kurdish Sorani = 'ku', English = 'en'
  const langPair = `ku|${targetLang}`;
  const params = new URLSearchParams({ q: text, langpair: langPair });
  const url = `https://api.mymemory.translated.net/get?${params}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`MyMemory returned ${res.status}`);

  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(`MyMemory error: ${data.responseStatus}`);

  const result = data.responseData?.translatedText;
  if (!result || result === text) throw new Error('MyMemory returned no translation');

  return result;
}

async function translateViaGtx(text, targetLang) {
  const params = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: targetLang, dt: 't', q: text });
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`gtx returned ${res.status}`);
  const data = await res.json();
  const result = data[0]?.map((s) => s?.[0] ?? '').join('');
  if (!result) throw new Error('empty result');
  return result;
}

async function translateViaDictChrome(text, targetLang) {
  const params = new URLSearchParams({ client: 'dict-chrome-ex', sl: 'auto', tl: targetLang, dt: 't', q: text });
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`dict-chrome-ex returned ${res.status}`);
  const data = await res.json();
  const result = data[0]?.map((s) => s?.[0] ?? '').join('');
  if (!result) throw new Error('empty result');
  return result;
}

function stripHtml(html) {
  return html
    .replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .trim();
}

function rewrapInParagraphs(originalHtml, translatedText) {
  const pCount = (originalHtml.match(/<p[^>]*>/gi) || []).length;
  if (pCount <= 1) return `<p>${translatedText.trim()}</p>`;

  const paragraphs = translatedText.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return `<p>${translatedText.trim()}</p>`;
  return paragraphs.map((p) => `<p>${p}</p>`).join('\n');
}


