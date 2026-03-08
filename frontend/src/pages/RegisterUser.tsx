import { useState } from 'react';
import { ChampSaisie } from '../components/champs/input.tsx';
import { CaseACocher } from '../components/champs/checkbox.tsx';
import { BoutonBleu } from '../components/boutons/bouton-bleu.tsx';

export default function PageInscription() {
    const [donnees, setDonnees] = useState({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        cguAcceptees: false
    });

    const [erreurs, setErreurs] = useState<Record<string, string>>({});
    const [messageSucces, setMessageSucces] = useState('');

    //MISE A JOUR
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setDonnees({
            ...donnees,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const soumettreInscription = async (e: React.FormEvent) => {
        e.preventDefault();
        setErreurs({});
        setMessageSucces('');
        if (!donnees.cguAcceptees) {
            setErreurs({ cguAcceptees: "Vous devez accepter les conditions d'utilisation." });
            return;
        }

        try {
            const reponse = await fetch('http://localhost:8000/api/inscription-utilisateur', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nom: donnees.nom,
                    prenom: donnees.prenom,
                    email: donnees.email,
                    motDePasse: donnees.motDePasse
                })
            });

            const resultat = await reponse.json();

            if (!reponse.ok) {
                if (resultat.erreurs) {
                    setErreurs(resultat.erreurs);
                }
                return;
            }
            setMessageSucces(resultat.message);
            setDonnees({ nom: '', prenom: '', email: '', motDePasse: '', cguAcceptees: false });

        } catch (erreurReseau) {
            console.error('Erreur réseau :', erreurReseau);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#22ACE2', textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>
                Inscription
            </h1>

            {messageSucces && (
                <div style={{ backgroundColor: '#e6f7ef', color: '#008a4b', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                    {messageSucces}
                </div>
            )}

            <form onSubmit={soumettreInscription}>
                <ChampSaisie 
                    label="Prénom" 
                    nom="prenom" 
                    valeur={donnees.prenom} 
                    onChange={handleChange} 
                    erreur={erreurs.prenom} 
                />
                
                <ChampSaisie 
                    label="Nom" 
                    nom="nom" 
                    valeur={donnees.nom} 
                    onChange={handleChange} 
                    erreur={erreurs.nom} 
                />
                
                <ChampSaisie 
                    label="Email" 
                    nom="email" 
                    type="email" 
                    valeur={donnees.email} 
                    onChange={handleChange} 
                    erreur={erreurs.email} 
                />
                
                <ChampSaisie 
                    label="Mot de passe" 
                    nom="motDePasse" 
                    type="password" 
                    valeur={donnees.motDePasse} 
                    onChange={handleChange} 
                    erreur={erreurs.motDePasse} 
                />

                <CaseACocher 
                    label="J'accepte les conditions d'utilisation" 
                    nom="cguAcceptees" 
                    coche={donnees.cguAcceptees} 
                    onChange={handleChange}
                    erreur={erreurs.cguAcceptees}
                />

                <BoutonBleu type="submit">
                    S'inscrire
                </BoutonBleu>
            </form>
        </div>
    );
}