import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchUtilisateurDetail, updateUtilisateurStatut } from '../../services/request';

interface LaverieDetail {
    id: number;
    nom: string;
    statut: string;
    adresse: string;
    distance?: string;
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
    professionnel?: {
        id: number;
        siren: string;
        statut: string;
        laveries: LaverieDetail[];
    };
}

export default function DetailUtilisateur() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentaire, setCommentaire] = useState('');

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
            case 'Refusé':
                return 'bg-red-100 text-red-500 border border-red-300';
            case 'En attente':
                return 'bg-orange-100 text-orange-500 border border-orange-300';
            case 'Validé':
                return 'bg-green-100 text-green-500 border border-green-300';
            case 'Banni':
                return 'bg-gray-800 text-white border border-gray-900';
            default:
                return 'bg-gray-100 text-gray-500 border border-gray-300';
        }
    };

    if (loading) {
        return <div className="text-center mt-20 font-bold text-[#22ACE2]">Chargement des détails...</div>;
    }

    if (!user) {
        return <div className="text-center mt-20 font-bold text-red-500">Utilisateur introuvable.</div>;
    }

    // Actions simplifiées grâce à request.tsx
    const handleAccepter = async () => {
        try {
            await updateUtilisateurStatut(user.id, 'accepter');
            navigate(-1);
        } catch (error) {
            console.error("Erreur lors de l'acceptation :", error);
        }
    };

    const handleRefuser = async () => {
        try {
            await updateUtilisateurStatut(user.id, 'refuser', commentaire);
            navigate(-1);
        } catch (error) {
            console.error("Erreur lors du refus :", error);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen font-sans relative pb-10">

            {/* HEADER BACKGROUND (Placeholder pour l'image de fond) */}
            <div className="relative h-56 bg-slate-800 w-full overflow-hidden">
                {user.professionnel?.laveries?.[0]?.image && (
                    <img
                        src={user.professionnel.laveries[0].image}
                        alt={user.professionnel.laveries[0].imageAlt || user.professionnel.laveries[0].nom}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-4 bg-[#22ACE2] p-2 rounded-xl z-10 cursor-pointer"
                    aria-label="Retour"
                >
                    <img src="/src/assets/arrow_left_blue.svg" alt="Retour" className="w-6 h-6" />
                </button>
            </div>

            {/* CONTENU PRINCIPAL (La carte blanche arrondie) */}
            <div className="relative bg-white rounded-t-[3rem] px-6 pt-12 pb-8 -mt-12 shadow-lg min-h-screen">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-sm">
                    <img src="/src/assets/person_outline.svg" alt="" className="w-10 h-10" />
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
                                    {/* Image de la laverie */}
                                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0 shadow-sm">
                                        {laverie.image ? (
                                            <img src={laverie.image} alt={laverie.imageAlt || laverie.nom} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image</div>
                                        )}
                                    </div>

                                    {/* Infos de la laverie */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm underline decoration-1 underline-offset-2">{laverie.nom}</h3>
                                        <p className="text-xs font-bold text-gray-800 mt-1">{laverie.adresse || 'Adresse inconnue'}</p>
                                        <p className="text-xs italic text-gray-500 mb-2">{laverie.distance || 'à X km de votre position'}</p>
                                        <span className={`px-3 py-1 text-[10px] rounded-full font-medium ${getBadgeStyle(laverie.statut)}`}>
                                            {laverie.statut}
                                        </span>
                                    </div>

                                    {/* Bouton "..." */}
                                    <button className="bg-[#22ACE2] text-white p-2 rounded-xl hover:bg-blue-500 transition shadow-sm cursor-pointer shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="5" cy="12" r="2" />
                                        </svg>
                                    </button>
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
            </div>
        </div>
    );
}