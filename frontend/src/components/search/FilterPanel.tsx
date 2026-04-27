/**
 * FilterPanel — panneau de filtres accessible.
 *
 * Deux patterns d'accessibilité :
 *
 * 1. Disclosure (headlessui) sur chaque groupe de filtres :
 *    - Le titre du groupe est un bouton qui ouvre/ferme la liste de chips.
 *    - headlessui gère aria-expanded, aria-controls et le focus automatiquement.
 *    - Navigation clavier : Entrée/Espace pour basculer, Tab pour passer au suivant.
 *
 * 2. Navigation ↑↓ / ←→ entre les chips d'un groupe (ChipGroup) :
 *    - Implémentée manuellement via onKeyDown sur le conteneur.
 *    - Permet de parcourir les options sans sortir du groupe au clavier.
 *    - Chaque chip a aria-pressed pour annoncer son état aux lecteurs d'écran.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
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
            aria-pressed={active}
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

// ─── Conteneur de chips avec navigation ←→ / ↑↓ ─────────────────────────────
// Tab entre dans le groupe et met le focus sur le 1er chip.
// ←↑ et →↓ déplacent le focus au sein du groupe sans sortir.

function ChipGroup({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
    const groupRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
        e.preventDefault();

        const btns = Array.from(
            groupRef.current?.querySelectorAll<HTMLButtonElement>('button[type="button"]') ?? []
        );
        if (btns.length === 0) return;

        const current = btns.indexOf(document.activeElement as HTMLButtonElement);
        const next = current === -1 ? 0
            : (e.key === 'ArrowRight' || e.key === 'ArrowDown')
                ? (current + 1) % btns.length
                : (current - 1 + btns.length) % btns.length;

        btns[next]?.focus();
    };

    return (
        <div
            ref={groupRef}
            role="group"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            className="flex flex-wrap gap-2"
        >
            {children}
        </div>
    );
}

// ─── Groupe avec Disclosure (collapsible) ────────────────────────────────────
// Disclosure headlessui :
//  - DisclosureButton  → bouton accessible avec aria-expanded géré automatiquement
//  - DisclosurePanel   → contenu associé (id + aria-controls générés automatiquement)

function FilterGroup({ title, children, loading }: { title: string; children: React.ReactNode; loading?: boolean }) {
    return (
        <Disclosure as="div" defaultOpen>
            {({ open }) => (
                <>
                    <DisclosureButton className="flex w-full justify-between items-center mb-2 cursor-pointer group">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {title}
                        </span>
                        <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </DisclosureButton>

                    <DisclosurePanel>
                        {loading ? (
                            <div className="flex gap-2" aria-busy="true" aria-label={title}>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-7 w-20 rounded-lg bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <ChipGroup ariaLabel={title}>{children}</ChipGroup>
                        )}
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function FilterPanel({
    filtres, onHoraireChange, onToggleServiceId, onTogglePaiementId,
    onRayonChange, onReinitialiser, onAppliquer, nbActifs,
}: Props) {
    const { t } = useTranslation();
    const [services,  setServices]  = useState<ServiceOption[]>([]);
    const [paiements, setPaiements] = useState<MethodePaiementOption[]>([]);
    const [loadingRef, setLoadingRef] = useState(true);

    const translateJourLabel = (value: string): string => {
        if (value === 'ouvert_maintenant') return t('main.filter_panel.ouvert_maintenant');
        return t(`main.ajout_laverie.${value.toLowerCase()}`);
    };

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
                    <p
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        id="rayon-label"
                    >
                        {t('main.filter_panel.rayon_recherche')}
                    </p>
                    <span className="text-xs font-bold text-[#14A8DE]" aria-live="polite">
                        {filtres.rayon} km
                    </span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={filtres.rayon}
                    onChange={(e) => onRayonChange(Number(e.target.value))}
                    aria-labelledby="rayon-label"
                    aria-valuemin={1}
                    aria-valuemax={50}
                    aria-valuenow={filtres.rayon}
                    aria-valuetext={t('main.filter_panel.rayon_aria', { val: filtres.rayon })}
                    className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-[#14A8DE] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1" aria-hidden="true">
                    <span>1 km</span>
                    <span>50 km</span>
                </div>
            </div>

            {/* Horaires */}
            <FilterGroup title={t('main.filter_panel.horaires')}>
                {JOURS_OPTIONS.map((j) => (
                    <Chip
                        key={j.value}
                        label={translateJourLabel(j.value)}
                        active={filtres.horaire === j.value}
                        onClick={() => onHoraireChange(j.value)}
                    />
                ))}
            </FilterGroup>

            {/* Services */}
            <FilterGroup title={t('main.filter_panel.services')} loading={loadingRef}>
                {services.map((s) => (
                    <Chip
                        key={s.id}
                        label={s.nom}
                        active={filtres.serviceIds.includes(s.id)}
                        onClick={() => onToggleServiceId(s.id)}
                    />
                ))}
            </FilterGroup>

            {/* Paiements */}
            <FilterGroup title={t('main.filter_panel.moyens_paiement')} loading={loadingRef}>
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
                        {t('main.filter_panel.reinitialiser')}
                    </button>
                )}
                <button
                    type="button"
                    onClick={onAppliquer}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#14A8DE] text-white text-xs font-semibold hover:bg-[#119ac8] transition-colors"
                >
                    {t('main.filter_panel.appliquer')}
                </button>
            </div>
        </div>
    );
}
