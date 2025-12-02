import { useLanguageStore } from '../../store/languageStore';
import { Button } from './Button';

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguageStore();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="fixed top-4 right-4 z-50 text-2xl hover:bg-white/10 w-12 h-12 rounded-full p-0 flex items-center justify-center transition-transform hover:scale-110"
            title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
        >
            {language === 'de' ? '🇩🇪' : '🇬🇧'}
        </Button>
    );
}
