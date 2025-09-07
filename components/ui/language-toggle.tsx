'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const isEnglish = locale === 'en';

  return (
    <div
      className="relative inline-flex h-9 w-28 items-center rounded-full border border-gray-300 bg-white shadow-sm p-0.5"
      role="group"
      aria-label="Language toggle"
    >
      {/* Active thumb */}
      <span
        className={`absolute left-0 top-0.5 bottom-0.5 h-[calc(100%-4px)] w-1/2 rounded-full bg-teal-600 shadow-sm transition-transform duration-200 ease-out ${
          isEnglish ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden="true"
      />

      <button
        type="button"
        className={`relative z-10 flex-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none ${
          isEnglish ? 'text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => setLocale('en')}
        aria-pressed={isEnglish}
      >
        EN
      </button>
      <button
        type="button"
        className={`relative z-10 flex-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none ${
          !isEnglish ? 'text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => setLocale('mn')}
        aria-pressed={!isEnglish}
      >
        MN
      </button>
    </div>
  );
}


