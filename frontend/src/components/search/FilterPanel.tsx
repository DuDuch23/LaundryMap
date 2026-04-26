import { useEffect, useState } from 'react';
import { getMethodesPaiement, getServices } from '../../services/request';
import { JOURS_OPTIONS } from '../../constants/Laverie';
import type { FiltresRecherche, MethodePaiementOption, ServiceOption } from '../../types/Laverie';

interface Props {
    filtres: FiltresRecherche;
    onHoraireChange: (v: string) => void;
    onToggleServiceId: (id: number) => void;
    onTogglePaiementId: (id: number) => void;
    onRayonChange: (v: number) => void;
    onReinitialiser: () => void;
    onAppliquer: () => void;
    nbActifs: number;
}

// ─── Chip générique ───────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                    ? 'bg-[#14A8DE] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            {label}
        </button>
    );
}

function FilterGroup({ title, children, loading }: { title: string; children: React.ReactNode; loading?: boolean }) {
    return (
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
            {loading ? (
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-7 w-20 rounded-lg bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">{children}</div>
            )}
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function FilterPanel({
    filtres, onHoraireChange, onToggleServiceId, onTogglePaiementId,
    onRayonChange, onReinitialiser, onAppliquer, nbActifs,
}: Props) {
    const [services,  setServices]  = useState<ServiceOption[]>([]);
    const [paiements, setPaiements] = useState<MethodePaiementOption[]>([]);
    const [loadingRef, setLoadingRef] = useState(true);

    // Chargement unique au premier affichage du panneau
    useEffect(() => {
        let cancelled = false;
        Promise.all([getServices(), getMethodesPaiement()])
            .then(([s, p]) => {
                if (cancelled) return;
                setServices(s);
                setPaiements(p);
            })
            .catch(() => {/* silencieux — les chips restent vides */})
            .finally(() => { if (!cancelled) setLoadingRef(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="mt-3 bg-white rounded-2xl border border-slate-100 shadow-lg p-5 space-y-5">

            {/* Rayon de recherche */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rayon de recherche</p>
                    <span className="text-xs font-bold text-[#14A8DE]">{filtres.rayon} km</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={filtres.rayon}
                    onChange={(e) => onRayonChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-[#14A8DE] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 km</span>
                    <span>50 km</span>
                </div>
            </div>

            {/* Horaires — statique */}
            <FilterGroup title="Horaires">
                {JOURS_OPTIONS.map((j) => (
                    <Chip
                        key={j.value}
                        label={j.label}
                        active={filtres.horaire === j.value}
                        onClick={() => onHoraireChange(j.value)}
                    />
                ))}
            </FilterGroup>

            {/* Services — depuis l'API */}
            <FilterGroup title="Services" loading={loadingRef}>
                {services.map((s) => (
                    <Chip
                        key={s.id}
                        label={s.nom}
                        active={filtres.serviceIds.includes(s.id)}
                        onClick={() => onToggleServiceId(s.id)}
                    />
                ))}
            </FilterGroup>

            {/* Paiements — depuis l'API */}
            <FilterGroup title="Moyens de paiement" loading={loadingRef}>
                {paiements.map((p) => (
                    <Chip
                        key={p.id}
                        label={p.nom}
                        active={filtres.paiementIds.includes(p.id)}
                        onClick={() => onTogglePaiementId(p.id)}
                    />
                ))}
            </FilterGroup>

            <div className="flex gap-2 pt-1 border-t border-slate-100">
                {nbActifs > 0 && (
                    <button
                        type="button"
                        onClick={onReinitialiser}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Réinitialiser
                    </button>
                )}
                <button
                    type="button"
                    onClick={onAppliquer}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#14A8DE] text-white text-xs font-semibold hover:bg-[#119ac8] transition-colors"
                >
                    Appliquer les filtres
                </button>
            </div>
        </div>
    );
}