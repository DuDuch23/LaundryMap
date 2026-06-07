import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Star } from 'lucide-react';
import type { ModerationCommentaireItem } from '../../services/request';

interface ModaleSuppressionCommentaireProps {
    isOpen: boolean;
    item: ModerationCommentaireItem | null;
    pending: boolean;
    onConfirm: (motif: string) => void;
    onCancel: () => void;
}

const MOTIF_MAX_LENGTH = 255;

export default function ModaleSuppressionCommentaire({
    isOpen,
    item,
    pending,
    onConfirm,
    onCancel,
}: ModaleSuppressionCommentaireProps) {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [motif, setMotif] = useState<string>('');
    const [touched, setTouched] = useState<boolean>(false);

    // Reset à chaque ouverture
    useEffect(() => {
        if (isOpen) {
            setMotif('');
            setTouched(false);
            previousFocusRef.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                modalRef.current?.focus();
                textareaRef.current?.focus();
            }, 50);
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

    if (!isOpen || !item) return null;

    const motifTrimmed = motif.trim();
    const motifVide = motifTrimmed === '';
    const motifTropLong = motif.length > MOTIF_MAX_LENGTH;
    const motifInvalide = motifVide || motifTropLong;

    const handleConfirm = () => {
        setTouched(true);
        if (motifInvalide || pending) return;
        onConfirm(motifTrimmed);
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
                aria-labelledby="suppression-commentaire-title"
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
                        <h2 id="suppression-commentaire-title" className="text-lg font-bold">
                            {t('main.gestion_commentaires.suppression.titre')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('main.gestion_commentaires.suppression.sous_titre')}
                        </p>
                    </div>
                </div>

                {/* Aperçu du commentaire */}
                <div className="p-5">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-5">
                        <p className="text-xs text-gray-500 mb-2">
                            {t('main.gestion_commentaires.suppression.apercu')}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        size={12}
                                        className={i <= (item.note ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-slate-800 truncate">
                                {item.auteur.prenom} {item.auteur.nom}
                            </span>
                        </div>
                        <p
                            className="text-sm text-slate-700 break-words"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {item.commentaire || '—'}
                        </p>
                    </div>

                    {/* Champ motif */}
                    <label htmlFor="motif-suppression" className="block text-sm font-semibold text-slate-800 mb-2">
                        {t('main.gestion_commentaires.suppression.motif_label')}
                        <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                    </label>

                    <textarea
                        id="motif-suppression"
                        ref={textareaRef}
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        onBlur={() => setTouched(true)}
                        rows={3}
                        maxLength={MOTIF_MAX_LENGTH + 1}
                        placeholder={t('main.gestion_commentaires.suppression.motif_placeholder')}
                        className={`w-full rounded-xl bg-white text-sm text-slate-800 resize-none outline-none transition focus:ring-2 ${
                            touched && motifInvalide
                                ? 'border border-red-300 focus:ring-red-200'
                                : 'border border-gray-300 focus:ring-[#22ACE2]/30 focus:border-[#22ACE2]'
                        }`}
                    />

                    <div className="flex justify-between items-center mt-2 text-xs">
                        <span className={touched && motifInvalide ? 'text-red-500' : 'text-gray-400'}>
                            {touched && motifVide && t('main.gestion_commentaires.suppression.motif_obligatoire')}
                            {touched && motifTropLong && t('main.gestion_commentaires.suppression.motif_trop_long')}
                        </span>
                        <span className={motif.length > MOTIF_MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}>
                            {motif.length}/{MOTIF_MAX_LENGTH}
                        </span>
                    </div>
                </div>

                {/* Footer boutons */}
                <div className="flex gap-2 p-5 pt-0">
                    <button
                        onClick={onCancel}
                        disabled={pending}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t('main.gestion_commentaires.suppression.bouton_annuler')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={pending || (touched && motifInvalide)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pending
                            ? t('main.gestion_commentaires.suppression.bouton_en_cours')
                            : t('main.gestion_commentaires.suppression.bouton_confirmer')}
                    </button>
                </div>
            </div>
        </div>
    );
}
