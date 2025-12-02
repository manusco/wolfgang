import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Moon, Users } from 'lucide-react';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

export function Landing() {
    const navigate = useNavigate();
    const { language } = useLanguageStore();
    const t = translations[language].landing;

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700 relative">
            <LanguageToggle />

            <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4 backdrop-blur-sm border border-white/10">
                    <Moon className="w-12 h-12 text-blood-red" />
                </div>
                <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                    {t.title}
                </h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto font-light">
                    {t.subtitle}
                    <br />
                    {t.description}
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button
                    size="lg"
                    onClick={() => navigate('/create')}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Moon className="w-5 h-5" />
                    {t.create}
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/join')}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    {t.join}
                </Button>
            </div>

            <div className="absolute bottom-6 flex flex-col items-center gap-2">
                <div className="text-xs text-gray-600 font-mono">
                    {t.version}
                </div>
            </div>
        </div>
    );
}
