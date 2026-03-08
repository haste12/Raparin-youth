'use client';
import { useMemo } from 'react';
import { useLanguage } from '../LanguageContext';

export function useActivityTranslation(activities) {
  const { lang } = useLanguage();

  const translatedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return activities;
    return activities.map((act) => ({
      ...act,
      titleEn: act.titleEn || act.titleKu,
      shortDescEn: act.shortDescEn || act.shortDescKu,
      contentEn: act.contentEn || act.contentKu,
    }));
  }, [activities]);

  return { translatedActivities, isTranslating: false };
}
