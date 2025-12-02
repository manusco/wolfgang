import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';

export function HowToPlay() {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useLanguageStore();
    const t = translations[language];

    return (
        <div className="max-w-2xl mx-auto mb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors mx-auto"
            >
                <span className="text-sm">{t.landing.howToPlay.trigger}</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-3xl mb-2">🎭</div>
                        <h3 className="font-bold mb-2">{t.landing.howToPlay.roles.title}</h3>
                        <p className="text-sm text-gray-400">{t.landing.howToPlay.roles.description}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-3xl mb-2">🌙</div>
                        <h3 className="font-bold mb-2">{t.landing.howToPlay.night.title}</h3>
                        <p className="text-sm text-gray-400">{t.landing.howToPlay.night.description}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-3xl mb-2">☀️</div>
                        <h3 className="font-bold mb-2">{t.landing.howToPlay.day.title}</h3>
                        <p className="text-sm text-gray-400">{t.landing.howToPlay.day.description}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="text-3xl mb-2">🏆</div>
                        <h3 className="font-bold mb-2">{t.landing.howToPlay.victory.title}</h3>
                        <p className="text-sm text-gray-400">{t.landing.howToPlay.victory.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
