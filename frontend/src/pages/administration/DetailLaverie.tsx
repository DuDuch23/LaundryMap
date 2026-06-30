import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Timer, Euro, Weight, ChevronLeft, Key, LayoutGrid, User } from 'lucide-react';
import { fetchLaverieDetail, updateLaverieStatut } from '../../services/request';
import { AccessibleModal, AccessibleInput } from '../../components/accessibility';
import ItineraireButton from '../../components/map/ItineraireButton';
import { resolveUrl } from '../../services/api';
import { LaverieAdminDetailSkeleton } from '../../components/administration/AdminSkeletons';

const IMAGE_LAVERIE_PAR_DEFAUT = '/uploads/laveries/default-laundry.jpg';

interface ImageDetail {
    url: string;
    description: string;
}

interface Equipement {
    id: number;
    nom: string;
    type: string;
    capacite: number;
    tarif: number;
    duree: number;
}

interface Horaire {
    jour: string;
    heureDebut: string;
    heureFin: string;
}

type SocialMediaType = 'site_web' | 'facebook' | 'instagram' | 'x' | 'linkedin';

interface LaverieDetailData {
    id: number;
    nom: string;
    statut: string;
    description?: string;
    adresse: string;
    latitude?: number;
    longitude?: number;
    wiLineReference?: number;
    logo?: string | null;
    images: ImageDetail[];
    equipements: Equipement[];
    horaires: Horaire[];
    socialMedias?: Partial<Record<SocialMediaType, string>>;
    professionnel: {
        utilisateurId: number;
        id: number;
        nom: string;
        prenom: string;
    };
}

function formatHoraires(horaires: Horaire[]): string[] {
    if (!horaires || horaires.length === 0) return ['Aucun horaire renseigné'];

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const joursWeekend = ['Samedi', 'Dimanche'];

    const parJour: Record<string, string> = {};
    for (const h of horaires) {
        parJour[h.jour] = `${h.heureDebut.replace(':', 'h')} - ${h.heureFin.replace(':', 'h')}`;
    }

    const lignes: string[] = [];

    const horairesSemaine = joursSemaine.map(j => parJour[j]).filter(Boolean);
    const tousPareilSemaine = horairesSemaine.length > 0 && horairesSemaine.every(h => h === horairesSemaine[0]);

    if (tousPareilSemaine && horairesSemaine.length === 5) {
        lignes.push(`Lundi au vendredi :\n${horairesSemaine[0]}`);
    } else {
        for (const jour of joursSemaine) {
            if (parJour[jour]) lignes.push(`${jour} :\n${parJour[jour]}`);
        }
    }

    const horairesWeekend = joursWeekend.map(j => parJour[j]).filter(Boolean);
    const tousPareilWeekend = horairesWeekend.length > 0 && horairesWeekend.every(h => h === horairesWeekend[0]);

    if (horairesWeekend.length === 0) {
        lignes.push('Samedi - Dimanche :\nFermée');
    } else if (tousPareilWeekend && horairesWeekend.length === 2) {
        lignes.push(`Samedi - Dimanche :\n${horairesWeekend[0]}`);
    } else {
        for (const jour of joursWeekend) {
            if (parJour[jour]) {
                lignes.push(`${jour} :\n${parJour[jour]}`);
            } else {
                lignes.push(`${jour} :\nFermée`);
            }
        }
    }

    return lignes;
}

export default function DetailLaverie() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [laverie, setLaverie] = useState<LaverieDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentaire, setCommentaire] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [equipementModalOuverte, setEquipementModalOuverte] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                const data = await fetchLaverieDetail(id);
                setLaverie(data);
            } catch (error) {
                console.error("Erreur de chargement :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getBadgeStyle = (statut: string) => {
        switch (statut) {
            case 'Refusée':
                return 'bg-[#FDEDEC] text-[#E74C3C] border-[#E74C3C]';
            case 'En attente':
                return 'bg-[#FFF3E0] text-[#F39C12] border-[#F39C12]';
            case 'Validée':
                return 'bg-[#EAFaf1] text-[#2ECC71] border-[#2ECC71]';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-300';
        }
    };

    if (loading) {
        return <LaverieAdminDetailSkeleton />;
    }

    if (!laverie) {
        return <div className="text-center mt-20 font-bold text-red-500">Laverie introuvable.</div>;
    }

    const handleAccepter = async () => {
        try {
            await updateLaverieStatut(laverie.id, 'accepter', commentaire);
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
            await updateLaverieStatut(laverie.id, 'refuser', commentaire);
            navigate(-1);
        } catch (error) {
            console.error("Erreur lors du refus :", error);
            setErrorMsg('Une erreur est survenue lors du refus.');
        }
    };

    const horairesFormates = formatHoraires(laverie.horaires);
    const equipementsAffichage = laverie.equipements.slice(0, 2);

    return (
        <div className="w-full mx-auto bg-gray-50 min-h-screen font-sans relative pb-10">

            {/* HEADER IMAGE */}
            <div className="relative h-64 bg-slate-800 w-full overflow-hidden">
                <img
                    src={resolveUrl(laverie.logo || laverie.images?.[0]?.url || IMAGE_LAVERIE_PAR_DEFAUT)}
                    alt={laverie.nom}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith(IMAGE_LAVERIE_PAR_DEFAUT)) {
                            target.src = resolveUrl(IMAGE_LAVERIE_PAR_DEFAUT);
                        }
                    }}
                />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-20 left-4 w-8 h-8 rounded-xl shadow-md z-10 transition-colors cursor-pointer flex items-center justify-center bg-[#14A8DE]"
                    aria-label="Retour"
                >
                    <ArrowLeft size={16} className="text-white" />
                </button>
            </div>

            {/* CONTENU PRINCIPAL */}
            <div className="relative bg-white rounded-t-[2.5rem] px-6 pt-12 pb-8 -mt-10 shadow-lg min-h-screen">

                {/* Icône machine (À cheval) */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <circle cx="12" cy="14" r="4" />
                        <line x1="8" y1="7" x2="8" y2="7.01" />
                        <line x1="12" y1="7" x2="12" y2="7.01" />
                    </svg>
                </div>

                {/* NOM ET STATUT */}
                <div className="text-start mb-6 mt-2">
                    <h1 className="text-2xl font-extrabold underline decoration-[2px] decoration-black underline-offset-4 mb-3">
                        {laverie.nom}
                    </h1>
                    <span className={`inline-block px-4 py-1 text-sm rounded-full font-medium border ${getBadgeStyle(laverie.statut)}`}>
                        {laverie.statut}
                    </span>
                </div>

                {/* DESCRIPTION + ADRESSE */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{laverie.adresse}</p>
                    </div>
                    {laverie.description && (
                        <div>
                            <p className="text-sm text-gray-700 leading-relaxed">{laverie.description}</p>
                        </div>
                    )}
                </div>

                {/* IMAGES (SCROLL HORIZONTAL) */}
                {laverie.images.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-bold text-base underline decoration-[1.5px] decoration-black underline-offset-4 mb-4">Image :</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {laverie.images.map((img, index) => (
                                <div key={index} className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 shrink-0 shadow-sm border border-gray-100">
                                    <img src={resolveUrl(img.url)} alt={img.description || `Image ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EQUIPEMENTS + HORAIRES (2 COLONNES) */}
                <div className="grid grid-cols-2 gap-6 mb-8">

                    {/* Colonne de gauche : Equipements */}
                    <div className="flex flex-col">
                        <h2 className="font-bold text-base underline decoration-[1.5px] decoration-black underline-offset-4 mb-4">Services proposés :</h2>

                        <div className="space-y-4 mb-4">
                            {equipementsAffichage.map((eq) => (
                                <div key={eq.id}>
                                    <p className="font-bold text-sm underline decoration-1 underline-offset-2 mb-2">{eq.nom}</p>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <p className="flex items-center gap-2"><Timer size={13} className="text-gray-800" /> {eq.duree}min</p>
                                        <p className="flex items-center gap-2"><Euro size={13} className="text-gray-800" /> {eq.tarif}€</p>
                                        <p className="flex items-center gap-2"><Weight size={13} className="text-gray-800" /> {eq.capacite}kg</p>
                                    </div>
                                </div>
                            ))}
                            {laverie.equipements.length === 0 && (
                                <p className="text-xs text-gray-500">Aucun équipement</p>
                            )}
                        </div>

                        {laverie.equipements.length > 2 && (
                            <button
                                onClick={() => setEquipementModalOuverte(true)}
                                className="bg-[#14A8DE] text-white hover:bg-[#1296c8] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 w-max mt-auto"
                            >
                                <LayoutGrid size={14} />
                                Voir plus
                            </button>
                        )}
                    </div>

                    {/* Colonne de droite : Horaires */}
                    <div className="flex flex-col">
                        <h2 className="font-bold text-base underline decoration-[1.5px] decoration-black underline-offset-4 mb-4">Horaire :</h2>
                        
                        <div className="text-xs text-gray-700 space-y-3 mb-4">
                            {horairesFormates.map((ligne, i) => (
                                <p key={i} className="whitespace-pre-line leading-relaxed">{ligne}</p>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-auto w-full">
                            
                            <Link
                                to={`/admin/utilisateurs/${laverie.professionnel.utilisateurId}`}
                                className="w-full sm:flex-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 h-[34px] shadow-sm"
                            >
                                <User size={14} className="flex-shrink-0 text-[#14A8DE]" />
                                <span className="truncate">Propriétaire</span>
                            </Link>

                            {/* On n'utilise -mt-2 que sur grand écran (sm:-mt-2) car sur mobile ils sont l'un sous l'autre ! */}
                            {laverie.latitude && laverie.longitude ? (
                                <div className="w-full sm:flex-1 sm:-mt-2">
                                    <ItineraireButton lat={laverie.latitude} lng={laverie.longitude} nom={laverie.nom} />
                                </div>
                            ) : (
                                <div className="w-full sm:flex-1 text-center text-[10px] italic text-gray-400">
                                    Coordonnées manquantes
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 mb-6" />

                {/* WI-LINE */}
                <div className="mb-6">
                    <h2 className="font-bold text-base underline decoration-[1.5px] decoration-black underline-offset-4 mb-4">WI-LINE :</h2>
                    <AccessibleInput
                        id="wiline-ref"
                        type="text"
                        value={laverie.wiLineReference ? String(laverie.wiLineReference) : ''}
                        disabled
                        placeholder="Aucune clée Wi-LINE renseignée"
                        className="w-[90%]"
                    />
                </div>

                {/* RÉSEAUX SOCIAUX */}
                {laverie.socialMedias && Object.keys(laverie.socialMedias).length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-bold text-base underline decoration-[1.5px] decoration-black underline-offset-4 mb-4">Réseaux sociaux :</h2>
                        <div className="flex flex-wrap gap-3">
                            {([
                                {
                                    key: 'site_web' as SocialMediaType,
                                    label: 'Site web',
                                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                                },
                                {
                                    key: 'facebook' as SocialMediaType,
                                    label: 'Facebook',
                                    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                                },
                                {
                                    key: 'instagram' as SocialMediaType,
                                    label: 'Instagram',
                                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
                                },
                                {
                                    key: 'x' as SocialMediaType,
                                    label: 'X',
                                    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                                },
                                {
                                    key: 'linkedin' as SocialMediaType,
                                    label: 'LinkedIn',
                                    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
                                },
                            ] as const).map(({ key, label, icon }) =>
                                laverie.socialMedias![key] ? (
                                    <a
                                        key={key}
                                        href={laverie.socialMedias![key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600 shadow-sm border border-gray-200 transition hover:bg-[#EBF8FD] hover:text-[#14A8DE] hover:border-[#14A8DE]"
                                    >
                                        {icon}
                                    </a>
                                ) : null
                            )}
                        </div>
                    </div>
                )}

                {/* COMMENTAIRE */}
                <fieldset className="border border-black rounded-xl p-1 relative mb-6">
                    <legend className="text-xs font-medium px-2 ml-2 text-gray-800">Commentaire (Facultatif)</legend>
                    <textarea
                        rows={4}
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Tapez votre description..."
                        className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none"
                    ></textarea>
                </fieldset>

                {errorMsg && (
                    <p className="text-red-500 text-sm mb-4 font-semibold text-center">{errorMsg}</p>
                )}

                {/* BOUTONS ACTION ACCEPTER / REFUSER */}
                {laverie.statut === 'En attente' && (
                    <div className="flex gap-4 mt-8">
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
                )}
            </div>

            {/* MODALE EQUIPEMENTS (inchangée) */}
            <AccessibleModal
                isOpen={equipementModalOuverte}
                onClose={() => setEquipementModalOuverte(false)}
                title={`Équipements - ${laverie.nom}`}
            >
                <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {laverie.equipements.map((eq) => (
                            <div key={eq.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-white">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="font-bold text-sm underline decoration-1 underline-offset-2">{eq.nom}</p>
                                    <span className="w-3 h-3 rounded-full bg-[#34A853]"></span>
                                </div>
                                <div className="text-sm text-gray-700 space-y-1.5 font-medium">
                                    <p className="flex items-center gap-2"><Timer size={14} className="text-gray-800" /> {eq.duree}min</p>
                                    <p className="flex items-center gap-2"><Euro size={14} className="text-gray-800" /> {eq.tarif}€</p>
                                    <p className="flex items-center gap-2"><Weight size={14} className="text-gray-800" /> {eq.capacite}kg</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setEquipementModalOuverte(false)}
                            className="bg-[#22ACE2] hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full text-sm transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <ChevronLeft size={16} />
                            Fermer
                        </button>
                    </div>
                </div>
            </AccessibleModal>
        </div>
    );
}