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

  // Detect if the text contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  try {
    if (isHtml) {
      // For HTML content: strip tags, translate plain text, then we return translated plain text.
      // The structure/HTML tags come from the rich text editor and are layout-only;
      // translating the plain text is safest and avoids Google mangling the HTML attributes.
      const plainText = stripHtml(text);
      const translated = await callGoogleTranslateApi(plainText, targetLang, sourceLang);
      // Re-wrap in the original paragraph structure
      return rewrapInParagraphs(text, translated);
    } else {
      return await callGoogleTranslateApi(text, targetLang, sourceLang);
    }
  } catch {
    // Fallback: return original text if translation fails
    return text;
  }
}

/**
 * Core Google Translate API call.
 * Tries two endpoints: the mobile/m endpoint (reliable from cloud IPs) first,
 * then falls back to the gtx JSON endpoint.
 */
async function callGoogleTranslateApi(text, targetLang, sourceLang) {
  // Try the mobile endpoint first — it works reliably from cloud/Vercel IPs
  try {
    return await translateViaMobile(text, targetLang, sourceLang);
  } catch {
    // Fall back to gtx JSON endpoint
    return await translateViaGtx(text, targetLang, sourceLang);
  }
}

async function translateViaMobile(text, targetLang, sourceLang) {
  const params = new URLSearchParams({
    sl: sourceLang === 'auto' ? 'auto' : sourceLang,
    tl: targetLang,
    q: text,
  });
  const url = `https://translate.google.com/m?${params}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Mobile translate returned ${res.status}`);

  const html = await res.text();
  const match = html.match(/<div class="result-container">([\s\S]*?)<\/div>/);
  if (!match) throw new Error('Could not parse mobile translate response');

  return match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function translateViaGtx(text, targetLang, sourceLang) {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang,
    tl: targetLang,
    dt: 't',
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Google Translate returned ${res.status}`);

  const data = await res.json();
  return data[0]?.map((segment) => segment?.[0] ?? '').join('') ?? text;
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
