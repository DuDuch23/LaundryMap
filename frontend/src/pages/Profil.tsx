import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getProfilUtilisateur, updateProfilUtilisateur, type ProfilUtilisateurData } from '../services/request';

export default function Profil() {
    const navigate = useNavigate();
    const [profil, setProfil] = useState<ProfilUtilisateurData | null>(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState('');
    const [messageSucces, setMessageSucces] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

    useEffect(() => {
        const chargerProfil = async () => {
            try {
                const donneesProfil = await getProfilUtilisateur();
                setProfil(donneesProfil);
                setNom(donneesProfil.nom ?? '');
                setPrenom(donneesProfil.prenom ?? '');
            } catch (error: any) {
                if (error?.status === 401 || error?.status === 403) {
                    localStorage.removeItem('token');
                    setErreur('Votre session a expiré. Veuillez vous reconnecter.');
                    navigate('/connexion', { replace: true });
                    return;
                }

                setErreur('Impossible de charger votre profil pour le moment.');
            } finally {
                setLoading(false);
            }
        };

        chargerProfil();
    }, [navigate]);

    const formaterDate = (date: string | null): string => {
        if (!date) return 'Non renseignée';

        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErreur('');
        setMessageSucces('');

        if (!nom.trim()) {
            setErreur('Le nom est requis.');
            return;
        }

        if (!prenom.trim()) {
            setErreur('Le prénom est requis.');
            return;
        }

        if (motDePasse && motDePasse.length < 8) {
            setErreur('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        if (motDePasse !== confirmationMotDePasse) {
            setErreur('La confirmation du mot de passe ne correspond pas.');
            return;
        }

        setIsSaving(true);

        try {
            const profilMisAJour = await updateProfilUtilisateur({
                nom: nom.trim(),
                prenom: prenom.trim(),
                nouveauMotDePasse: motDePasse || undefined,
            });

            setProfil(profilMisAJour);
            setMotDePasse('');
            setConfirmationMotDePasse('');
            setMessageSucces('Vos informations ont été mises à jour.');
        } catch (error: any) {
            if (error?.status === 401 || error?.status === 403) {
                localStorage.removeItem('token');
                navigate('/connexion', { replace: true });
                return;
            }

            setErreur(error?.message || 'Impossible de mettre à jour le profil.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 pt-8 max-w-xl mx-auto">
                <p className="text-center text-gray-700">Chargement du profil...</p>
            </div>
        );
    }

    if (erreur) {
        return (
            <div className="p-4 pt-8 max-w-xl mx-auto">
                <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">{erreur}</div>
            </div>
        );
    }

    if (!profil) {
        return null;
    }

    return (
        <div className="max-w-[392px] w-full mx-auto flex flex-col items-center p-4 pt-8 pt-24">
            <h1 className="text-2xl font-bold text-[#22ACE2] mb-8 text-center">Mon profil</h1>

            {messageSucces && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center font-medium">
                    {messageSucces}
                </div>
            )}

            {erreur && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center font-medium">
                    {erreur}
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                    <label htmlFor="prenom" className="block text-sm text-gray-500 mb-1">Prénom</label>
                    <input
                        id="prenom"
                        type="text"
                        value={prenom}
                        onChange={(event) => setPrenom(event.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Votre prénom"
                    />
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <label htmlFor="nom" className="block text-sm text-gray-500 mb-1">Nom</label>
                    <input
                        id="nom"
                        type="text"
                        value={nom}
                        onChange={(event) => setNom(event.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Votre nom"
                    />
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <label htmlFor="email" className="block text-sm text-gray-500 mb-1">Email (non modifiable)</label>
                    <input
                        id="email"
                        type="email"
                        value={profil.email}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                    />
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <label htmlFor="password" className="block text-sm text-gray-500 mb-1">Nouveau mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={motDePasse}
                        onChange={(event) => setMotDePasse(event.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Laisser vide pour ne pas modifier"
                    />
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <label htmlFor="confirmPassword" className="block text-sm text-gray-500 mb-1">Confirmer le mot de passe</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmationMotDePasse}
                        onChange={(event) => setConfirmationMotDePasse(event.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholder="Confirmez le nouveau mot de passe"
                    />
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="text-lg font-semibold text-gray-900">{profil.statut}</p>
                </div>

                <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm text-gray-500">Compte créé le</p>
                    <p className="text-lg font-semibold text-gray-900">{formaterDate(profil.dateCreation)}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Dernière connexion</p>
                    <p className="text-lg font-semibold text-gray-900">{formaterDate(profil.dateDerniereConnexion)}</p>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center text-white py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </form>
        </div>
    );
}
