import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'de' | 'en';

interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: 'de', // Default to German
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () =>
                set((state) => ({ language: state.language === 'de' ? 'en' : 'de' })),
        }),
        {
            name: 'language-storage',
        }
    )
);
