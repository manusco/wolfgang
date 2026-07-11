import { Outlet, Link } from 'react-router-dom';
import { ConnectionStatus } from './ConnectionStatus';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

// Self-contained fractal-noise texture as an inline SVG data URI. Replaces the
// former /noise.png reference, which 404'd because the asset was never shipped.
const NOISE_TEXTURE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Layout() {
    const { language } = useLanguageStore();
    const t = translations[language].legal;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#2D0A31] to-[#0F172A] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("${NOISE_TEXTURE}")` }}
            ></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>

            <main className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
                <Outlet />

                <footer className="mt-8 pt-6 pb-4 text-center">
                    <Link
                        to="/legal"
                        className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors"
                    >
                        {t.footerLink}
                    </Link>
                </footer>
            </main>

            <ConnectionStatus />
        </div>
    );
}
