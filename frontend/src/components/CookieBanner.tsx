import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Consent {
    preferences: boolean;
    thirdParty: boolean;
    savedAt: number;
}

const STORAGE_KEY = 'lm_cookie_consent';
const MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mois (recommandation CNIL, changer si la recommandation évolue)

export function getConsent(): Consent | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const consent = JSON.parse(raw) as Consent;
        if (Date.now() - consent.savedAt > MAX_AGE_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return consent;
    } catch {
        return null;
    }
}

function saveConsent(c: Omit<Consent, 'savedAt'>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...c, savedAt: Date.now() }));
}

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [preferences, setPreferences] = useState(true);
    const [thirdParty, setThirdParty] = useState(true);

    useEffect(() => {
        if (!getConsent()) setVisible(true);
    }, []);

    const accept = () => {
        saveConsent({ preferences: true, thirdParty: true });
        setVisible(false);
    };

    const refuse = () => {
        saveConsent({ preferences: false, thirdParty: false });
        setVisible(false);
    };

    const save = () => {
        saveConsent({ preferences, thirdParty });
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Gestion des cookies"
                className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-200 shadow-2xl"
            >
                {!open ? (
                    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="flex-1 text-sm text-slate-600 leading-5">
                            Nous utilisons des données stockées localement (JWT, langue) et des tuiles
                            cartographiques OpenStreetMap.{' '}
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="underline text-cyan-700 hover:text-cyan-900 transition-colors"
                            >
                                En savoir plus
                            </button>
                        </p>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Personnaliser
                            </button>
                            <button
                                type="button"
                                onClick={refuse}
                                className="px-4 py-2 rounded-xl bg-[#22ACE2] text-white text-sm font-semibold hover:bg-[#1296c8] transition-colors cursor-pointer"
                            >
                                Refuser
                            </button>
                            <button
                                type="button"
                                onClick={accept}
                                className="px-4 py-2 rounded-xl bg-[#22ACE2] text-white text-sm font-semibold hover:bg-[#1296c8] transition-colors cursor-pointer"
                            >
                                Tout accepter
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Vue détaillée ── */
                    <div className="mx-auto max-w-xl px-5 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900">Personnaliser les cookies</h2>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Fermer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <CookieRow
                                label="Nécessaires"
                                description="Token JWT d'authentification. Requis pour le fonctionnement du site."
                                checked={true}
                                disabled={true}
                            />
                            <CookieRow
                                label="Préférences"
                                description="Mémorisation de la langue sélectionnée (fr / en)."
                                checked={preferences}
                                onChange={setPreferences}
                            />
                            <CookieRow
                                label="Contenu tiers"
                                description="Tuiles cartographiques chargées depuis tile.openstreetmap.org (votre IP est transmise à OSM)."
                                checked={thirdParty}
                                onChange={setThirdParty}
                            />
                        </div>

                        <div className="mt-5 flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={refuse}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Tout refuser
                            </button>
                            <button
                                type="button"
                                onClick={save}
                                className="px-4 py-2 rounded-xl bg-[#22ACE2] text-white text-sm font-semibold hover:bg-[#1296c8] transition-colors cursor-pointer"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function CookieRow({
    label,
    description,
    checked,
    disabled,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (v: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-5">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                    disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                } ${checked ? 'bg-[#22ACE2]' : 'bg-slate-200'}`}
            >
                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
}

export function CookieReopenButton() {
    const [gone, setGone] = useState(true);

    useEffect(() => {
        setGone(!!getConsent());
    }, []);

    const reopen = () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    };

    if (!gone) return null;

    return (
        <button
            type="button"
            onClick={reopen}
            className="text-xs text-white/60 hover:text-white/90 underline transition-colors cursor-pointer"
        >
            Gérer mes cookies
        </button>
    );
}
