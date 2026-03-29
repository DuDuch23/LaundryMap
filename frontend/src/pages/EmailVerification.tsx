import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessibleButton, AccessibleInput } from '../components/accessibility';
import axios from 'axios';
import API_BASE_URL from '../services/api';

// Icône pour le succès
const SuccessIcon = () => (
    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

// Icône pour l'erreur
const ErrorIcon = () => (
    <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

// Icône pour l'information
const InfoIcon = () => (
    <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

export default function EmailVerification() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'info'>('loading');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [showResendButton, setShowResendButton] = useState(false);
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState({ type: '', text: '' });
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const info = searchParams.get('info');
        const emailParam = searchParams.get('email');

        if (emailParam) {
            setEmail(emailParam);
        }

        if (success) {
            setStatus('success');
            setTitle(t('main.email_verification.titre_succes'));
            setMessage(t('main.email_verification.message_succes'));
        } else if (error) {
            setStatus('error');
            setTitle(t('main.email_verification.titre_erreur'));
            setShowResendButton(['invalid_token', 'expired_token'].includes(error));
            setMessage(t(`main.email_verification.erreur_${error}`, t('main.email_verification.erreur_inconnue')));
        } else if (info) {
            setStatus('info');
            setTitle(t('main.email_verification.titre_info'));
            setMessage(t('main.email_verification.info_deja_verifie'));
        } else {
            setStatus('error');
            setTitle(t('main.email_verification.titre_page_introuvable'));
            setMessage(t('main.email_verification.message_page_introuvable'));
        }
    }, [searchParams, t]);

    const handleResendVerification = async () => {
        setEmailError('');
        setResendMessage({ type: '', text: '' });

        if (!email.trim()) {
            setEmailError(t('main.email_verification.email_requis', 'Veuillez renseigner votre adresse e-mail.'));
            return;
        }

        setIsResending(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/resend-verification`, { email }, {
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
            setResendMessage({ type: 'success', text: response.data.message });
        } catch (error: any) {
            if (error.response?.data?.errors?.email) {
                setEmailError(error.response.data.errors.email);
            } else {
                setResendMessage({ type: 'error', text: error.response?.data?.message || t('main.email_verification.erreur_renvoi', 'Une erreur est survenue lors du renvoi.') });
            }
        } finally {
            setIsResending(false);
        }
    };

    const renderIcon = () => {
        if (status === 'success') return <SuccessIcon />;
        if (status === 'error') return <ErrorIcon />;
        if (status === 'info') return <InfoIcon />;
        return null;
    };

    const renderActions = () => {
        if (status === 'success' || status === 'info') {
            return (
                <Link to="/connexion" className="inline-block bg-[#22ACE2] text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors shadow-sm cursor-pointer text-center">
                    {t('main.email_verification.bouton_connexion')}
                </Link>
            );
        }
        if (status === 'error' && showResendButton) {
            return (
                <div className="flex flex-col gap-4 mt-4 text-left">
                    {resendMessage.text && (
                        <div className={`p-3 rounded-lg text-sm font-medium text-center ${resendMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {resendMessage.text}
                        </div>
                    )}
                    <AccessibleInput
                        id="email-resend"
                        name="email"
                        label={t('main.email_verification.email_label', 'Adresse e-mail')}
                        type="email"
                        value={email}
                        onChange={(e: any) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                        }}
                        placeholder={t('main.email_verification.email_placeholder', 'Ex: jean.dupont@email.com')}
                        className="flex flex-col"
                        error={emailError}
                    />
                    <AccessibleButton onClick={handleResendVerification} disabled={isResending} className="w-full bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors shadow-sm cursor-pointer text-center disabled:opacity-50" ariaLabel={t('main.email_verification.bouton_renvoyer')}>
                        {isResending ? t('main.email_verification.envoi_en_cours', 'Envoi en cours...') : t('main.email_verification.bouton_renvoyer')}
                    </AccessibleButton>
                </div>
            );
        }
        return null;
    };

    if (status === 'loading') {
        return <div className="w-full min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4 pb-16">
            <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg">
                <div className="mb-6">
                    {renderIcon()}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    {title}
                </h1>
                <p className="text-gray-600 mb-8">
                    {message}
                </p>
                <div className="mt-6">
                    {renderActions()}
                </div>
            </div>
        </div>
    );
}