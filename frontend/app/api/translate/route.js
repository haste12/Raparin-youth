import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * POST /api/translate
 * Body: { texts: string[], targetLang: 'en' | 'ku', sourceLang: 'ku' | 'en' }
 * Returns: { translations: string[] }
 *
 * Uses Gemini API to translate content on the fly.
 * Implements an in-memory server cache to avoid repeated translations.
 */

// In-memory cache for translations spanning across requests in the worker.
// Format: "sourceLang:targetLang:text" -> "translatedText"
const translationCache = new Map();

// Initialize the Gemini API client lazily to avoid crashing if the API key is missing at boot.
let ai = null;

function getAiClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
      return null;
    }
    try {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return ai;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { texts, targetLang, sourceLang = 'ku' } = body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 });
    }
    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    const aiClient = getAiClient();
    if (!aiClient) {
      console.error('Gemini API is not configured or missing key.');
      // If API fails or is not configured, we just return the original text as fallback.
      return NextResponse.json({ translations: texts });
    }

    // Translate each text piece
    const translations = await Promise.all(
      texts.map((text) => translateWithCache(aiClient, text, sourceLang, targetLang))
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('[/api/translate] Error parsing request or API failure:', err);
    // In case of a hard crash in handling the request, return original texts
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function translateWithCache(aiClient, text, sourceLang, targetLang) {
  // If text is empty or simply whitespace, return it as is.
  if (!text || !text.trim()) return text;

  // 1. Check in-memory cache
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Basic detection if text contains HTML so we can instruct the model appropriately.
    const isHtml = /<[a-z][\s\S]*>/i.test(text);

    let prompt = `Translate the following ${sourceLang} text to ${targetLang}. `;
    if (isHtml) {
      prompt += 'The text contains HTML formatting. Preserve all HTML tags, structure, and attributes exactly as they are. ONLY translate the inner text content between tags. Do not output any markdown code blocks, just the translated HTML/text.\n\n';
    } else {
      prompt += 'Provide only the direct translation with no additional explanation, commentary, or markdown blocks.\n\n';
    }
    prompt += `Text to translate:\n${text}`;

    // 2. Call the Gemini API
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let translated = response.text;
    
    // 3. Post-process and Cache
    if (translated) {
      // Sometimes Gemini wraps output in markdown tags like ```html ... ``` or ``` ... ```
      // We should strip those out just in case.
      translated = translated.replace(/^```[a-z]*\s*\n/i, '').replace(/\n?```$/i, '').trim();

      // Ensure the translation isn't identical to the source unless it actually is untranslatable (e.g. just numbers)
      // Since it's Gemini, we trust it usually returns correct translation.
      translationCache.set(cacheKey, translated);
      return translated;
    }

    // Return original if no valid translation was returned
    return text;
  } catch (error) {
    console.error(`Gemini Translation Error for text [${text.substring(0, 30)}...]:`, error);
    // Return the original text so that the UI can gracefully fallback instead of crashing
    return text;
  }
}
