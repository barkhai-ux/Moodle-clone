'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'en' | 'mn';

type Messages = Record<string, string | Messages>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getFromObject(obj: Messages, path: string): string | undefined {
  return path.split('.').reduce<any>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as any)[part];
    }
    return undefined;
  }, obj) as any;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    if (stored === 'en' || stored === 'mn') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    async function loadMessages() {
      try {
        const mod = await import(`@/locales/${locale}.json`);
        setMessages(mod.default || mod);
      } catch (e) {
        console.error('Failed to load locale messages', e);
        setMessages({});
      }
    }
    loadMessages();
  }, [locale]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    try {
      localStorage.setItem('locale', loc);
    } catch {}
  };

  const t = useMemo(() => {
    return (key: string, fallback?: string) => {
      const value = getFromObject(messages, key);
      if (typeof value === 'string') return value;
      return fallback ?? key;
    };
  }, [messages]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


