import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#2D0A31] to-[#0F172A] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>

            <main className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}
