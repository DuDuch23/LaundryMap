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

    // Adresse
    const handleChangeAdresse = (e: any) => setAdresse(e.target.value);
    const handleChangeRue = (e: any) => setRue(e.target.value);
    const handleChangeCodePostal = (e: any) => setCodePostal(e.target.value);
    const handleChangeVille = (e: any) => setVille(e.target.value);
    const handleChangePays = (e: any) => setPays(e.target.value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsErrors: Record<string, string> = {};

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

        // Adresse

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
            <h1 className='text-2xl font-bold text-[#22ACE2] mb-8 text-center w-full'>
                {t('main.inscription_professionnel.titre')}
            </h1>
            <form action="#" className='flex flex-col gap-5' onSubmit={handleSubmit}>

                <AccessibleInput 
                    id="nom"
                    className={'flex flex-col'}
                    label={t('main.inscription_professionnel.nom')}
                    type='text'
                    value={nom}
                    onChange={handleChangenom}
                    placeholder={t('main.inscription_professionnel.placeholder_nom')}
                    error={null}
                />
                <AccessibleInput 
                    id="prenom"
                    className={'flex flex-col'}
                    label={t('main.inscription_professionnel.prenom')}
                    type='text'
                    value={prenom}
                    onChange={handleChangeprenom}
                    placeholder={t('main.inscription_professionnel.placeholder_prenom')}
                    error={null}
                />
                <AccessibleInput 
                    id="email"
                    className={'flex flex-col'}
                    label={t('main.inscription_professionnel.email')}
                    type='email'
                    value={email}
                    onChange={handleChangeEmail}
                    placeholder={t('main.inscription_professionnel.placeholder_email')}
                    // required
                    error={errors.email}
                />
                <AccessibleInput 
                    id="password"
                    className={'flex flex-col'}
                    label={t('main.inscription_professionnel.mot_de_passe')}
                    type='password'
                    value={password}
                    onChange={handleChangePassword}
                    placeholder={t('main.inscription_professionnel.placeholder_mot_de_passe')}
                    // required
                    error={errors.password}
                />
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
                <AccessibleInput
                    id="siren_ou_siret"
                    className={'flex flex-col'}
                    label={t('main.inscription_professionnel.num_siren_ou_siret')}
                    type="text"
                    value={sirenOrSiret}
                    onChange={handleChangeSirenOrSiret}
                    placeholder={t('main.inscription_professionnel.placeholder_num_siren_ou_siret')}
                    // required
                    error={errors.sirenOrSiret}
                />
                <AccessibleInput
                    id="adresse"
                    className='flex flex-col'
                    label={t('main.inscription_professionnel.adresse')}
                    type="text"
                    value={adresse}
                    onChange={handleChangeAdresse}
                    placeholder={t('main.inscription_professionnel.placeholder_adresse')}
                    // required
                    error={errors.adresse}
                />
                <AccessibleInput
                    id="rue"
                    className='flex flex-col'
                    label={t('main.inscription_professionnel.rue')}
                    type="text"
                    value={rue}
                    onChange={handleChangeRue}
                    placeholder={t('main.inscription_professionnel.placeholder_rue')}
                    // required
                    error={errors.rue}
                />
                <AccessibleInput
                    id="code_postal"
                    className='flex flex-col'
                    label={t('main.inscription_professionnel.code_postal')}
                    type="text"
                    value={codePostal}
                    onChange={handleChangeCodePostal}
                    placeholder={t('main.inscription_professionnel.placeholder_code_postal')}
                    // required
                    error={errors.codePostal}
                />
                <AccessibleInput
                    id="ville"
                    className='flex flex-col'
                    label={t('main.inscription_professionnel.ville')}
                    type="text"
                    value={ville}
                    onChange={handleChangeVille}
                    placeholder={t('main.inscription_professionnel.placeholder_ville')}
                    // required
                    error={errors.ville}
                />
                <AccessibleInput
                    id="pays"
                    className='flex flex-col'
                    label={t('main.inscription_professionnel.pays')}
                    type="text"
                    value={pays}
                    onChange={handleChangePays}
                    placeholder={t('main.inscription_professionnel.placeholder_pays')}
                    // required
                    error={errors.pays}
                />
                <AccessibleInput 
                    id="rgpd"
                    label={t('main.inscription_professionnel.accepte_condition')}
                    type='checkbox'
                    className={'flex flex-row-reverse justify-end'}
                    value={rgpdAccepted}
                    onChange={handleChangeRgpd}
                    placeholder={t('main.inscription_professionnel.placeholder_num_siren_ou_siret')}
                    // required
                    error={errors.rgpdAccepted}
                />
                <AccessibleInput
                    id="submit"
                    label={false}
                    type="submit"
                    className="bg-[#22ACE2] w-full font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center"
                    value={t('main.inscription_professionnel.sinscrire')}
                    onChange={false}
                    error={false}
                    placeholder={t('main.inscription_professionnel.placeholder_sinscrire')}
                />
            </form>
        </div>
    );
}
