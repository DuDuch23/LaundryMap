import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AccessibleInput, AccessibleButton } from '../components/accessibility';

export default function PageConnexion() {
    const { t } = useTranslation();
    
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [erreurGenerale, setErreurGenerale] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setErreurGenerale("");

        const newsErrors: Record<string, string> = {};

        if (!email.trim()) newsErrors.email = "L'email est requis";
        if (!password.trim()) newsErrors.password = "Le mot de passe est requis";

        if (Object.keys(newsErrors).length > 0) {
            setErrors(newsErrors);
            return;
        }

        //APPEL API POUR LA CONNEXION
        try {
            const reponse = await fetch('http://localhost:8000/api/connexion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email, 
                    mot_de_passe: password
                })
            });

            const resultat = await reponse.json();

            if (!reponse.ok) {
                setErreurGenerale("Email ou mot de passe incorrect.");
                return;
            }
        } catch(error) {
            setErreurGenerale("Impossible de joindre le serveur.");
        }
    };

    return (
        <div className='p-4 max-w-md mx-auto mt-10'>
            <h1 className="text-2xl font-bold text-[#22ACE2] mb-8 text-center">
                Connexion
            </h1>

            {erreurGenerale && (
                <div role="alert" className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center font-medium">
                    {erreurGenerale}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <AccessibleInput 
                    id="email"
                    className={'flex flex-col mb-4'}
                    label={"Email"}
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={"Ex: jean.dupont@email.com"}
                    error={errors.email}
                />
                <div className="relative mb-8">
                    <div className="absolute right-0 z-10">
                        <Link 
                            to="/mot-de-passe-oublie" 
                            className="text-sm text-[#22ACE2] hover:text-blue-600 hover:underline font-medium transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <AccessibleInput 
                        id="password"
                        className={'flex flex-col'}
                        label={"Mot de passe"}
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={"••••••••••••"}
                        error={errors.password}
                    />
                </div>

                <AccessibleButton 
                    type="submit" 
                    ariaLabel="Se connecter"
                >
                    <div className="bg-[#22ACE2] text-white font-bold py-3 px-4 rounded-lg w-full hover:bg-blue-500 transition-colors shadow-sm cursor-pointer">
                        Se connecter
                    </div>
                </AccessibleButton>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link to="/inscription-utilisateur" className="text-[#22ACE2] font-bold hover:underline">
                        S'inscrire
                    </Link>
                </div>
            </form>
        </div>
    );
}