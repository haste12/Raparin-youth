'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';

// ─── Client-side translation cache (persists across re-renders & navigations) ─
const clientCache = new Map();

function getCached(text) {
  return text && clientCache.has(text) ? clientCache.get(text) : null;
}

function setCache(original, translated) {
  if (original && translated) {
    clientCache.set(original, translated);
  }
}

/**
 * Call /api/translate to translate an array of texts via Gemini.
 * Only sends texts that are NOT already cached.
 */
async function translateTexts(texts) {
  // Separate cached from uncached
  const results = new Array(texts.length);
  const uncachedIndices = [];
  const uncachedTexts = [];

  for (let i = 0; i < texts.length; i++) {
    const cached = getCached(texts[i]);
    if (cached) {
      results[i] = cached;
    } else if (texts[i] && texts[i].trim()) {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    } else {
      results[i] = texts[i];
    }
  }

  // If everything was cached, return immediately
  if (uncachedTexts.length === 0) return results;

  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: uncachedTexts }),
  });

  if (!res.ok) {
    throw new Error(`Translation API returned ${res.status}`);
  }

  const data = await res.json();
  const { translations } = data;

  // Populate results and cache
  for (let j = 0; j < uncachedIndices.length; j++) {
    const idx = uncachedIndices[j];
    const translated = translations[j] || texts[idx];
    results[idx] = translated;
    setCache(texts[idx], translated);
  }

  return results;
}

export function useActivityTranslation(activities) {
  const { lang } = useLanguage();
  const [translatedActivities, setTranslatedActivities] = useState(activities);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef(null);

  const translate = useCallback(async () => {
    if (lang === 'ku' || !activities || activities.length === 0) {
      setTranslatedActivities(activities);
      setIsTranslating(false);
      return;
    }

    // Collect all Kurdish texts that need translation
    const textsToTranslate = [];
    const fieldMap = []; // tracks which activity+field each text belongs to

    activities.forEach((act, i) => {
      const fields = [
        { key: 'titleEn', src: act.titleKu, existing: act.titleEn },
        { key: 'shortDescEn', src: act.shortDescKu, existing: act.shortDescEn },
        { key: 'contentEn', src: act.contentKu, existing: act.contentEn },
      ];
      fields.forEach(({ key, src, existing }) => {
        // Translate if: no English text, OR English text is identical to Kurdish (not actually translated)
        const needsTranslation = !existing || existing === src;
        if (needsTranslation && src && src.trim()) {
          textsToTranslate.push(src);
          fieldMap.push({ actIndex: i, field: key });
        }
      });
    });

    // If all fields already have English text, just use them
    if (textsToTranslate.length === 0) {
      setTranslatedActivities(
        activities.map((act) => ({
          ...act,
          titleEn: act.titleEn || act.titleKu,
          shortDescEn: act.shortDescEn || act.shortDescKu,
          contentEn: act.contentEn || act.contentKu,
        }))
      );
      setIsTranslating(false);
      return;
    }

    // Check if everything is already cached client-side
    const allCached = textsToTranslate.every((t) => getCached(t));
    if (!allCached) {
      setIsTranslating(true);
    }

    try {
      const translated = await translateTexts(textsToTranslate);

      // Build updated activities array
      const updated = activities.map((act) => ({ ...act }));
      fieldMap.forEach(({ actIndex, field }, j) => {
        updated[actIndex][field] = translated[j];
      });

      // Fill remaining fallbacks
      updated.forEach((act) => {
        act.titleEn = act.titleEn || act.titleKu;
        act.shortDescEn = act.shortDescEn || act.shortDescKu;
        act.contentEn = act.contentEn || act.contentKu;
      });

      setTranslatedActivities(updated);
    } catch (err) {
      console.error('Translation failed, falling back to Kurdish:', err.message);
      // Fallback: show Kurdish text if translation fails
      setTranslatedActivities(
        activities.map((act) => ({
          ...act,
          titleEn: act.titleEn || act.titleKu,
          shortDescEn: act.shortDescEn || act.shortDescKu,
          contentEn: act.contentEn || act.contentKu,
        }))
      );
    } finally {
      setIsTranslating(false);
    }
  }, [lang, activities]);

  useEffect(() => {
    translate();
  }, [translate]);

  return { translatedActivities, isTranslating };
}
