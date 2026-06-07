import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Star, AlertTriangle, User, MapPin, Calendar, ShieldOff } from 'lucide-react';
import type { ModerationCommentaireItem } from '../../services/request';

interface ModaleDetailCommentaireProps {
    isOpen: boolean;
    onClose: () => void;
    item: ModerationCommentaireItem | null;
    onDecision?: (item: ModerationCommentaireItem, action: 'keep' | 'delete') => void;
    decisionPending?: boolean;
}

function formatDate(iso: string | null, locale: string): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function StarsRow({ note }: { note: number | null }) {
    const n = note ?? 0;
    return (
        <div className="flex items-center gap-0.5" aria-label={`Note ${n}/5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={16}
                    className={i <= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );
}

export default function ModaleDetailCommentaire({ isOpen, onClose, item, onDecision, decisionPending = false }: ModaleDetailCommentaireProps) {
    const { t, i18n } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            modalRef.current?.focus();
            document.body.style.overflow = 'hidden';
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
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen || !item) return null;

    const locale = i18n.language || 'fr';

    let statusBadge: { label: string; cls: string };
    if (item.estModere) {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_modere'),
            cls: 'bg-gray-800 text-white border-gray-900',
        };
    } else if (item.estSignale) {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_signale_count', { count: item.nbSignalements }),
            cls: 'bg-red-100 text-red-600 border-red-300',
        };
    } else {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_ok'),
            cls: 'bg-green-100 text-green-600 border-green-300',
        };
    }

    return (
        <div
            role="presentation"
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="detail-commentaire-title"
                ref={modalRef}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer"
                            aria-label={t('main.gestion_commentaires.detail.fermer')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <h2 id="detail-commentaire-title" className="text-lg font-bold">{t('main.gestion_commentaires.detail.titre')}</h2>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full border font-medium shadow-sm ${statusBadge.cls}`}>
                        {statusBadge.label}
                    </span>
                </div>

                {/* Contenu */}
                <div className="p-5 space-y-6">
                    {/* Section : Commentaire */}
                    <section>
                        <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                            {t('main.gestion_commentaires.detail.section_commentaire')}
                        </h3>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <StarsRow note={item.note} />
                                <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(item.commenteLe ?? item.noteLe, locale)}
                                </span>
                            </div>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                                {item.commentaire || '—'}
                            </p>
                        </div>
                    </section>

                    {/* Section : Modération (si modéré) */}
                    {item.estModere && (
                        <section>
                            <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                                {t('main.gestion_commentaires.detail.section_moderation')}
                            </h3>
                            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4">
                                <div className="flex items-start gap-2 text-sm text-gray-700">
                                    <ShieldOff size={16} className="mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium">{t('main.gestion_commentaires.detail.modere_le', { date: formatDate(item.commentaireSupprimeeLe, locale) })}</p>
                                        {item.commentaireSupprimeMotif && (
                                            <p className="text-gray-600 mt-1">
                                                <span className="font-medium">{t('main.gestion_commentaires.detail.motif_admin')} : </span>
                                                {item.commentaireSupprimeMotif}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Section : Auteur */}
                    <section>
                        <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                            {t('main.gestion_commentaires.detail.section_auteur')}
                        </h3>
                        <Link
                            to={`/admin/utilisateurs/${item.auteur.id}`}
                            className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#22ACE2] hover:shadow-sm transition cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#DAF5FF] text-[#14A8DE] flex items-center justify-center shrink-0">
                                    <User size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {item.auteur.prenom} {item.auteur.nom}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{item.auteur.email}</p>
                                </div>
                                <span className="text-xs text-[#22ACE2] font-medium shrink-0">
                                    {t('main.gestion_commentaires.detail.voir_profil')}
                                </span>
                            </div>
                        </Link>
                    </section>

                    {/* Section : Laverie */}
                    <section>
                        <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                            {t('main.gestion_commentaires.detail.section_laverie')}
                        </h3>
                        <Link
                            to={`/admin/laveries/${item.laverie.id}`}
                            className="block rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#22ACE2] hover:shadow-sm transition cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#DAF5FF] text-[#14A8DE] flex items-center justify-center shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {item.laverie.nomEtablissement}
                                    </p>
                                    <p className="text-xs text-gray-500 break-words">{item.laverie.adresse}</p>
                                </div>
                                <span className="text-xs text-[#22ACE2] font-medium shrink-0">
                                    {t('main.gestion_commentaires.detail.voir_laverie')}
                                </span>
                            </div>
                        </Link>
                    </section>

                    {/* Actions */}
                    {onDecision && (
                        <section>
                            <div className="flex flex-wrap justify-end gap-2">
                                {item.estModere ? (
                                    <button
                                        onClick={() => onDecision(item, 'keep')}
                                        disabled={decisionPending}
                                        className="bg-[#22ACE2] hover:bg-blue-500 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {t('main.gestion_commentaires.bouton_restaurer')}
                                    </button>
                                ) : item.estSignale ? (
                                    <>
                                        <button
                                            onClick={() => onDecision(item, 'keep')}
                                            disabled={decisionPending}
                                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-5 rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {t('main.gestion_commentaires.bouton_garder')}
                                        </button>
                                        <button
                                            onClick={() => onDecision(item, 'delete')}
                                            disabled={decisionPending}
                                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            {t('main.gestion_commentaires.bouton_supprimer')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => onDecision(item, 'delete')}
                                        disabled={decisionPending}
                                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {t('main.gestion_commentaires.bouton_supprimer')}
                                    </button>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Section : Signalements */}
                    {item.signalements.length > 0 && (
                        <section>
                            <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                                {t('main.gestion_commentaires.detail.section_signalements', { count: item.signalements.length })}
                            </h3>
                            <ul className="space-y-3">
                                {item.signalements.map((s, idx) => (
                                    <li key={idx} className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-white border border-orange-300 text-orange-700 font-medium">
                                                        {s.motif}
                                                    </span>
                                                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                                        <Calendar size={11} />
                                                        {formatDate(s.date, locale)}
                                                    </span>
                                                </div>
                                                {s.commentaire && (
                                                    <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap break-words">
                                                        {s.commentaire}
                                                    </p>
                                                )}
                                                {s.utilisateur && (
                                                    <Link
                                                        to={`/admin/utilisateurs/${s.utilisateur.id}`}
                                                        className="inline-flex items-center gap-2 text-xs text-[#14A8DE] hover:underline"
                                                    >
                                                        <User size={12} />
                                                        {s.utilisateur.prenom} {s.utilisateur.nom}
                                                        <span className="text-gray-400">·</span>
                                                        <span className="text-gray-500">{s.utilisateur.email}</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
