import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { fetchAdminUtilisateurs, type FiltresUtilisateurs } from '../../services/request';
import { AccessibleModal } from '../../components/accessibility';
import FilterModal, { type FilterSection, type FilterValues } from '../../components/FilterModal';

interface Laverie {
    id: number;
    nom: string;
    statut: string;
}

interface Professionnel {
    id: number;
    siren: string;
    statut: 'En attente' | 'Validé' | 'Refusé' | 'Banni' | 'Supprimé';
    laveries: Laverie[];
}

interface Utilisateur {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    statut: string;
    ville?: string;
    codePostal?: string;
    professionnel?: Professionnel;
}

interface Pagination {
    pageCourante: number;
    totalPages: number;
    totalResultats: number;
    parPage: number;
    aPageSuivante: boolean;
    aPagePrecedente: boolean;
}

const FILTER_SECTIONS: FilterSection[] = [
    {
        label: 'Statut',
        key: 'statut',
        options: [
            { label: 'Tous', value: '' },
            { label: 'Validé', value: 'Validé' },
            { label: 'Refusé', value: 'Refusé' },
            { label: 'En attente', value: 'En attente' },
        ],
    },
    {
        label: 'Type',
        key: 'type',
        options: [
            { label: 'Tous', value: '' },
            { label: 'Clients', value: 'clients' },
            { label: 'Professionnels', value: 'professionnels' },
        ],
    },
    {
        label: 'Propriétaire',
        key: 'proprietaire',
        options: [
            { label: 'Aléatoire', value: '' },
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
        ],
    },
    {
        label: 'Ordre',
        key: 'ordre',
        options: [
            { label: 'Aléatoire', value: '' },
            { label: 'Croissant', value: 'croissant' },
            { label: 'Décroissant', value: 'decroissant' },
        ],
    },
];

const FILTRES_VIDES: FilterValues = {
    statut: '',
    type: '',
    proprietaire: '',
    ordre: '',
};

export default function GestionUtilisateurs() {
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [enAttenteCount, setEnAttenteCount] = useState<number>(0);
    const [chargement, setChargement] = useState<boolean>(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [modalOuverte, setModalOuverte] = useState<boolean>(false);
    const [utilisateurSelectionne, setUtilisateurSelectionne] = useState<Utilisateur | null>(null);

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    // Filtres
    const [filtreModalOuverte, setFiltreModalOuverte] = useState<boolean>(false);
    const [filtresActifs, setFiltresActifs] = useState<FilterValues>(() => {
        const savedFiltres = localStorage.getItem('utilisateursFiltres');
        return savedFiltres ? JSON.parse(savedFiltres) : { ...FILTRES_VIDES };
    });
    const [filtresTemp, setFiltresTemp] = useState<FilterValues>({ ...FILTRES_VIDES });

    const aDesFiltresActifs = Object.values(filtresActifs).some((v) => v !== '');

    const chargerDonnees = useCallback(async () => {
        setChargement(true);
        try {
            const filtresApi: FiltresUtilisateurs = {};
            if (filtresActifs.statut) filtresApi.statut = filtresActifs.statut;
            if (filtresActifs.type) filtresApi.type = filtresActifs.type;
            if (filtresActifs.proprietaire) filtresApi.proprietaire = filtresActifs.proprietaire;
            if (filtresActifs.ordre) filtresApi.ordre = filtresActifs.ordre;

            const data = await fetchAdminUtilisateurs(page, filtresApi);
            setUtilisateurs(data.utilisateurs);
            setEnAttenteCount(data.totalEnAttente);
            setPagination(data.pagination);
        } catch {
            setErreur("Impossible de charger les utilisateurs.");
        } finally {
            setChargement(false);
        }
    }, [page, filtresActifs]);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    const getBadgeStyle = (statut: string) => {
        switch (statut) {
            case 'Refusé':
                return 'bg-red-100 text-red-500 border-red-300';
            case 'En attente':
                return 'bg-orange-100 text-orange-500 border-orange-300';
            case 'Validé':
                return 'bg-green-100 text-green-500 border-green-300';
            case 'Banni':
            case 'Supprimé':
                return 'bg-gray-800 text-white border-gray-900';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-300';
        }
    };

    const ouvrirModal = (user: Utilisateur) => {
        setUtilisateurSelectionne(user);
        setModalOuverte(true);
    };

    const fermerModal = () => {
        setModalOuverte(false);
        setUtilisateurSelectionne(null);
    };

    // Pagination
    const allerPageSuivante = () => {
        if (pagination?.aPageSuivante) setPage((p: number) => p + 1);
    };

    const allerPagePrecedente = () => {
        if (pagination?.aPagePrecedente) setPage((p: number) => p - 1);
    };

    // Filtres
    const ouvrirFiltres = () => {
        setFiltresTemp({ ...filtresActifs });
        setFiltreModalOuverte(true);
    };

    const handleFiltreChange = (key: string, value: string) => {
        setFiltresTemp((prev: FilterValues) => ({ ...prev, [key]: value }));
    };

    const appliquerFiltres = (filtres: FilterValues) => {
        setFiltresActifs(filtres);
        localStorage.setItem('utilisateursFiltres', JSON.stringify(filtres));
        setPage(1);
    };

    const effacerFiltres = () => {
        setFiltresTemp({ ...FILTRES_VIDES });
        setFiltresActifs({ ...FILTRES_VIDES });
        localStorage.removeItem('utilisateursFiltres');
        setPage(1);
        setFiltreModalOuverte(false);
    };

    const navigate = useNavigate();

    if (chargement && page === 1 && !aDesFiltresActifs) {
        return <div className="text-center mt-20 font-bold text-[#22ACE2]">Chargement des données...</div>;
    }

    if (erreur) {
        return <div className="text-center mt-20 font-bold text-red-500">{erreur}</div>;
    }

    return (
        <div className="w-full pt-24 px-4 pb-16 font-sans">

            {/* HEADER */}
            <div className="bg-white flex items-center justify-between p-4 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/admin/tableau-de-bord" className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition block" aria-label="Retour">
                        <img src="/src/assets/arrow_back_ios.svg" alt="" className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Gestion des utilisateurs</h1>
                </div>

                {/* Boutons de Filtre (Logique conditionnelle) */}
                <div className="flex items-center gap-3">
                    {aDesFiltresActifs ? (
                        <>
                            <button
                                onClick={effacerFiltres}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            >
                                Effacer
                            </button>
                            <button
                                onClick={ouvrirFiltres}
                                className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition cursor-pointer"
                                aria-label="Ouvrir les filtres (Filtres actifs)"
                            >
                                <img src="/src/assets/layers_clear.svg" alt="Filtres actifs" className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={ouvrirFiltres}
                            className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition cursor-pointer"
                            aria-label="Ouvrir les filtres"
                        >
                            <img src="/src/assets/filter_alt.svg" alt="Aucun filtre" className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4">
                {/* ENCART "UTILISATEURS EN ATTENTE" */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm mb-8 mx-4">
                    <h2 className="font-bold mb-4">Utilisateurs en attentes</h2>
                    <img src="/src/assets/person_outline.svg" alt="Utilisateurs en attente" className="w-10 h-10 mx-auto mb-2 text-black" />
                    <p className="text-green-500 font-bold text-xl">+{enAttenteCount}</p>
                </div>

                {/* INDICATEUR DE CHARGEMENT */}
                {chargement && (
                    <div className="text-center py-4 text-[#22ACE2] font-medium">Chargement...</div>
                )}

                {/* LISTE DES UTILISATEURS */}
                <div className={`space-y-6 ${chargement ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                    {utilisateurs.map((user) => (
                        <div key={user.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative">

                            {/* En-tête */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg underline decoration-1 underline-offset-4">
                                    {user.professionnel ? 'Professionnels' : 'Utilisateur'}
                                </h3>

                                <div className="flex items-center gap-2">
                                    {user.professionnel ? (
                                        <span className={`px-3 py-1 text-sm rounded-full border ${getBadgeStyle(user.professionnel.statut)}`}>
                                            {user.professionnel.statut}
                                        </span>
                                    ) : (
                                        <span className={`px-3 py-1 text-sm rounded-full border ${getBadgeStyle(user.statut)}`}>
                                            {user.statut}
                                        </span>
                                    )}
                                    <Link to={`/admin/utilisateurs/${user.id}`} className="bg-[#22ACE2] hover:bg-blue-500 p-1.5 rounded-md text-white transition-colors cursor-pointer flex items-center justify-center" aria-label="Voir les détails">
                                        <img src="/src/assets/more_horiz.svg" alt="" className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 text-sm space-y-1.5">
                                    <p><span className="font-bold">Prénom :</span> <span className="italic text-gray-600">{user.prenom}</span></p>
                                    <p><span className="font-bold">Nom :</span> <span className="italic text-gray-600">{user.nom}</span></p>

                                    {user.professionnel && (
                                        <>
                                            <p><span className="font-bold">Ville :</span> <span className="italic text-gray-600">{user.ville}</span></p>
                                            <p><span className="font-bold">Code postal :</span> <span className="italic text-gray-600">{user.codePostal}</span></p>
                                        </>
                                    )}

                                    <p><span className="font-bold">Email :</span> <span className="italic text-gray-600">{user.email}</span></p>

                                    {user.professionnel && (
                                        <p className="mt-2"><span className="font-bold">SIREN/SIRET :</span> <span className="italic text-red-400">{user.professionnel.siren}</span></p>
                                    )}
                                </div>

                                {/* Laveries (Si pro) */}
                                {user.professionnel && user.professionnel.laveries && user.professionnel.laveries.length > 0 && (
                                    <div className="w-[90%] md:w-48 border border-gray-200 rounded-xl p-3 h-fit">
                                        <p className="font-bold underline text-sm mb-2">Laveries :</p>
                                        <ul className="space-y-1">
                                            {user.professionnel.laveries.slice(0, 3).map(laverie => (
                                                <li key={laverie.id} className="flex justify-between items-center text-sm italic text-gray-700">
                                                    {laverie.nom}
                                                    <span className={`w-3 h-3 rounded-full ${laverie.statut === 'vert' ? 'bg-green-500' :
                                                            laverie.statut === 'rouge' ? 'bg-red-500' :
                                                                laverie.statut === 'noir' ? 'bg-gray-800' :
                                                                    'bg-orange-500'
                                                        }`}></span>
                                                </li>
                                            ))}
                                        </ul>
                                        {user.professionnel.laveries.length > 3 && (
                                            <p className="text-xs font-semibold text-[#22ACE2] mt-2 text-right">
                                                +{user.professionnel.laveries.length - 3}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bouton Action */}
                            {(user.professionnel?.statut === 'En attente' || (!user.professionnel && user.statut === 'En attente')) && (
                            <div className="flex justify-end mt-4">
                                <button
                                    /* On remplace ouvrirModal par navigate vers la bonne route */
                                    onClick={() => navigate(`/admin/utilisateurs/${user.id}`)}
                                    className="bg-[#22ACE2] hover:bg-blue-500 cursor-pointer text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
                                >
                                    Répondre
                                </button>
                            </div>
                        )}
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                {pagination && (
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
                            Précédent
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
                            Suivant
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                )}

                {/* MODALE DE RÉPONSE */}
                <AccessibleModal
                    isOpen={modalOuverte}
                    onClose={fermerModal}
                    title={`Gestion de : ${utilisateurSelectionne?.nom || ''}`}
                >
                    {utilisateurSelectionne && (
                        <div className="mt-4">
                            <p className="mb-4">Voulez-vous valider ou refuser le compte de <strong>{utilisateurSelectionne.prenom} {utilisateurSelectionne.nom}</strong> ?</p>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-green-500 hover:bg-green-600 cursor-pointer text-white py-2 px-4 rounded-lg font-bold transition-colors">
                                    Valider
                                </button>
                                <button className="flex-1 bg-red-500 hover:bg-red-600 cursor-pointer text-white py-2 px-4 rounded-lg font-bold transition-colors">
                                    Refuser
                                </button>
                            </div>
                        </div>
                    )}
                </AccessibleModal>

                {/* MODALE DES FILTRES */}
                <FilterModal
                    isOpen={filtreModalOuverte}
                    onClose={() => setFiltreModalOuverte(false)}
                    onApply={appliquerFiltres}
                    onClear={effacerFiltres}
                    sections={FILTER_SECTIONS}
                    values={filtresTemp}
                    onChange={handleFiltreChange}
                />
            </div>
        </div>
    );
}