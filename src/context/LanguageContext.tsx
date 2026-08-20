'use client';

import React, { createContext, useContext, useState } from 'react';

export type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language] = useState<Language>('en');

  const setLanguage = () => {};
  const toggleLanguage = () => {};

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', setLanguage: () => {}, toggleLanguage: () => {} };
  }
  return context;
};
