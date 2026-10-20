'use client';

import * as React from 'react';
import { useLanguage } from '@/context/language-context';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

export function LanguageToggle({ className = '', variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm ${className}`}
        title={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
      >
        <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/60 shadow-inner ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          language === 'bn'
            ? 'bg-red-600 text-white shadow-sm font-semibold'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
        title="বাংলা ভাষা সক্রিয় করুন"
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-red-600 text-white shadow-sm font-semibold'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
