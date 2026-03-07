'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

/**
 * Module-level translation cache.
 * Key: `${activityId}:en:${field}` → translated string
 * Survives component unmount/remount and language toggles.
 */
const translationCache = new Map();

/**
 * Checks whether an activity's English fields are identical to the Kurdish ones,
 * meaning the admin only filled in Kurdish and auto-translation is needed.
 */
function needsTranslation(activity) {
  return (
    !activity.titleEn ||
    activity.titleEn === activity.titleKu ||
    !activity.shortDescEn ||
    activity.shortDescEn === activity.shortDescKu
  );
}

/**
 * Returns a stable string key derived from the activities array contents.
 * Used as the dependency instead of the array reference (which changes every render).
 */
function getActivitiesKey(activities) {
  return activities.map((a) => `${a.id}:${a.updatedAt || a.createdAt || ''}`).join('|');
}

/**
 * useActivityTranslation
 *
 * Accepts an array of activities (or a single activity wrapped in an array).
 * Returns { translatedActivities, isTranslating }
 *
 * When lang === 'ku':  returns the original activities unchanged.
 * When lang === 'en':  returns activities with English fields populated,
 *                      either from cache or via a batched /api/translate call.
 */
export function useActivityTranslation(activities) {
  const { lang } = useLanguage();

  // Keep a ref to the latest activities so the effect body can read them
  // without listing the array itself as a dependency (avoids infinite loop).
  const activitiesRef = useRef(activities);
  activitiesRef.current = activities;

  const [translatedActivities, setTranslatedActivities] = useState(activities);
  const [isTranslating, setIsTranslating] = useState(false);

  // Stable key — only changes when the actual activity data changes (id / timestamp).
  // This is the real dependency, not the array reference.
  const activitiesKey = getActivitiesKey(activities);

  // Ref so async callbacks can check whether the language has changed mid-flight.
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const current = activitiesRef.current;

    // Kurdish: always use originals immediately — no async work needed.
    if (lang === 'ku') {
      setTranslatedActivities(current);
      return;
    }

    // English: check which activities actually need translation.
    const toTranslate = current.filter(needsTranslation);

    if (toTranslate.length === 0) {
      // All activities already have distinct English content — use as-is.
      setTranslatedActivities(current);
      return;
    }

    // Check cache first — if every activity that needs translation is already
    // cached we can resolve synchronously without showing a spinner.
    const allCached = toTranslate.every((act) =>
      translationCache.has(`${act.id}:en:title`)
    );

    if (allCached) {
      setTranslatedActivities(applyCache(current));
      return;
    }

    // At least one activity needs a network call.
    setIsTranslating(true);

    translateActivities(toTranslate)
      .then((results) => {
        // Store results in the module-level cache.
        results.forEach(({ id, title, shortDesc, content }) => {
          translationCache.set(`${id}:en:title`, title);
          translationCache.set(`${id}:en:shortDesc`, shortDesc);
          if (content !== undefined) {
            translationCache.set(`${id}:en:content`, content);
          }
        });

        // Only update state if the language hasn't changed while we were waiting.
        if (langRef.current === 'en') {
          setTranslatedActivities(applyCache(activitiesRef.current));
        }
        setIsTranslating(false);
      })
      .catch(() => {
        // Fallback: show Kurdish originals and stop the spinner.
        setIsTranslating(false);
      });

  // ⚠️  activitiesKey (not `activities`) is intentional — `activities` is a new
  //    array reference on every render, which would cause an infinite loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, activitiesKey]);

  return { translatedActivities, isTranslating };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Merge cached translations back into the activities array. */
function applyCache(activities) {
  return activities.map((act) => {
    if (!needsTranslation(act)) return act;
    return {
      ...act,
      titleEn:    translationCache.get(`${act.id}:en:title`)    ?? act.titleKu,
      shortDescEn: translationCache.get(`${act.id}:en:shortDesc`) ?? act.shortDescKu,
      contentEn:  translationCache.get(`${act.id}:en:content`)  ?? act.contentKu,
    };
  });
}

/**
 * Sends all activities that need translation in a single batched POST request.
 * Returns an array of { id, title, shortDesc, content? } resolved translations.
 */
async function translateActivities(activities) {
  const tasks = [];
  const offsets = [];

  activities.forEach((act) => {
    const base = tasks.length;
    tasks.push(act.titleKu || '');
    tasks.push(act.shortDescKu || '');
    const hasContent = !!act.contentKu;
    if (hasContent) tasks.push(act.contentKu);

    offsets.push({
      id: act.id,
      titleIdx:    base,
      shortDescIdx: base + 1,
      contentIdx:  hasContent ? base + 2 : null,
    });
  });

  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: tasks, targetLang: 'en', sourceLang: 'ku' }),
  });

  if (!res.ok) throw new Error('Translation API error');
  const { translations } = await res.json();

  return offsets.map(({ id, titleIdx, shortDescIdx, contentIdx }) => ({
    id,
    title:     translations[titleIdx]    ?? '',
    shortDesc: translations[shortDescIdx] ?? '',
    content:   contentIdx !== null ? translations[contentIdx] : undefined,
  }));
}
