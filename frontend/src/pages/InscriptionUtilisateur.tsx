import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibleInput, AccessibleButton } from '../components/accessibility';
import { inscriptionUtilisateur } from '../services/request';

export default function RegisterUser() {
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [cguAccepted, setCguAccepted] = useState<boolean>(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [messageSucces, setMessageSucces] = useState<string>("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{12,}$/;

    const handleChangeFirstName = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value);
    const handleChangeLastName = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value);
    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
    const handleChangeCgu = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCguAccepted(e.target.checked);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsErrors: Record<string, string> = {};
        setMessageSucces("");

        //VALIDATION FRONTEND
        if (!firstName.trim()) {
            newsErrors.firstName = t('main.inscription_utilisateur.prenom_requis');
        } else if (firstName.trim().length < 2) {
            newsErrors.firstName = t('main.inscription_utilisateur.prenom_trop_court');
        }

        if (!lastName.trim()) {
            newsErrors.lastName = t('main.inscription_utilisateur.nom_requis');
        } else if (lastName.trim().length < 2) {
            newsErrors.lastName = t('main.inscription_utilisateur.nom_trop_court');
        }

        if (!password.trim()) {
            newsErrors.password = t('main.inscription_utilisateur.mot_de_passe_requis');
        } else if (!passwordRegex.test(password)) {
            newsErrors.password = t('main.inscription_utilisateur.mot_de_passe_invalide');
        }

        if (!email.trim()) {
            newsErrors.email = t('main.inscription_utilisateur.email_requis');
        } else if (!emailRegex.test(email)) {
            newsErrors.email = t('main.inscription_utilisateur.email_invalid');
        }

        if (!cguAccepted) {
            newsErrors.cguAccepted = t('main.inscription_utilisateur.conditions_requis');
        }

        if (Object.keys(newsErrors).length > 0) {
            setErrors(newsErrors);
            return;
        }

        setErrors({});

        //APPEL API
        try {
            const resultat = await inscriptionUtilisateur({
                prenom: firstName,
                nom: lastName,
                email: email,
                motDePasse: password
            });
            setMessageSucces(t('main.inscription_utilisateur.succes'));
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setCguAccepted(false);

        } catch (error: any) {
            console.error('Erreur :', error);
            if (error.response && error.response.data && error.response.data.erreurs) {
                setErrors(error.response.data.erreurs);
            } else {
                setErrors({ global: "Une erreur est survenue lors de la connexion au serveur." });
            }
        }
    }

    return (
        <div className='p-4 pt-8 max-w-md mx-auto'>
            <h1 className="text-2xl font-bold text-[#22ACE2] mb-8 text-center w-full">
                {t('main.inscription_utilisateur.titre')}
            </h1>

            {messageSucces && (
                <div role="status" className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center font-bold">
                    {messageSucces}
                </div>
            )}

            {errors.global && (
                <div role="alert" className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center">
                    {errors.global}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <AccessibleInput
                    id="prenom"
                    className={'flex flex-col mb-4'}
                    label={t('main.inscription_utilisateur.prenom')}
                    type='text'
                    value={firstName}
                    onChange={handleChangeFirstName}
                    placeholder={t('main.inscription_utilisateur.placeholder_prenom')}
                    error={errors.firstName}
                />

                <AccessibleInput
                    id="nom"
                    className={'flex flex-col mb-4'}
                    label={t('main.inscription_utilisateur.nom')}
                    type='text'
                    value={lastName}
                    onChange={handleChangeLastName}
                    placeholder={t('main.inscription_utilisateur.placeholder_nom')}
                    error={errors.lastName}
                />

                <AccessibleInput
                    id="email"
                    className={'flex flex-col mb-4'}
                    label={t('main.inscription_utilisateur.email')}
                    type='email'
                    value={email}
                    onChange={handleChangeEmail}
                    placeholder={t('main.inscription_utilisateur.placeholder_email')}
                    error={errors.email}
                />

                <AccessibleInput
                    id="password"
                    className={'flex flex-col mb-2'}
                    label={t('main.inscription_utilisateur.mot_de_passe')}
                    type='password'
                    value={password}
                    onChange={handleChangePassword}
                    placeholder={t('main.inscription_utilisateur.placeholder_mot_de_passe')}
                    error={errors.password}
                />

                <ul className="text-xs text-gray-600 mb-6 pl-2 space-y-1">
                    <li style={{ color: password.length >= 12 ? 'green' : 'red' }}>✓ {t('main.inscription_utilisateur.mot_de_passe_caractere_minimum')}</li>
                    <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>✓ {t('main.inscription_utilisateur.une_majuscule')}</li>
                    <li style={{ color: /[a-z]/.test(password) ? 'green' : 'red' }}>✓ {t('main.inscription_utilisateur.une_minuscule')}</li>
                    <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>✓ {t('main.inscription_utilisateur.un_chiffre')}</li>
                    <li style={{ color: /[@$!%*?&^#]/.test(password) ? 'green' : 'red' }}>✓ {t('main.inscription_utilisateur.un_caractere_special')}</li>
                </ul>


                    <AccessibleInput
                        id="cgu"
                        label={t('main.inscription_utilisateur.accepte_condition')}
                        type="checkbox"
                        className=""
                        value={cguAccepted.toString()}
                        onChange={handleChangeCgu}
                        error={errors.cguAccepted}
                        placeholder=""
                    />
                    <AccessibleInput
                        id="submit"
                        label={false}
                        type="submit"
                        className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
                        value={t('main.inscription_utilisateur.sinscrire')} 
                        onChange={false}
                        error={false}
                        placeholder={t('main.inscription_utilisateur.sinscrire')}
                    />
            </form>
        </div>
    );
}