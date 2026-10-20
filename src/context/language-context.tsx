"use client";

import * as React from "react";
import {
  Language,
  translations,
  TranslationStructure,
  formatCurrency as baseFormatCurrency,
  formatNumber as baseFormatNumber,
  toBengaliDigits as baseToBengaliDigits,
} from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  isBengali: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationStructure;
  formatCurrency: (
    amount: number | undefined | null,
    useBengaliDigits?: boolean,
  ) => string;
  formatNumber: (
    num: number | string | undefined | null,
    useBengaliDigits?: boolean,
  ) => string;
  toBengaliDigits: (input: number | string | undefined | null) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "lubriflow_lang";
const COOKIE_NAME = "lubriflow_lang";

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] =
    React.useState<Language>(initialLanguage);

  // Sync with client-side localStorage / Cookie on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "bn" || stored === "en") {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      } else {
        // Set default 'bn' if not present
        localStorage.setItem(STORAGE_KEY, "en");
        document.cookie = `${COOKIE_NAME}=en; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = "en";
      }
    } catch {
      // Storage access may fail in restricted iframes
    }
  }, []);

  const setLanguage = React.useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.cookie = `${COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLang;
    } catch {
      // Fail silently
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "bn" ? "en" : "bn");
  }, [language, setLanguage]);

  const t = translations[language];

  const formatCurrency = React.useCallback(
    (amount: number | undefined | null, useBengaliDigits: boolean = false) => {
      return baseFormatCurrency(amount, language, useBengaliDigits);
    },
    [language],
  );

  const formatNumber = React.useCallback(
    (
      num: number | string | undefined | null,
      useBengaliDigits: boolean = false,
    ) => {
      return baseFormatNumber(num, language, useBengaliDigits);
    },
    [language],
  );

  const toBengaliDigits = React.useCallback(
    (input: number | string | undefined | null) => {
      return baseToBengaliDigits(input);
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      language,
      isBengali: language === "bn",
      setLanguage,
      toggleLanguage,
      t,
      formatCurrency,
      formatNumber,
      toBengaliDigits,
    }),
    [
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatCurrency,
      formatNumber,
      toBengaliDigits,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
