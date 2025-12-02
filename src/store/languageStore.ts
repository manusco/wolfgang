import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'de' | 'en';

interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

/**
 * Detect browser language and return supported language code
 * Falls back to German if browser language is not supported
 */
function detectBrowserLanguage(): Language {
    // Get browser language (e.g., "en-US", "de-DE", "fr-FR")
    const browserLang = navigator.language.toLowerCase();

    // Check if it starts with supported language code
    if (browserLang.startsWith('en')) {
        return 'en';
    }

    // Default to German for all other languages
    return 'de';
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            // Auto-detect browser language on first visit
            language: detectBrowserLanguage(),
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () =>
                set((state) => ({ language: state.language === 'de' ? 'en' : 'de' })),
        }),
        {
            name: 'language-storage',
        }
    )
);
