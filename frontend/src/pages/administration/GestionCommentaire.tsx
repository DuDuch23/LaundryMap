import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    ListX, SlidersHorizontal, Eye, AlertTriangle, ShieldOff,
    Star, MessageSquareOff,
} from 'lucide-react';
import {
    fetchModerationCommentaires,
    moderationDecision,
    type ModerationCommentaireItem,
    type ModerationPagination,
    type ModerationFiltres,
} from '../../services/request';
import FilterModal, { type FilterSection, type FilterValues } from '../../components/FilterModal';
import { CommentaireAdminListSkeleton } from '../../components/administration/AdminSkeletons';
import ModaleDetailCommentaire from '../../components/administration/ModaleDetailCommentaire';
import ModaleSuppressionCommentaire from '../../components/administration/ModaleSuppressionCommentaire';

const FILTRES_VIDES: FilterValues = {
    statut: '',
    ordre: '',
};

const FILTRES_DEFAUT: FilterValues = {
    statut: '',
    ordre: '',
};

function formatDateCourte(iso: string | null, locale: string): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}

export default function GestionCommentaires() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language || 'fr';

    const [items, setItems] = useState<ModerationCommentaireItem[]>([]);
    const [totalSignalesEnAttente, setTotalSignalesEnAttente] = useState<number>(0);
    const [pagination, setPagination] = useState<ModerationPagination | null>(null);
    const [chargement, setChargement] = useState<boolean>(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [decisionPending, setDecisionPending] = useState<boolean>(false);

    // Filtres
    const [filtreModalOuverte, setFiltreModalOuverte] = useState<boolean>(false);
    const [filtresActifs, setFiltresActifs] = useState<FilterValues>(() => {
        const saved = localStorage.getItem('commentairesFiltres');
        return saved ? JSON.parse(saved) : { ...FILTRES_DEFAUT };
    });
    const [filtresTemp, setFiltresTemp] = useState<FilterValues>({ ...FILTRES_DEFAUT });

    // Modale détail
    const [detailItem, setDetailItem] = useState<ModerationCommentaireItem | null>(null);
    // Modale suppression (avec saisie de motif)
    const [suppressionItem, setSuppressionItem] = useState<ModerationCommentaireItem | null>(null);

    const aDesFiltresActifs = Object.values(filtresActifs).some((v) => v !== '');

    const FILTER_SECTIONS: FilterSection[] = [
        {
            label: t('main.gestion_commentaires.filtre_statut'),
            key: 'statut',
            options: [
                { label: t('main.gestion_commentaires.filtre_statut_tous'), value: '' },
                { label: t('main.gestion_commentaires.filtre_statut_signales'), value: 'signales' },
                { label: t('main.gestion_commentaires.filtre_statut_non_signales'), value: 'non_signales' },
                { label: t('main.gestion_commentaires.filtre_statut_modere'), value: 'modere' },
            ],
        },
        {
            label: t('main.gestion_commentaires.filtre_ordre'),
            key: 'ordre',
            options: [
                { label: t('main.gestion_commentaires.filtre_ordre_defaut'), value: '' },
                { label: t('main.gestion_commentaires.filtre_ordre_recent'), value: 'recent' },
                { label: t('main.gestion_commentaires.filtre_ordre_ancien'), value: 'ancien' },
                { label: t('main.gestion_commentaires.filtre_ordre_plus_signale'), value: 'plus_signale' },
            ],
        },
    ];

    const chargerDonnees = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const filtresApi: ModerationFiltres = {};
            if (filtresActifs.statut) filtresApi.statut = filtresActifs.statut;
            if (filtresActifs.ordre) filtresApi.ordre = filtresActifs.ordre;
            const data = await fetchModerationCommentaires(page, filtresApi);
            setItems(data.items);
            setTotalSignalesEnAttente(data.totalSignalesEnAttente);
            setPagination(data.pagination);
        } catch (e: any) {
            setErreur(e?.message || t('main.gestion_commentaires.erreur_chargement'));
        } finally {
            setChargement(false);
        }
    }, [page, filtresActifs, t]);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    const handleDecision = async (item: ModerationCommentaireItem, action: 'keep' | 'delete') => {
        // Suppression : passe par la modale de saisie de motif
        if (action === 'delete') {
            setDetailItem(null);
            setSuppressionItem(item);
            return;
        }

        // Conserver / Restaurer : pas de confirmation, pas de toast de succès
        try {
            setDecisionPending(true);
            await moderationDecision(item.noteId, 'keep');
            setDetailItem(null);
            await chargerDonnees();
        } catch (e) {
            console.error(e);
            toast.error(t('main.gestion_commentaires.toast_erreur'));
        } finally {
            setDecisionPending(false);
        }
    };

    const confirmerSuppression = async (motif: string) => {
        if (!suppressionItem) return;
        try {
            setDecisionPending(true);
            await moderationDecision(suppressionItem.noteId, 'delete', motif);
            setSuppressionItem(null);
            await chargerDonnees();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || t('main.gestion_commentaires.toast_erreur'));
        } finally {
            setDecisionPending(false);
        }
    };

    // Pagination
    const allerPageSuivante = () => {
        if (pagination?.aPageSuivante) setPage((p) => p + 1);
    };
    const allerPagePrecedente = () => {
        if (pagination?.aPagePrecedente) setPage((p) => p - 1);
    };

    // Filtres
    const ouvrirFiltres = () => {
        setFiltresTemp({ ...filtresActifs });
        setFiltreModalOuverte(true);
    };
    const handleFiltreChange = (key: string, value: string) => {
        setFiltresTemp((prev) => ({ ...prev, [key]: value }));
    };
    const appliquerFiltres = (filtres: FilterValues) => {
        setFiltresActifs(filtres);
        localStorage.setItem('commentairesFiltres', JSON.stringify(filtres));
        setPage(1);
    };
    const effacerFiltres = () => {
        setFiltresTemp({ ...FILTRES_VIDES });
        setFiltresActifs({ ...FILTRES_VIDES });
        localStorage.removeItem('commentairesFiltres');
        setPage(1);
        setFiltreModalOuverte(false);
    };

    if (erreur) {
        return <div className="text-center mt-20 font-bold text-red-500">{erreur}</div>;
    }

    const chargementInitial = chargement && items.length === 0;

    return (
        <div className="w-full pt-24 px-4 pb-16 font-sans max-w-[stretch]">
            {/* HEADER */}
            <div className="bg-white flex items-center justify-between p-4 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold">{t('main.gestion_commentaires.titre')}</h1>
                </div>

                <div className="flex items-center gap-3">
                    {aDesFiltresActifs ? (
                        <>
                            <button
                                onClick={effacerFiltres}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            >
                                {t('main.gestion_commentaires.effacer')}
                            </button>
                            <button
                                onClick={ouvrirFiltres}
                                className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer"
                                aria-label={t('main.gestion_commentaires.filtres_actifs_aria')}
                            >
                                <ListX size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={ouvrirFiltres}
                            className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer"
                            aria-label={t('main.gestion_commentaires.filtres_aria')}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4">
                {/* ENCART signalés en attente */}
                <div className="bg-[#DAF5FF] border border-[#14A8DE] rounded-2xl p-6 text-center shadow-sm mb-8 mx-4">
                    <h2 className="font-bold mb-4">{t('main.gestion_commentaires.encart_titre')}</h2>
                    <AlertTriangle className="mx-auto mb-2 text-black" size={36} />
                    <p className="text-red-500 font-bold text-xl">{totalSignalesEnAttente}</p>
                </div>

                {/* LISTE */}
                {chargementInitial ? (
                    <CommentaireAdminListSkeleton count={4} />
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageSquareOff size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                            {aDesFiltresActifs
                                ? t('main.gestion_commentaires.aucun_resultat_filtre')
                                : t('main.gestion_commentaires.aucun_resultat')}
                        </p>
                    </div>
                ) : (
                    <div className={`space-y-6 ${chargement ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                        {items.map((item) => (
                            <CardCommentaire
                                key={item.noteId}
                                item={item}
                                locale={locale}
                                onOpenDetail={() => setDetailItem(item)}
                                onDecision={handleDecision}
                                decisionPending={decisionPending}
                            />
                        ))}
                    </div>
                )}

                {/* PAGINATION */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={allerPagePrecedente}
                            disabled={!pagination.aPagePrecedente}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors shadow-sm ${pagination.aPagePrecedente
                                    ? 'bg-[#22ACE2] hover:bg-blue-500 text-white cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            {t('main.gestion_commentaires.precedent')}
                        </button>

                        <span className="text-sm text-gray-500 font-medium">
                            {pagination.pageCourante} / {pagination.totalPages}
                        </span>

                        <button
                            onClick={allerPageSuivante}
                            disabled={!pagination.aPageSuivante}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors shadow-sm ${pagination.aPageSuivante
                                    ? 'bg-[#22ACE2] hover:bg-blue-500 text-white cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {t('main.gestion_commentaires.suivant')}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                )}

                {/* MODALES */}
                <FilterModal
                    isOpen={filtreModalOuverte}
                    onClose={() => setFiltreModalOuverte(false)}
                    onApply={appliquerFiltres}
                    onClear={effacerFiltres}
                    sections={FILTER_SECTIONS}
                    values={filtresTemp}
                    onChange={handleFiltreChange}
                />
                <ModaleDetailCommentaire
                    isOpen={detailItem !== null}
                    onClose={() => setDetailItem(null)}
                    item={detailItem}
                    onDecision={handleDecision}
                    decisionPending={decisionPending}
                />
                <ModaleSuppressionCommentaire
                    isOpen={suppressionItem !== null}
                    item={suppressionItem}
                    pending={decisionPending}
                    onConfirm={confirmerSuppression}
                    onCancel={() => setSuppressionItem(null)}
                />
            </div>
        </div>
    );
}

// ─── Card commentaire ─────────────────────────────────────────────────────────

interface CardCommentaireProps {
    item: ModerationCommentaireItem;
    locale: string;
    onOpenDetail: () => void;
    onDecision: (item: ModerationCommentaireItem, action: 'keep' | 'delete') => void;
    decisionPending: boolean;
}

function CardCommentaire({ item, locale, onOpenDetail, onDecision, decisionPending }: CardCommentaireProps) {
    const { t } = useTranslation();

    let statusBadge: { label: string; cls: string; icon?: React.ReactNode };
    if (item.estModere) {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_modere'),
            cls: 'bg-gray-800 text-white border-gray-900',
            icon: <ShieldOff size={12} />,
        };
    } else if (item.estSignale) {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_signale_count', { count: item.nbSignalements }),
            cls: 'bg-red-100 text-red-600 border-red-300',
            icon: <AlertTriangle size={12} />,
        };
    } else {
        statusBadge = {
            label: t('main.gestion_commentaires.badge_ok'),
            cls: 'bg-green-100 text-green-600 border-green-300',
        };
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative">
            {/* Header card : badge + bouton voir */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border font-medium shadow-sm ${statusBadge.cls}`}>
                    {statusBadge.icon}
                    {statusBadge.label}
                </span>
                <button
                    onClick={onOpenDetail}
                    className="bg-[#22ACE2] hover:bg-blue-500 w-8 h-8 rounded-xl text-white transition-colors cursor-pointer inline-flex items-center justify-center shadow-md shrink-0"
                    aria-label={t('main.gestion_commentaires.voir_details_aria')}
                >
                    <Eye size={18} aria-hidden="true" />
                </button>
            </div>

            {/* Note + date + auteur + laverie */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <div className="flex items-center gap-0.5" aria-label={`Note ${item.note ?? 0}/5`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                            key={i}
                            size={14}
                            className={i <= (item.note ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                    ))}
                </div>
                <span className="text-xs text-gray-500">
                    {formatDateCourte(item.commenteLe ?? item.noteLe, locale)}
                </span>
            </div>

            <p className="text-sm font-semibold text-slate-900 truncate">
                {item.auteur.prenom} {item.auteur.nom}
                <span className="text-gray-400 font-normal"> · </span>
                <span className="text-gray-600 font-normal">{item.laverie.nomEtablissement}</span>
            </p>

            {/* Commentaire (extrait 2 lignes) */}
            <p
                className="text-sm text-slate-700 mt-2 break-words"
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {item.commentaire || '—'}
            </p>

            {/* Encart modération (si modéré) */}
            {item.estModere && item.commentaireSupprimeMotif && (
                <div className="mt-3 text-xs text-gray-500 italic">
                    {t('main.gestion_commentaires.card_motif_admin')} : {item.commentaireSupprimeMotif}
                </div>
            )}

            {/* Actions selon l'état */}
            <div className="flex justify-end gap-2 mt-4">
                {item.estModere ? (
                    /* Commentaire supprimé → on peut le restaurer */
                    <button
                        onClick={() => onDecision(item, 'keep')}
                        disabled={decisionPending}
                        className="bg-[#22ACE2] hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        {t('main.gestion_commentaires.bouton_restaurer')}
                    </button>
                ) : item.estSignale ? (
                    /* Commentaire signalé → choix conserver / supprimer */
                    <>
                        <button
                            onClick={() => onDecision(item, 'keep')}
                            disabled={decisionPending}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {t('main.gestion_commentaires.bouton_garder')}
                        </button>
                        <button
                            onClick={() => onDecision(item, 'delete')}
                            disabled={decisionPending}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            {t('main.gestion_commentaires.bouton_supprimer')}
                        </button>
                    </>
                ) : (
                    /* Sans signalement → l'admin peut quand même supprimer (changement d'avis) */
                    <button
                        onClick={() => onDecision(item, 'delete')}
                        disabled={decisionPending}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        {t('main.gestion_commentaires.bouton_supprimer')}
                    </button>
                )}
            </div>
        </div>
    );
}
