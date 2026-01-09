import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Moon, Users } from 'lucide-react';
// import { ConnectionStatus } from '../components/ConnectionStatus';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4 backdrop-blur-sm border border-white/10">
                    <Moon className="w-12 h-12 text-blood-red" />
                </div>
                <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-lg">
                    Schattenrudel
                </h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto font-light">
                    Die hybride Werwolf-Revolution.
                    <br />
                    Kein Schummeln. Keine Wartezeiten.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button
                    size="lg"
                    onClick={() => navigate('/create')}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Moon className="w-5 h-5" />
                    Spiel erstellen
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/join')}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Users className="w-5 h-5" />
                    Beitreten
                </Button>
            </div>

            <div className="absolute bottom-6 flex flex-col items-center gap-2">
                {/* <ConnectionStatus /> */}
                <div className="text-xs text-gray-600 font-mono">
                    v0.1.0 • Alpha Build
                </div>
            </div>
        </div>
    );
}
