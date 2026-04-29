import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ListX, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { fetchAdminLaveries, type FiltresLaveries } from '../../services/request';
import FilterModal, { type FilterSection, type FilterValues } from '../../components/FilterModal';

interface LaveriePro {
    id: number;
    nom: string;
    prenom: string;
}

interface LaverieItem {
    id: number;
    nom: string;
    statut: string;
    adresse: string;
    image?: string;
    professionnel: LaveriePro;
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
            { label: 'Validée', value: 'Validée' },
            { label: 'Refusée', value: 'Refusée' },
            { label: 'En attente', value: 'En attente' },
        ],
    },
    {
        label: 'Trie',
        key: 'ordre',
        options: [
            { label: 'Par défaut', value: '' },
            { label: 'De A à Z', value: 'croissant' },
            { label: 'De Z à A', value: 'decroissant' },
        ],
    },
];

const FILTRES_VIDES: FilterValues = {
    statut: '',
    ordre: '',
};

const FILTRES_DEFAUT: FilterValues = {
    ...FILTRES_VIDES,
    ordre: 'decroissant',
};

export default function GestionLaveries() {
    const [laveries, setLaveries] = useState<LaverieItem[]>([]);
    const [enAttenteCount, setEnAttenteCount] = useState<number>(0);
    const [chargement, setChargement] = useState<boolean>(true);
    const [erreur, setErreur] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    // Filtres
    const [filtreModalOuverte, setFiltreModalOuverte] = useState<boolean>(false);
    const [filtresActifs, setFiltresActifs] = useState<FilterValues>(() => {
        const savedFiltres = localStorage.getItem('laveriesFiltres');
        return savedFiltres ? JSON.parse(savedFiltres) : { ...FILTRES_DEFAUT };
    });
    const [filtresTemp, setFiltresTemp] = useState<FilterValues>({ ...FILTRES_DEFAUT });

    const aDesFiltresActifs = Object.values(filtresActifs).some((v) => v !== '');

    const chargerDonnees = useCallback(async () => {
        setChargement(true);
        try {
            const filtresApi: FiltresLaveries = {};
            if (filtresActifs.statut) filtresApi.statut = filtresActifs.statut;
            if (filtresActifs.ordre) filtresApi.ordre = filtresActifs.ordre;

            const data = await fetchAdminLaveries(page, filtresApi);

            setLaveries(data.laveries);
            setEnAttenteCount(data.totalEnAttente);
            setPagination(data.pagination);
        } catch {
            setErreur("Impossible de charger les laveries.");
        } finally {
            setChargement(false);
        }
    }, [page, filtresActifs]);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    const getBadgeStyle = (statut: string) => {
        switch (statut) {
            case 'Refusée':
                return 'bg-red-100 text-red-500 border-red-300';
            case 'En attente':
                return 'bg-orange-100 text-orange-500 border-orange-300';
            case 'Validée':
                return 'bg-green-100 text-green-500 border-green-300';
            case 'Banni':
            case 'Supprimée':
                return 'bg-gray-800 text-white border-gray-900';
            default:
                return 'bg-gray-100 text-gray-500 border-gray-300';
        }
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
        localStorage.setItem('laveriesFiltres', JSON.stringify(filtres));
        setPage(1);
    };

    const effacerFiltres = () => {
        setFiltresTemp({ ...FILTRES_VIDES });
        setFiltresActifs({ ...FILTRES_VIDES });
        localStorage.removeItem('laveriesFiltres');
        setPage(1);
        setFiltreModalOuverte(false);
    };

    if (chargement && page === 1 && !aDesFiltresActifs) {
        return <div className="text-center mt-20 font-bold text-[#22ACE2]">Chargement des données...</div>;
    }

    if (erreur) {
        return <div className="text-center mt-20 font-bold text-red-500">{erreur}</div>;
    }

    return (
        <div className="w-full pt-24 px-4 pb-16 font-sans max-w-[stretch]">

            {/* HEADER */}
            <div className="bg-white flex items-center justify-between p-4 shadow-sm mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/admin/tableau-de-bord" className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition block" aria-label="Retour">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold">Gestion des laveries</h1>
                </div>

                {/* Boutons de Filtre */}
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
                                className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer"
                                aria-label="Ouvrir les filtres (Filtres actifs)"
                            >
                                <ListX size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={ouvrirFiltres}
                            className="bg-[#14A8DE] text-white p-1.5 rounded-md hover:bg-[#1296c8] transition cursor-pointer"
                            aria-label="Ouvrir les filtres"
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4">
                {/* ENCART "LAVERIES EN ATTENTE" */}
                <div className="bg-[#DAF5FF] border border-[#14A8DE] rounded-2xl p-6 text-center shadow-sm mb-8 mx-4">
                    <h2 className="font-bold mb-4">Laveries en attentes</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-black">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <circle cx="12" cy="14" r="4" />
                        <line x1="8" y1="7" x2="8" y2="7.01" />
                        <line x1="12" y1="7" x2="12" y2="7.01" />
                    </svg>
                    <p className="text-green-500 font-bold text-xl">{enAttenteCount}</p>
                </div>

                {/* INDICATEUR DE CHARGEMENT */}
                {chargement && (
                    <div className="text-center py-4 text-[#22ACE2] font-medium">Chargement...</div>
                )}

                {/* LISTE DES LAVERIES */}
                <div className={`space-y-6 ${chargement ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                    {laveries.map((laverie) => (
                        <div key={laverie.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative">

                            <div className="w-full h-40 bg-gray-200 relative">
                                {laverie.image ? (
                                    <img src={laverie.image} alt={laverie.nom} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Aucune image</div>
                                )}

                                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                                    <span className={`px-3 py-1 text-xs rounded-full border font-medium shadow-sm ${getBadgeStyle(laverie.statut)}`}>
                                        {laverie.statut}
                                    </span>
                                    <Link to={`/admin/laveries/${laverie.id}`} className="bg-[#22ACE2] hover:bg-blue-500 p-1.5 rounded-xl text-white transition-colors cursor-pointer flex items-center justify-center shadow-md" aria-label="Voir les détails">
                                        <MoreHorizontal size={20} />
                                    </Link>
                                </div>
                            </div>

                            {/* Contenu (en dessous de l'image) */}
                            <div className="p-4">
                                <h3 className="font-bold text-sm underline decoration-1 underline-offset-2 mb-1">{laverie.nom}</h3>
                                <p className="text-xs font-bold text-gray-800">{laverie.adresse}</p>

                                {laverie.statut === 'En attente' && (
                                    <div className="flex justify-end mt-3">
                                        <Link
                                            to={`/admin/laveries/${laverie.id}`}
                                            className="bg-[#22ACE2] hover:bg-blue-500 cursor-pointer text-white font-medium py-2 px-6 rounded-full text-sm transition-colors shadow-sm inline-block"
                                        >
                                            Répondre
                                        </Link>
                                    </div>
                                )}
                            </div>
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
