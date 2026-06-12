import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, UserRound } from 'lucide-react';

interface UtilisateurBlocageMini {
    id: number;
    prenom: string;
    nom: string;
    email: string;
}

interface ModaleBlocageUtilisateurProps {
    isOpen: boolean;
    user: UtilisateurBlocageMini | null;
    pending: boolean;
    onConfirm: (payload: { duree: 'temporaire' | 'definitif'; dateFin?: string; motif: string }) => void;
    onCancel: () => void;
}

const MOTIF_MAX_LENGTH = 255;

function toIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export default function ModaleBlocageUtilisateur({
    isOpen,
    user,
    pending,
    onConfirm,
    onCancel,
}: ModaleBlocageUtilisateurProps) {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);

    const [duree, setDuree] = useState<'temporaire' | 'definitif'>('temporaire');
    const [dateFin, setDateFin] = useState<string>('');
    const [motif, setMotif] = useState<string>('');
    const [touched, setTouched] = useState<boolean>(false);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const minDate = toIsoDate(tomorrow);

    useEffect(() => {
        if (isOpen) {
            setDuree('temporaire');
            setDateFin('');
            setMotif('');
            setTouched(false);
            previousFocusRef.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            setTimeout(() => modalRef.current?.focus(), 50);
        } else {
            document.body.style.overflow = '';
            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
    };

    if (!isOpen || !user) return null;

    const setPreset = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setDateFin(toIsoDate(d));
    };

    const motifTrimmed = motif.trim();
    const motifVide = motifTrimmed === '';
    const motifTropLong = motif.length > MOTIF_MAX_LENGTH;
    const dateInvalide = duree === 'temporaire' && (!dateFin || dateFin < minDate);
    const formInvalide = motifVide || motifTropLong || dateInvalide;

    const handleConfirm = () => {
        setTouched(true);
        if (formInvalide || pending) return;
        onConfirm({
            duree,
            dateFin: duree === 'temporaire' ? dateFin : undefined,
            motif: motifTrimmed,
        });
    };

    return (
        <div
            role="presentation"
            className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[60]"
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="blocage-utilisateur-title"
                ref={modalRef}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
            >
                {/* Header */}
                <div className="flex items-start gap-3 p-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 inline-flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <h2 id="blocage-utilisateur-title" className="text-lg font-bold">
                            {t('main.gestion_utilisateurs.blocage.titre')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('main.gestion_utilisateurs.blocage.sous_titre')}
                        </p>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Aperçu user */}
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DAF5FF] text-[#14A8DE] inline-flex items-center justify-center shrink-0">
                            <UserRound size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {user.prenom} {user.nom}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Durée */}
                    <div>
                        <p className="block text-sm font-semibold text-slate-800 mb-2">
                            {t('main.gestion_utilisateurs.blocage.duree_label')}
                            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setDuree('temporaire')}
                                className={`py-2.5 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
                                    duree === 'temporaire'
                                        ? 'bg-[#22ACE2] border-[#22ACE2] text-white shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {t('main.gestion_utilisateurs.blocage.temporaire')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDuree('definitif')}
                                className={`py-2.5 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
                                    duree === 'definitif'
                                        ? 'bg-gray-800 border-gray-800 text-white shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {t('main.gestion_utilisateurs.blocage.definitif')}
                            </button>
                        </div>
                    </div>

                    {/* Date de fin (uniquement si temporaire) */}
                    {duree === 'temporaire' && (
                        <div>
                            <label htmlFor="date-fin-blocage" className="block text-sm font-semibold text-slate-800 mb-2">
                                {t('main.gestion_utilisateurs.blocage.date_fin_label')}
                                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="date-fin-blocage"
                                type="date"
                                value={dateFin}
                                min={minDate}
                                onChange={(e) => setDateFin(e.target.value)}
                                onBlur={() => setTouched(true)}
                                className={`block w-full box-border rounded-xl bg-white text-sm text-slate-800 outline-none transition focus:ring-2 p-1 ${
                                    touched && dateInvalide
                                        ? 'border border-red-300 focus:ring-red-200'
                                        : 'border border-gray-300 focus:ring-[#22ACE2]/30 focus:border-[#22ACE2]'
                                }`}
                            />
                            {touched && dateInvalide && (
                                <p className="text-xs text-red-500 mt-1">
                                    {t('main.gestion_utilisateurs.blocage.date_invalide')}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[7, 30, 90].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setPreset(d)}
                                        className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                                    >
                                        {t('main.gestion_utilisateurs.blocage.preset', { count: d })}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Motif */}
                    <div>
                        <label htmlFor="motif-blocage" className="block text-sm font-semibold text-slate-800 mb-2">
                            {t('main.gestion_utilisateurs.blocage.motif_label')}
                            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                        </label>
                        <textarea
                            id="motif-blocage"
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            onBlur={() => setTouched(true)}
                            rows={3}
                            maxLength={MOTIF_MAX_LENGTH + 1}
                            placeholder={t('main.gestion_utilisateurs.blocage.motif_placeholder')}
                            className={`block w-full box-border rounded-xl bg-white text-sm text-slate-800 resize-none outline-none transition focus:ring-2 p-1${
                                touched && (motifVide || motifTropLong)
                                    ? 'border border-red-300 focus:ring-red-200'
                                    : 'border border-gray-300 focus:ring-[#22ACE2]/30 focus:border-[#22ACE2]'
                            }`}
                        />
                        <div className="flex justify-between items-center mt-1 text-xs">
                            <span className={touched && (motifVide || motifTropLong) ? 'text-red-500' : 'text-gray-400'}>
                                {touched && motifVide && t('main.gestion_utilisateurs.blocage.motif_obligatoire')}
                                {touched && motifTropLong && t('main.gestion_utilisateurs.blocage.motif_trop_long')}
                            </span>
                            <span className={motifTropLong ? 'text-red-500' : 'text-gray-400'}>
                                {motif.length}/{MOTIF_MAX_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer boutons */}
                <div className="flex gap-2 p-5 pt-0">
                    <button
                        onClick={onCancel}
                        disabled={pending}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t('main.gestion_utilisateurs.blocage.bouton_annuler')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={pending || (touched && formInvalide)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pending
                            ? t('main.gestion_utilisateurs.blocage.bouton_en_cours')
                            : t('main.gestion_utilisateurs.blocage.bouton_confirmer')}
                    </button>
                </div>
            </div>
        </div>
    );
}
