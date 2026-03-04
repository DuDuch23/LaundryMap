import { useTranslation} from 'react-i18next';
import {AccessibleInput} from '../components/accessibility';
import { useState, useEffect } from 'react';


export default function InscriptionProfessionnel() {
    const { t, i18n } = useTranslation();
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [sirenOrSiret, setSirenOrSiret] = useState<string>("");
    const [rgpdAccepted, setRgpdAccepted] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sirenRegex = /^\d{9}$/;
    const siretRegex = /^\d{14}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{12,}$/;


    const handleChangeFirstName = (e: any) => setFirstName(e.target.value);
    const handleChangeLastName = (e: any) => setLastName(e.target.value);
    const handleChangeEmail = (e: any) => setEmail(e.target.value);
    const handleChangePassword = (e: any) => setPassword(e.target.value);
    const handleChangeSirenOrSiret = (e: any) => setSirenOrSiret(e.target.value);
    const handleChangeRgpd = (e: any) => setRgpdAccepted(e.target.value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newsErrors: Record<string, string> = {};
        if(!firstName.trim()){
            newsErrors.firstName = t('main.inscription_pro.prenom_requis');
        }else if(firstName.trim().length < 2){
            newsErrors.firstName = t('main.inscription_pro.prenom_trop_court');
        }

        if(!lastName.trim()){
            newsErrors.lastName = t('main.inscription_pro.nom_requis');
        }else if(lastName.trim().length < 2){
            newsErrors.lastName = t('main.inscription_pro.nom_trop_court');
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

        setErrors({});

        if(Object.keys(errors).length === 0){
            console.log("pas d'erreur");
            try{
                console.log(handleChangeEmail, handleChangePassword, handleChangeSirenOrSiret, handleChangeRgpd, setRgpdAccepted);
                setErrors({});
                console.log(firstName, lastName, password, sirenOrSiret, rgpdAccepted, email);
            }catch(error){
                console.error(error);
            }
        }else{
            console.log("il y a des erreurs", errors);
        }

    }
    return (
        <div className='p-4'>
            <h1>{t('main.inscription_pro.titre')}</h1>
            <form action="#" onSubmit={handleSubmit}>

                <AccessibleInput 
                    id="nom"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.nom')}
                    type='text'
                    value={lastName}
                    onChange={handleChangeLastName}
                    placeholder={t('main.inscription_pro.placeholder_nom')}
                    // required
                    error={errors.lastName}
                />
                <AccessibleInput 
                    id="prenom"
                    className={'flex flex-col'}
                    label={t('main.inscription_pro.prenom')}
                    type='text'
                    value={firstName}
                    onChange={handleChangeFirstName}
                    placeholder={t('main.inscription_pro.placeholder_prenom')}
                    // required
                    error={errors.firstName}
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
                        ✓ 12 caractères minimum
                    </li>
                    <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>
                        ✓ Une majuscule
                    </li>
                    <li style={{ color: /[a-z]/.test(password) ? 'green' : 'red' }}>
                        ✓ Une minuscule
                    </li>
                    <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>
                        ✓ Un chiffre
                    </li>
                    <li style={{ color: /[@$!%*?&^#]/.test(password) ? 'green' : 'red' }}>
                        ✓ Un caractère spécial (@$!%*?&^#)
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
                    id="rgpd"
                    label={t('main.inscription_pro.accepte_condition')}
                    type='checkbox'
                    className={'flex flex-row-reverse'}
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
