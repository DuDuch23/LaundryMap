import { useTranslation} from 'react-i18next';
import {AccessibleInput} from '../components/accessibility';
import { useState } from 'react';
import { inscriptionProfessionnel } from '../services/request';
import { useNavigate } from 'react-router';

export default function InscriptionProfessionnel() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [prenom, setprenom] = useState<string>("");
    const [nom, setnom] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [sirenOrSiret, setSirenOrSiret] = useState<string>("");
    const [rgpdAccepted, setRgpdAccepted] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Adresse
    const [adresse, setAdresse] = useState<string>("");
    const [rue, setRue] = useState<string>("");
    const [codePostal, setCodePostal] = useState<string>("");
    const [ville, setVille] = useState<string>("");
    const [pays, setPays] = useState<string>("France");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sirenRegex = /^\d{9}$/;
    const siretRegex = /^\d{14}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{12,}$/;

    const handleChangeprenom = (e: any) => setprenom(e.target.value);
    const handleChangenom = (e: any) => setnom(e.target.value);
    const handleChangeEmail = (e: any) => setEmail(e.target.value);
    const handleChangePassword = (e: any) => setPassword(e.target.value);
    const handleChangeSirenOrSiret = (e: any) => setSirenOrSiret(e.target.value);
    const handleChangeRgpd = (e: any) => setRgpdAccepted(e.target.value);

    // Adresse
    const handleChangeAdresse = (e: any) => setAdresse(e.target.value);
    const handleChangeRue = (e: any) => setRue(e.target.value);
    const handleChangeCodePostal = (e: any) => setCodePostal(e.target.value);
    const handleChangeVille = (e: any) => setVille(e.target.value);
    const handleChangePays = (e: any) => setPays(e.target.value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsErrors: Record<string, string> = {};

        if (!prenom.trim()) {
            newsErrors.prenom = t('main.inscription_professionnel.prenom_requis');
        } else if (prenom.trim().length < 2) {
            newsErrors.prenom = t('main.inscription_professionnel.prenom_trop_court');
        } else if (prenom.trim().length > 50) {
            newsErrors.prenom = t('main.inscription_professionnel.prenom_trop_long');
        }

        if (!nom.trim()) {
            newsErrors.nom = t('main.inscription_professionnel.nom_requis');
        } else if (nom.trim().length < 2) {
            newsErrors.nom = t('main.inscription_professionnel.nom_trop_court');
        } else if (nom.trim().length > 50) {
            newsErrors.nom = t('main.inscription_professionnel.nom_trop_long');
        }

        if(!password.trim()){
            newsErrors.password = t('main.inscription_professionnel.mot_de_passe_requis');
        }else if(!passwordRegex.test(password)){
            newsErrors.password = t('main.inscription_professionnel.mot_de_passe_invalide');
        }else if(password.trim().length < 12){
            newsErrors.password = t('main.inscription_professionnel.mot_de_passe_trop_court');
        }else if(password.trim().length > 255){
            newsErrors.password = t('main.inscription_professionnel.mot_de_passe_trop_long');
        }

        if(!email.trim()){
            newsErrors.email = t('main.inscription_professionnel.email_requis');
        }else if(!emailRegex.test(email)){
            newsErrors.emailInvalid = t('main.inscription_professionnel.email_invalid');
        }

        if(!sirenOrSiret) {
            newsErrors.sirenOrSiret = t('main.inscription_professionnel.num_siren_ou_siret_requis');
        } else if (!sirenRegex.test(sirenOrSiret) && !siretRegex.test(sirenOrSiret)) {
            newsErrors.sirenOrSiret = t('main.inscription_professionnel.num_siren_ou_siret_incorrect');
        }

        if(!rgpdAccepted){
            newsErrors.rgpdAccepted = t('main.inscription_professionnel.conditions_requis');
        }

        if (!adresse.trim()) {
            newsErrors.adresse = t('main.inscription_professionnel.adresse_requise');
        }
        if (!rue.trim()) {
            newsErrors.rue = t('main.inscription_professionnel.rue_requise');
        }
        if (!codePostal.trim() || !/^\d{5}$/.test(codePostal)) {
            newsErrors.codePostal = t('main.inscription_professionnel.code_postal_invalide');
        }
        if (!ville.trim()) {
            newsErrors.ville = t('main.inscription_professionnel.ville_requise');
        }
        if (!pays.trim()) {
            newsErrors.pays = t('main.inscription_professionnel.pays_requis');
        }

        if(Object.keys(newsErrors).length > 0) {
            setErrors(newsErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try{
            await inscriptionProfessionnel({
                email,
                prenom,
                nom,
                password,
                sirenOrSiret,
                adresse,
                rue,
                codePostal,
                ville,
                pays
            });
            navigate('/');
            setErrors({});
        }catch(error: any){
            if (error.response?.data?.erreurs) {
                const backendErrors = error.response.data.erreurs;

                // Mapping codes erreur backend -> clés i18n
                const messageMap: Record<string, string> = {
                    ERROR_LASTNAME_TOO_LONG: t('main.inscription_professionnel.nom_trop_long'),
                    ERROR_FIRSTNAME_TOO_LONG: t('main.inscription_professionnel.prenom_trop_long'),
                    ERROR_EMAIL_IS_USING: t('main.inscription_professionnel.email_deja_utilise'),
                };

                const mappedErrors: Record<string, string> = {};
                for (const [key, message] of Object.entries(backendErrors)) {
                    mappedErrors[key] = messageMap[message as string] || (message as string);
                }

                setErrors(mappedErrors);
            } else {
                setErrors({ global: t('main.connexion.erreur_generique') });
            }
        } finally{
            setIsLoading(false);
        }

    }
    return (
        <div className='w-full pt-24 px-4 pb-16'>
            <h1 className='text-2xl font-bold text-[#22ACE2] mb-2 text-center w-full'>
                {t('main.inscription_professionnel.titre')}
            </h1>

            <form action="#" className='w-full flex flex-col gap-5' onSubmit={handleSubmit}>

                <div className='w-full grid grid-cols-1 min-[744px]:grid-cols-2 gap-5'>
                    <AccessibleInput
                        id="nom"
                        name="nom"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.nom')}
                        type='text'
                        value={nom}
                        onChange={handleChangenom}
                        placeholder={t('main.inscription_professionnel.placeholder_nom')}
                        error={errors.nom}
                        maxLength={50}
                    />
                    <AccessibleInput
                        id="prenom"
                        name="prenom"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.prenom')}
                        type='text'
                        value={prenom}
                        onChange={handleChangeprenom}
                        placeholder={t('main.inscription_professionnel.placeholder_prenom')}
                        error={errors.prenom}
                        maxLength={50}
                    />
                </div>

                <div className='w-full grid grid-cols-1  gap-5'>
                    <AccessibleInput
                        id="email"
                        name="email"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.email')}
                        type='email'
                        value={email}
                        onChange={handleChangeEmail}
                        placeholder={t('main.inscription_professionnel.placeholder_email')}
                        error={errors.email}
                    />
                    <AccessibleInput
                        id="password"
                        name="password"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.mot_de_passe')}
                        type='password'
                        value={password}
                        onChange={handleChangePassword}
                        placeholder={t('main.inscription_professionnel.placeholder_mot_de_passe')}
                        error={errors.password}
                        children={
                        <ul style={{ fontSize: '0.8rem', color: '#666' }}>
                            <li style={{ color: password.length >= 12 ? 'green' : 'red' }}>
                                ✓ {t('main.inscription_professionnel.mot_de_passe_caractere_minimum')}
                            </li>
                            <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>
                                ✓ {t('main.inscription_professionnel.une_majuscule')}
                            </li>
                            <li style={{ color: /[a-z]/.test(password) ? 'green' : 'red' }}>
                                ✓ {t('main.inscription_professionnel.une_minuscule')}
                            </li>
                            <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>
                                ✓ {t('main.inscription_professionnel.un_chiffre')}
                            </li>
                            <li style={{ color: /[@$!%*?&^#]/.test(password) ? 'green' : 'red' }}>
                                ✓ {t('main.inscription_professionnel.un_caractere_special')}
                            </li>
                        </ul>
                        }
                    >
                    </AccessibleInput>
                </div>

                <div className='w-full min-[744px]:grid-cols-2 gap-5'>
                    <AccessibleInput
                        id="siren_ou_siret"
                        name="siren_ou_siret"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.num_siren_ou_siret')}
                        type="text"
                        value={sirenOrSiret}
                        onChange={handleChangeSirenOrSiret}
                        placeholder={t('main.inscription_professionnel.placeholder_num_siren_ou_siret')}
                        error={errors.sirenOrSiret}
                    />
                </div>

                <div className='w-full grid grid-cols-1 min-[744px]:grid-cols-2 min-[1280px]:grid-cols-2 gap-5'>
                    <AccessibleInput
                        id="adresse"
                        name="adresse"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.adresse')}
                        type="text"
                        value={adresse}
                        onChange={handleChangeAdresse}
                        placeholder={t('main.inscription_professionnel.placeholder_adresse')}
                        error={errors.adresse}
                    />
                    <AccessibleInput
                        id="rue"
                        name="rue"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.rue')}
                        type="text"
                        value={rue}
                        onChange={handleChangeRue}
                        placeholder={t('main.inscription_professionnel.placeholder_rue')}
                        error={errors.rue}
                    />
                </div>
                <div className='w-full grid grid-cols-1 min-[744px]:grid-cols-2 min-[1280px]:grid-cols-3 gap-5'>
                    <AccessibleInput
                        id="code_postal"
                        name="code_postal"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.code_postal')}
                        type="text"
                        value={codePostal}
                        onChange={handleChangeCodePostal}
                        placeholder={t('main.inscription_professionnel.placeholder_code_postal')}
                        error={errors.codePostal}
                    />
                    <AccessibleInput
                        id="ville"
                        name="ville"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.ville')}
                        type="text"
                        value={ville}
                        onChange={handleChangeVille}
                        placeholder={t('main.inscription_professionnel.placeholder_ville')}
                        error={errors.ville}
                    />
                    <AccessibleInput
                        id="pays"
                        name="pays"
                        className='flex flex-col'
                        label={t('main.inscription_professionnel.pays')}
                        type="text"
                        value={pays}
                        onChange={handleChangePays}
                        placeholder={t('main.inscription_professionnel.placeholder_pays')}
                        error={errors.pays}
                    />
                </div>

                <AccessibleInput
                    id="rgpd"
                    name="rgpd"
                    label={t('main.inscription_professionnel.accepte_condition')}
                    type='checkbox'
                    className='flex flex-row-reverse justify-end'
                    value={rgpdAccepted}
                    onChange={handleChangeRgpd}
                    placeholder={t('main.inscription_professionnel.placeholder_num_siren_ou_siret')}
                    error={errors.rgpdAccepted}
                />

                {errors.global && (
                    <p role="alert" className='text-red-500 text-sm text-center'>{errors.global}</p>
                )}

                <AccessibleInput
                    id="submit"
                    name="submit"
                    label={false}
                    type="submit"
                    className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
                    value={isLoading ? '...' : t('main.inscription_professionnel.sinscrire')}
                    onChange={false}
                    error={false}
                    placeholder={t('main.inscription_professionnel.placeholder_sinscrire')}
                />
            </form>
        </div>
    );
}