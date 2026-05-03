export function LaverieAdminCardSkeleton() {
    return (
        <div
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative animate-pulse"
            aria-hidden="true"
        >
            {/* Image (h-40 = 160px, identique à la card réelle) */}
            <div className="w-full h-40 bg-slate-200 relative">
                {/* Faux badge statut + bouton détail en haut, pour matcher le layout */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <div className="h-6 w-24 bg-slate-300/70 rounded-full" />
                    <div className="h-8 w-8 bg-slate-300/70 rounded-xl" />
                </div>
            </div>

            {/* Contenu sous l'image */}
            <div className="p-4">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
        </div>
    );
}

export function LaverieAdminListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="Chargement des laveries…">
            {Array.from({ length: count }).map((_, i) => (
                <LaverieAdminCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Liste des utilisateurs (admin/gestion-utilisateurs) ──────────────────────

export function UtilisateurAdminCardSkeleton() {
    return (
        <div
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-pulse"
            aria-hidden="true"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Bloc avatar + infos texte */}
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                        <div className="h-6 w-20 bg-slate-200 rounded-full mt-2" />
                    </div>
                </div>

                {/* Bloc latéral "laveries" — visible parfois, on le simule pour le rythme visuel */}
                <div className="w-48 hidden md:block border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
            </div>
        </div>
    );
}

export function UtilisateurAdminListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Chargement des utilisateurs…">
            {Array.from({ length: count }).map((_, i) => (
                <UtilisateurAdminCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Détail laverie (admin/laveries/{id}) ─────────────────────────────────────

export function LaverieAdminDetailSkeleton() {
    return (
        <div
            className="w-full mx-auto bg-gray-50 min-h-screen font-sans relative pb-10"
            aria-busy="true"
            aria-label="Chargement du détail de la laverie…"
        >
            {/* Header image */}
            <div className="relative h-64 bg-slate-200 w-full overflow-hidden animate-pulse" />

            {/* Carte blanche arrondie */}
            <div className="relative bg-white rounded-t-[2.5rem] px-6 pt-12 pb-8 -mt-10 shadow-lg min-h-screen">
                {/* Bulle icône en haut au centre */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-200 rounded-full animate-pulse border border-gray-100" />

                {/* Nom + badge statut */}
                <div className="text-start mb-6 mt-2 space-y-3">
                    <div className="h-7 bg-slate-200 rounded w-1/2 animate-pulse" />
                    <div className="h-7 w-24 bg-slate-100 rounded-full animate-pulse" />
                </div>

                {/* Adresse + description (2 colonnes) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                    </div>
                </div>

                {/* Images (scroll horizontal) */}
                <div className="mb-8">
                    <div className="h-4 bg-slate-200 rounded w-20 mb-4 animate-pulse" />
                    <div className="flex gap-3 overflow-hidden pb-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="w-24 h-24 rounded-2xl bg-slate-200 shrink-0 animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* Equipements + Horaires (2 colonnes) */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                        <div className="space-y-3">
                            <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                        <div className="space-y-3">
                            <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 mb-6" />

                {/* Commentaire */}
                <div className="h-28 bg-slate-100 rounded-xl mb-6 animate-pulse" />

                {/* Boutons accepter/refuser */}
                <div className="flex gap-4 mt-8">
                    <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// ─── Détail utilisateur (admin/utilisateurs/{id}) ─────────────────────────────

export function UtilisateurAdminDetailSkeleton() {
    return (
        <div
            className="w-full mx-auto bg-gray-50 min-h-screen font-sans relative pb-10"
            aria-busy="true"
            aria-label="Chargement du détail de l'utilisateur…"
        >
            {/* Header image */}
            <div className="relative h-56 bg-slate-200 w-full overflow-hidden animate-pulse" />

            {/* Carte blanche arrondie */}
            <div className="relative bg-white rounded-t-[3rem] px-6 pt-12 pb-8 -mt-12 shadow-lg min-h-screen">
                {/* Avatar rond */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-slate-200 rounded-[2rem] animate-pulse" />

                {/* Nom + badge statut */}
                <div className="text-start mb-6 mt-2 space-y-3">
                    <div className="h-7 bg-slate-200 rounded w-1/2 animate-pulse" />
                    <div className="h-8 w-28 bg-slate-100 rounded-full animate-pulse" />
                </div>

                {/* Bloc d'infos (prenom, nom, email, etc.) */}
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-2 flex-1">
                        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-2/5 animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-1/4 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-3/5 animate-pulse" />
                        <div className="h-3 bg-slate-100 rounded w-2/5 mt-3 animate-pulse" />
                    </div>
                </div>

                {/* Liste laveries — header + 3 cards */}
                <div className="mb-8">
                    <div className="h-4 bg-slate-200 rounded w-40 mb-4 animate-pulse" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-24 h-20 rounded-xl bg-slate-200 shrink-0 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                                    <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                                    <div className="h-5 bg-slate-100 rounded-full w-20 animate-pulse" />
                                </div>
                                <div className="w-9 h-9 bg-slate-200 rounded-xl shrink-0 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-200 mb-6" />

                {/* Commentaire */}
                <div className="h-28 bg-slate-100 rounded-2xl mb-6 animate-pulse" />

                {/* Boutons accepter/refuser */}
                <div className="flex gap-4">
                    <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
