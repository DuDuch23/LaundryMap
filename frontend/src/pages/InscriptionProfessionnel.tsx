import { useTranslation} from 'react-i18next';
import {AccessibleInput} from '../components/accessibility';
import { useState, useEffect } from 'react';
import { inscriptionProfessionnel } from '../services/request';
import { useNavigate } from 'react-router';

export default function InscriptionProfessionnel() {
    const { t, i18n } = useTranslation();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsErrors: Record<string, string> = {};
        if(!prenom.trim()){
            newsErrors.prenom = t('main.inscription_pro.prenom_requis');
        }else if(prenom.trim().length < 2){
            newsErrors.prenom = t('main.inscription_pro.prenom_trop_court');
        }

        if(!nom.trim()){
            newsErrors.nom = t('main.inscription_pro.nom_requis');
        }else if(nom.trim().length < 2){
            newsErrors.nom = t('main.inscription_pro.nom_trop_court');
        }

        if(!password.trim()){
            newsErrors.password = t('main.inscription_pro.mot_de_passe_requis');
        }else if(!passwordRegex.test(password)){
            newsErrors.password = t('main.inscription_pro.mot_de_passe_invalide');
        }else if(password.trim().length < 12){
            newsErrors.password = t('main.inscription_pro.mot_de_passe_trop_court');
        }else if(password.trim().length > 255){
            newsErrors.password = t('main.inscription_pro.mot_de_passe_trop_long');
        }

        if(!email.trim()){
            newsErrors.email = t('main.inscription_pro.email_requis');
        }else if(!emailRegex.test(email)){
            newsErrors.emailInvalid = t('main.inscription_pro.email_invalid');
        }

        if(!sirenOrSiret) {
            newsErrors.sirenOrSiret = t('main.inscription_pro.num_siren_ou_siret_requis');
        } else if (!sirenRegex.test(sirenOrSiret) && !siretRegex.test(sirenOrSiret)) {
            newsErrors.sirenOrSiret = t('main.inscription_pro.num_siren_ou_siret_incorrect');
        }

        if(!rgpdAccepted){
            newsErrors.rgpdAccepted = t('main.inscription_pro.conditions_requis');
        }

        if(Object.keys(newsErrors).length > 0) {
            setErrors(newsErrors);
            return;
        }

        // Adresse

        if (!adresse.trim()) {
            newsErrors.adresse = t('main.inscription_pro.adresse_requise');
        }
        if (!rue.trim()) {
            newsErrors.rue = t('main.inscription_pro.rue_requise');
        }
        if (!codePostal.trim() || !/^\d{5}$/.test(codePostal)) {
            newsErrors.codePostal = t('main.inscription_pro.code_postal_invalide');
        }
        if (!ville.trim()) {
            newsErrors.ville = t('main.inscription_pro.ville_requise');
        }
        if (!pays.trim()) {
            newsErrors.pays = t('main.inscription_pro.pays_requis');
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
            console.log(handleChangeEmail, handleChangePassword, handleChangeSirenOrSiret, handleChangeRgpd, setRgpdAccepted);
            setErrors({});
            console.log(prenom, nom, password, sirenOrSiret, rgpdAccepted, email);
        }catch(error){
            if (error.response?.data?.erreurs) {
                setErrors(error.response.data.erreurs);
            } else {
                setErrors({ global: 'Une erreur est survenue, veuillez réessayer' });
            }
        } finally{
            setIsLoading(false);
        }

    }
    return (
        <div className='p-4 pt-8'>
            <h1 className='text-xl text-center'>{t('main.inscription_pro.titre')}</h1>
            <form action="#" className='flex flex-col gap-5' onSubmit={handleSubmit}>

                <AccessibleInput 
                    id="nom"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.nom')}
                    type='text'
                    value={nom}
                    onChange={handleChangenom}
                    placeholder={t('main.inscription_pro.placeholder_nom')}
                    // required
                    error={errors.nom}
                />
                <AccessibleInput 
                    id="prenom"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.prenom')}
                    type='text'
                    value={prenom}
                    onChange={handleChangeprenom}
                    placeholder={t('main.inscription_pro.placeholder_prenom')}
                    // required
                    error={errors.prenom}
                />
                <AccessibleInput 
                    id="email"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.email')}
                    type='email'
                    value={email}
                    onChange={handleChangeEmail}
                    placeholder={t('main.inscription_pro.placeholder_email')}
                    // required
                    error={errors.email}
                />
                <AccessibleInput 
                    id="password"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.mot_de_passe')}
                    type='password'
                    value={password}
                    onChange={handleChangePassword}
                    placeholder={t('main.inscription_pro.placeholder_mot_de_passe')}
                    // required
                    error={errors.password}
                />
                <ul style={{ fontSize: '0.8rem', color: '#666' }}>
                    <li style={{ color: password.length >= 12 ? 'green' : 'red' }}>
                        ✓ {t('main.inscription_pro.mot_de_passe_caractere_minimum')}
                    </li>
                    <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>
                        ✓ {t('main.inscription_pro.une_majuscule')}
                    </li>
                    <li style={{ color: /[a-z]/.test(password) ? 'green' : 'red' }}>
                        ✓ {t('main.inscription_pro.une_minuscule')}
                    </li>
                    <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>
                        ✓ {t('main.inscription_pro.un_chiffre')}
                    </li>
                    <li style={{ color: /[@$!%*?&^#]/.test(password) ? 'green' : 'red' }}>
                        ✓ {t('main.inscription_pro.un_caractere_special')}
                    </li>
                </ul>
                <AccessibleInput
                    id="siren_ou_siret"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.num_siren_ou_siret')}
                    type="text"
                    value={sirenOrSiret}
                    onChange={(e:any) => setSirenOrSiret(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_num_siren_ou_siret')}
                    // required
                    error={errors.sirenOrSiret}
                />
                <AccessibleInput
                    id="adresse"
                    className='flex flex-col'
                    label={t('main.inscription_pro.adresse')}
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_adresse')}
                    required
                    error={errors.adresse}
                />
                <AccessibleInput
                    id="rue"
                    className='flex flex-col'
                    label={t('main.inscription_pro.rue')}
                    type="text"
                    value={rue}
                    onChange={(e) => setRue(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_rue')}
                    required
                    error={errors.rue}
                />
                <AccessibleInput
                    id="code_postal"
                    className='flex flex-col'
                    label={t('main.inscription_pro.code_postal')}
                    type="text"
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_code_postal')}
                    required
                    error={errors.codePostal}
                />
                <AccessibleInput
                    id="ville"
                    className='flex flex-col'
                    label={t('main.inscription_pro.ville')}
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_ville')}
                    required
                    error={errors.ville}
                />
                <AccessibleInput
                    id="pays"
                    className='flex flex-col'
                    label={t('main.inscription_pro.pays')}
                    type="text"
                    value={pays}
                    onChange={(e) => setPays(e.target.value)}
                    placeholder={t('main.inscription_pro.placeholder_pays')}
                    required
                    error={errors.pays}
                />
                <AccessibleInput 
                    id="rgpd"
                    label={t('main.inscription_pro.accepte_condition')}
                    type='checkbox'
                    className={'flex flex-row-reverse justify-end'}
                    value={rgpdAccepted}
                    onChange={handleChangeRgpd}
                    placeholder={t('main.inscription_pro.placeholder_num_siren_ou_siret')}
                    // required
                    error={errors.rgpdAccepted}
                />
                <button type="submit">
                    {t('main.inscription_pro.sinscrire')}
                </button>
            </form>
        </div>
    );
}
