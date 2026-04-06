import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Timer, Euro, Weight, X, ChevronLeft } from 'lucide-react';
import { fetchLaverieDetail, updateLaverieStatut } from '../../services/request';
import { AccessibleModal } from '../../components/accessibility';

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

interface LaverieDetailData {
    id: number;
    nom: string;
    statut: string;
    description?: string;
    adresse: string;
    distance?: string;
    wiLineReference?: number;
    images: ImageDetail[];
    equipements: Equipement[];
    horaires: Horaire[];
    professionnel: {
        utilisateurId: number;
        id: number;
        nom: string;
        prenom: string;
    };
}

function formatHoraires(horaires: Horaire[]): string[] {
    if (!horaires || horaires.length === 0) return ['Aucun horaire renseigné'];

    const joursOrdre = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const joursWeekend = ['Samedi', 'Dimanche'];

    const parJour: Record<string, string> = {};
    for (const h of horaires) {
        parJour[h.jour] = `${h.heureDebut.replace(':', 'h')} - ${h.heureFin.replace(':', 'h')}`;
    }

    const lignes: string[] = [];

    // Vérifier si tous les jours de la semaine ont le même horaire
    const horairesSemaine = joursSemaine.map(j => parJour[j]).filter(Boolean);
    const tousPareilSemaine = horairesSemaine.length > 0 && horairesSemaine.every(h => h === horairesSemaine[0]);

    if (tousPareilSemaine && horairesSemaine.length === 5) {
        lignes.push(`Lundi au vendredi :\n${horairesSemaine[0]}`);
    } else {
        for (const jour of joursSemaine) {
            if (parJour[jour]) {
                lignes.push(`${jour} :\n${parJour[jour]}`);
            }
        }
    }

    // Weekend
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
                return 'bg-red-100 text-red-500 border border-red-300';
            case 'En attente':
                return 'bg-orange-100 text-orange-500 border border-orange-300';
            case 'Validée':
                return 'bg-green-100 text-green-500 border border-green-300';
            default:
                return 'bg-gray-100 text-gray-500 border border-gray-300';
        }
    };

    if (loading) {
        return <div className="text-center mt-20 font-bold text-[#22ACE2]">Chargement des détails...</div>;
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
            <div className="relative h-56 bg-slate-800 w-full overflow-hidden">
                {laverie.images?.[0]?.url && (
                    <img
                        src={laverie.images[0].url}
                        alt={laverie.images[0].description || laverie.nom}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
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

            {/* CONTENU PRINCIPAL */}
            <div className="relative bg-white rounded-t-[3rem] px-6 pt-12 pb-8 -mt-12 shadow-lg min-h-screen">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

                {/* Icône machine */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <circle cx="12" cy="14" r="4" />
                        <line x1="8" y1="7" x2="8" y2="7.01" />
                        <line x1="12" y1="7" x2="12" y2="7.01" />
                    </svg>
                </div>

                {/* NOM ET STATUT */}
                <div className="text-start mb-4 mt-2">
                    <h1 className="text-2xl font-bold underline decoration-2 underline-offset-4 mb-3">
                        {laverie.nom}
                    </h1>
                    <span className={`px-4 py-1.5 text-sm rounded-full font-medium ${getBadgeStyle(laverie.statut)}`}>
                        {laverie.statut}
                    </span>
                </div>

                {/* DESCRIPTION + ADRESSE */}
                <div className="flex gap-4 mb-6 mt-4">
                    <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{laverie.adresse}</p>
                        <p className="text-xs italic text-gray-500 mb-3">{laverie.distance || 'à X km de votre position'}</p>
                    </div>
                    {laverie.description && (
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 leading-relaxed">{laverie.description}</p>
                        </div>
                    )}
                </div>

                {/* IMAGES */}
                {laverie.images.length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-3">Image :</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {laverie.images.map((img, index) => (
                                <div key={index} className="w-24 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-sm">
                                    <img src={img.url} alt={img.description || `Image ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EQUIPEMENTS + HORAIRES */}
                <div className="flex gap-6 mb-6">
                    {/* Equipements */}
                    <div className="flex-1">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-3">Equipements :</h2>
                        <div className="space-y-3">
                            {equipementsAffichage.map((eq) => (
                                <div key={eq.id}>
                                    <p className="font-bold text-xs underline decoration-1 underline-offset-2">{eq.nom}</p>
                                    <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                                        <p className="flex items-center gap-1"><Timer size={12} /> {eq.duree}min</p>
                                        <p className="flex items-center gap-1"><Euro size={12} /> {eq.tarif}€</p>
                                        <p className="flex items-center gap-1"><Weight size={12} /> {eq.capacite}kg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Horaires */}
                    <div className="flex-1">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-3">Horaire :</h2>
                        <div className="text-xs text-gray-700 space-y-2">
                            {horairesFormates.map((ligne, i) => (
                                <p key={i} className="whitespace-pre-line">{ligne}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOUTONS VOIR PLUS / VOIR PROPRIETAIRE */}
                <div className="flex gap-3 mb-6">
                    {laverie.equipements.length > 2 && (
                        <button
                            onClick={() => setEquipementModalOuverte(true)}
                            className="flex-1 border-2 border-[#22ACE2] text-[#22ACE2] font-bold py-2.5 px-4 rounded-xl text-sm transition-colors hover:bg-[#22ACE2] hover:text-white cursor-pointer flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="14" r="4" /><line x1="8" y1="7" x2="8" y2="7.01" /><line x1="12" y1="7" x2="12" y2="7.01" /></svg>
                            Voir plus
                        </button>
                    )}
                    <Link
                        to={`/admin/utilisateurs/${laverie.professionnel.utilisateurId}`}
                        className="flex-1 border-2 border-[#22ACE2] text-[#22ACE2] font-bold py-2.5 px-4 rounded-xl text-sm transition-colors hover:bg-[#22ACE2] hover:text-white cursor-pointer flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Voir propriétaire
                    </Link>
                </div>

                {/* WI-LINE */}
                {laverie.wiLineReference && (
                    <div className="mb-6">
                        <h2 className="font-bold text-sm underline underline-offset-4 decoration-1 mb-2">Wi-LINE</h2>
                        <p className="text-xs text-gray-600 font-mono tracking-wider">Réf : {laverie.wiLineReference}</p>
                    </div>
                )}

                <hr className="border-gray-200 mb-6" />

                {/* COMMENTAIRE */}
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

                {/* BOUTONS ACTION */}
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
            </div>

            {/* MODALE EQUIPEMENTS */}
            <AccessibleModal
                isOpen={equipementModalOuverte}
                onClose={() => setEquipementModalOuverte(false)}
                title={laverie.nom}
            >
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-3">
                        {laverie.equipements.map((eq) => (
                            <div key={eq.id} className="border border-gray-200 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="font-bold text-xs underline decoration-1 underline-offset-2">{eq.nom}</p>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p className="flex items-center gap-1"><Timer size={12} /> {eq.duree}min</p>
                                    <p className="flex items-center gap-1"><Euro size={12} /> {eq.tarif}€</p>
                                    <p className="flex items-center gap-1"><Weight size={12} /> {eq.capacite}kg</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-5">
                        <button
                            onClick={() => setEquipementModalOuverte(false)}
                            className="bg-[#22ACE2] hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <ChevronLeft size={16} />
                            Retour
                        </button>
                    </div>
                </div>
            </AccessibleModal>
        </div>
    );
}
