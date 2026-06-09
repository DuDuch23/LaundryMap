import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, UserRound, MoreHorizontal, Ban, ShieldCheck } from 'lucide-react';
import { fetchUtilisateurDetail, updateUtilisateurStatut, bloquerUtilisateur, debloquerUtilisateur } from '../../services/request';
import { UtilisateurAdminDetailSkeleton } from '../../components/administration/AdminSkeletons';
import ModaleBlocageUtilisateur from '../../components/administration/ModaleBlocageUtilisateur';
import { resolveUrl } from '../../services/api';

const IMAGE_LAVERIE_PAR_DEFAUT = '/uploads/laveries/default-laundry.jpg';

interface LaverieDetail {
    id: number;
    nom: string;
    statut: string;
    adresse: string;
    image?: string;
    imageAlt?: string;
}

interface UserDetail {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    statut: string;
    ville?: string;
    codePostal?: string;
    estBanni?: boolean;
    banniJusquA?: string | null;
    banniMotif?: string | null;
    estBanniDefinitif?: boolean;
    estBanniTemporaire?: boolean;
    professionnel?: {
        id: number;
        siren: string;
        statut: string;
        laveries: LaverieDetail[];
    };
}

export default function DetailUtilisateur() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentaire, setCommentaire] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [modaleBlocageOuverte, setModaleBlocageOuverte] = useState<boolean>(false);
    const [blocagePending, setBlocagePending] = useState<boolean>(false);

    const rechargerUser = async () => {
        if (!id) return;
        try {
            const data = await fetchUtilisateurDetail(id);
            setUser(data);
        } catch (e: any) {
            toast.error(e?.message || t('main.gestion_utilisateurs.blocage.toast_erreur'));
        }
    };

    const handleConfirmerBlocage = async (payload: { duree: 'temporaire' | 'definitif'; dateFin?: string; motif: string }) => {
        if (!user) return;
        try {
            setBlocagePending(true);
            await bloquerUtilisateur(user.id, payload);
            setModaleBlocageOuverte(false);
            await rechargerUser();
            toast.success(t('main.gestion_utilisateurs.blocage.toast_succes'));
        } catch (e: any) {
            toast.error(e?.message || t('main.gestion_utilisateurs.blocage.toast_erreur'));
        } finally {
            setBlocagePending(false);
        }
    };

    const handleDebloquer = async () => {
        if (!user) return;
        if (!window.confirm(t('main.gestion_utilisateurs.blocage.confirmer_deblocage') as string)) return;
        try {
            setBlocagePending(true);
            await debloquerUtilisateur(user.id);
            await rechargerUser();
            toast.success(t('main.gestion_utilisateurs.blocage.toast_deblocage_succes'));
        } catch (e: any) {
            toast.error(e?.message || t('main.gestion_utilisateurs.blocage.toast_erreur'));
        } finally {
            setBlocagePending(false);
        }
    };

    const formatDateCourte = (iso?: string | null): string => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                day: '2-digit', month: '2-digit', year: 'numeric',
            });
        } catch {
            return iso;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!id) return;
                const data = await fetchUtilisateurDetail(id);
                setUser(data);
            } catch (error) {
                console.error("Erreur de chargement :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const getBadgeStyle = (statut: string) => {
        switch (statut) {
            case 'Refusée':
                return 'bg-red-100 text-red-500 border border-red-300';
            case 'En attente':
                return 'bg-orange-100 text-orange-500 border border-orange-300';
            case 'Validée':
                return 'bg-green-100 text-green-500 border border-green-300';
            case 'Banni':
            case 'Supprimée':
                return 'bg-gray-800 text-white border border-gray-900';
            default:
                return 'bg-gray-100 text-gray-500 border border-gray-300';
        }
    };

    if (loading) {
        return <UtilisateurAdminDetailSkeleton />;
    }

    if (!user) {
        return <div className="text-center mt-20 font-bold text-red-500">Utilisateur introuvable.</div>;
    }

    // Actions simplifiées grâce à request.tsx
    const handleAccepter = async () => {
        try {
            await updateUtilisateurStatut(user.id, 'accepter', commentaire);
            navigate(-1);
        } catch (error) {
            console.error("Erreur lors de l'acceptation :", error);
        }
    };

    const handleRefuser = async () => {
        if (!commentaire.trim()) {
            setErrorMsg('Le commentaire est obligatoire pour justifier un refus.');
            return;
        }

        try {
            await updateUtilisateurStatut(user.id, 'refuser', commentaire);
            navigate(-1);
        } catch (error) {
            console.error("Erreur lors du refus :", error);
            setErrorMsg('Une erreur est survenue lors du refus.');
        }
    };

    return (
        <div className="w-full mx-auto bg-gray-50 min-h-screen font-sans relative pb-10">

            {/* HEADER BACKGROUND : image de la 1ère laverie ou image par défaut */}
            <div className="relative h-56 bg-slate-800 w-full overflow-hidden">
                {user.professionnel && (
                    <img
                        src={resolveUrl(user.professionnel.laveries?.[0]?.image || IMAGE_LAVERIE_PAR_DEFAUT)}
                        alt={user.professionnel.laveries?.[0]?.imageAlt || user.professionnel.laveries?.[0]?.nom || ''}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.endsWith(IMAGE_LAVERIE_PAR_DEFAUT)) {
                                target.src = resolveUrl(IMAGE_LAVERIE_PAR_DEFAUT);
                            }
                        }}
                    />
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-20 left-4 w-8 h-8 rounded-xl shadow-md z-10 transition-colors cursor-pointer flex items-center justify-center bg-[#14A8DE]"
                    aria-label="Retour"
                >
                    <ArrowLeft size={16} className="text-white" />
                </button>
            </div>

            {/* CONTENU PRINCIPAL (La carte blanche arrondie) */}
            <div className="relative bg-white rounded-t-[3rem] px-6 pt-12 pb-8 -mt-12 shadow-lg min-h-screen">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                    <UserRound size={40} className="text-gray-600" />
                </div>

                {/* NOM ET STATUT */}
                <div className="text-start mb-6 mt-2">
                    <h1 className="text-2xl font-bold underline decoration-2 underline-offset-4 mb-3">
                        {user.prenom} {user.nom}
                    </h1>
                    <span className={`px-4 py-1.5 text-sm rounded-full font-medium ${getBadgeStyle(user.professionnel ? user.professionnel.statut : user.statut)}`}>
                        {user.professionnel ? user.professionnel.statut : user.statut}
                    </span>
                </div>

                {/* INFORMATIONS DU PRO */}
                <div className="flex justify-between items-start mb-8">
                    <div className="text-sm space-y-2 flex-1">
                        <p><span className="font-bold">Prénom :</span> <span className="italic text-gray-600">{user.prenom}</span></p>
                        <p><span className="font-bold">Nom :</span> <span className="italic text-gray-600">{user.nom}</span></p>
                        {user.ville && <p><span className="font-bold">Ville :</span> <span className="italic text-gray-600">{user.ville}</span></p>}
                        {user.codePostal && <p><span className="font-bold">Code postal :</span> <span className="italic text-gray-600">{user.codePostal}</span></p>}
                        <p><span className="font-bold">Email :</span> <span className="italic text-gray-600">{user.email}</span></p>
                        {user.professionnel && <p className="mt-3"><span className="font-bold">SIREN/SIRET :</span> <span className="italic text-red-400">{user.professionnel.siren}</span></p>}
                    </div>

                </div>

                {/* LISTE DES LAVERIES */}
                {user.professionnel && user.professionnel.laveries && (
                    <div className="mb-8">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-4">Laveries disponibles</h2>
                        <div className="space-y-4">
                            {user.professionnel.laveries.map((laverie) => (
                                <div key={laverie.id} className="flex gap-4 items-center">
                                    {/* Image de la laverie (avec fallback sur l'image par défaut) */}
                                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-sm">
                                        <img
                                            src={resolveUrl(laverie.image || IMAGE_LAVERIE_PAR_DEFAUT)}
                                            alt={laverie.imageAlt || laverie.nom}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (!target.src.endsWith(IMAGE_LAVERIE_PAR_DEFAUT)) {
                                                    target.src = resolveUrl(IMAGE_LAVERIE_PAR_DEFAUT);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Infos de la laverie */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm underline decoration-1 underline-offset-2">{laverie.nom}</h3>
                                        <p className="text-xs font-bold text-gray-800 mt-1">{laverie.adresse || 'Adresse inconnue'}</p>
                                        <span className={`px-3 py-1 text-[10px] rounded-full font-medium ${getBadgeStyle(laverie.statut)}`}>
                                            {laverie.statut}
                                        </span>
                                    </div>

                                    {/* Bouton "..." */}
                                    <Link to={`/admin/laveries/${laverie.id}`} className="bg-[#22ACE2] text-white p-2 rounded-xl hover:bg-blue-500 transition shadow-sm cursor-pointer shrink-0" aria-label={`Voir le détail de ${laverie.nom}`}>
                                        <MoreHorizontal size={16} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 underline decoration-1 underline-offset-2">Résultat : {user.professionnel.laveries.length}</p>
                    </div>
                )}

                <hr className="border-gray-200 mb-6" />

                {/* ZONE DE COMMENTAIRE */}
                <div className="mb-6 relative w-[90%]">
                    <label
                        htmlFor="commentaire"
                        className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-medium text-gray-800"
                    >
                        Commentaire (Facultatif)
                    </label>
                    <textarea
                        id="commentaire"
                        rows={4}
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Tapez votre description..."
                        className="block w-full box-border border-[1.5px] border-black rounded-[1rem] p-4 text-sm focus:outline-none focus:border-[#22ACE2] resize-none bg-transparent"
                    ></textarea>
                </div>

                {errorMsg && (
                    <p className="text-red-500 text-sm mb-4 font-semibold text-center">{errorMsg}</p>
                )}

                {/* BOUTONS D'ACTION */}
                <div className="flex gap-4">
                    <button
                        onClick={handleAccepter}
                        className="flex-1 bg-[#34A853] hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                        Accepter
                    </button>
                    <button
                        onClick={handleRefuser}
                        className="flex-1 bg-[#EA4335] hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                        Refuser
                    </button>
                </div>

                {/* SECTION : MODÉRATION DU COMPTE (US37) — uniquement utilisateurs standards (pas pro) */}
                {!user.professionnel && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-4">
                            {t('main.gestion_utilisateurs.blocage.section_titre')}
                        </h2>

                        {user.estBanni ? (
                            <div className="rounded-2xl border border-gray-300 bg-gray-100 p-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 text-white inline-flex items-center justify-center shrink-0">
                                        <Ban size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900">
                                            {user.estBanniDefinitif
                                                ? t('main.gestion_utilisateurs.blocage.banni_definitif')
                                                : t('main.gestion_utilisateurs.blocage.banni_jusquau', { date: formatDateCourte(user.banniJusquA) })}
                                        </p>
                                        {user.banniMotif && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">{t('main.gestion_utilisateurs.blocage.motif_label')} : </span>
                                                <i>{user.banniMotif}</i>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleDebloquer}
                                    disabled={blocagePending}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#34A853] hover:bg-green-600 text-white font-medium py-2.5 rounded-full shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <ShieldCheck size={16} />
                                    {t('main.gestion_utilisateurs.blocage.bouton_debloquer')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setModaleBlocageOuverte(true)}
                                disabled={blocagePending}
                                className="w-full inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-full shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <Ban size={16} />
                                {t('main.gestion_utilisateurs.blocage.bouton_bloquer')}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* MODALE BLOCAGE */}
            <ModaleBlocageUtilisateur
                isOpen={modaleBlocageOuverte}
                user={user ? { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email } : null}
                pending={blocagePending}
                onConfirm={handleConfirmerBlocage}
                onCancel={() => setModaleBlocageOuverte(false)}
            />
        </div>
    );
}