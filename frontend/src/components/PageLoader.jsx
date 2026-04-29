import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PageLoader() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const steps = [15, 35, 55, 70, 82, 90];
        const timers = steps.map((target, i) =>
            setTimeout(() => setProgress(target), i * 220)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden">

            {/* Barre de progression */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100 z-10">
                <div
                    className="h-full bg-[#14A8DE] transition-all duration-500 ease-out rounded-r-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Skeleton header */}
            <div className="h-16 bg-white border-b border-gray-100 px-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-28 h-4 rounded-full" />
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <Skeleton className="w-20 h-8 rounded-xl" />
                    <Skeleton className="w-20 h-8 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full sm:hidden" />
            </div>

            {/* Skeleton contenu */}
            <div className="w-full max-w-[1280px] mx-auto px-5 pt-6 space-y-5">

                {/* Barre de recherche */}
                <Skeleton className="w-full h-11 rounded-2xl" />

                {/* Carte */}
                <Skeleton className="w-full h-56 md:h-72 rounded-2xl" />

                {/* Titre section + lien */}
                <div className="flex items-center justify-between">
                    <Skeleton className="w-36 h-5 rounded-full" />
                    <Skeleton className="w-16 h-4 rounded-full" />
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 space-y-3 border border-gray-100 shadow-sm">
                            <Skeleton className="w-full h-36 rounded-xl" />
                            <Skeleton className="w-3/4 h-4 rounded-full" />
                            <Skeleton className="w-1/2 h-3 rounded-full" />
                            <div className="flex items-center gap-2 pt-1">
                                <Skeleton className="w-14 h-5 rounded-full" />
                                <Skeleton className="w-14 h-5 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badge marque en bas */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 24 30" fill="none">
                        <path d="M3 30C2.175 30 1.46875 29.7062 0.88125 29.1187C0.29375 28.5312 0 27.825 0 27V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V27C24 27.825 23.7062 28.5312 23.1187 29.1187C22.5312 29.7062 21.825 30 21 30H3ZM3 27H21V3H3V27ZM12 25.5C14.075 25.5 15.8437 24.7687 17.3062 23.3062C18.7687 21.8437 19.5 20.075 19.5 18C19.5 15.925 18.7687 14.1563 17.3062 12.6938C15.8437 11.2313 14.075 10.5 12 10.5C9.925 10.5 8.15625 11.2313 6.69375 12.6938C5.23125 14.1563 4.5 15.925 4.5 18C4.5 20.075 5.23125 21.8437 6.69375 23.3062C8.15625 24.7687 9.925 25.5 12 25.5ZM12 22.95C11.35 22.95 10.7187 22.8312 10.1062 22.5938C9.49375 22.3563 8.95 22 8.475 21.525L15.525 14.475C16 14.95 16.3563 15.4938 16.5938 16.1063C16.8312 16.7188 16.95 17.35 16.95 18C16.95 19.375 16.4688 20.5438 15.5063 21.5063C14.5438 22.4688 13.375 22.95 12 22.95ZM6 7.5C6.425 7.5 6.78125 7.35625 7.06875 7.06875C7.35625 6.78125 7.5 6.425 7.5 6C7.5 5.575 7.35625 5.21875 7.06875 4.93125C6.78125 4.64375 6.425 4.5 6 4.5C5.575 4.5 5.21875 4.64375 4.93125 4.93125C4.64375 5.21875 4.5 5.575 4.5 6C4.5 6.425 4.64375 6.78125 4.93125 7.06875C5.21875 7.35625 5.575 7.5 6 7.5ZM10.5 7.5C10.925 7.5 11.2813 7.35625 11.5688 7.06875C11.8563 6.78125 12 6.425 12 6C12 5.575 11.8563 5.21875 11.5688 4.93125C11.2813 4.64375 10.925 4.5 10.5 4.5C10.075 4.5 9.71875 4.64375 9.43125 4.93125C9.14375 5.21875 9 5.575 9 6C9 6.425 9.14375 6.78125 9.43125 7.06875C9.71875 7.35625 10.075 7.5 10.5 7.5Z" fill="#22ACE2" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-600">LaundryMap</span>
                    <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-[#14A8DE]"
                                style={{ animation: 'loader-dot 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes loader-dot {
                    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                    40%           { opacity: 1;   transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}
