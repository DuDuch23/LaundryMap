import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function Home(){
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [flashMessageKey, setFlashMessageKey] = useState<string>(() => {
        const stateKey = (location.state as { flashMessageKey?: string } | null)?.flashMessageKey;
        return stateKey || sessionStorage.getItem('flashMessageKey') || '';
    });

    useEffect(() => {
        const stateKey = (location.state as { flashMessageKey?: string } | null)?.flashMessageKey;

        if (stateKey) {
            setFlashMessageKey(stateKey);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!flashMessageKey) {
            return;
        }

        sessionStorage.removeItem('flashMessageKey');
    }, [flashMessageKey]);

    return (
        <div className='h-screen flex flex-col items-center justify-center pt-20'>
            {flashMessageKey && (
                <div className="mt-[100px] mx-4 p-3 rounded-xl bg-green-100 text-green-800 text-sm font-medium" role="status" aria-live="polite">
                    {t(flashMessageKey)}
                </div>
            )}
            <h1>Home Page</h1>
            <p>Cette page est en cours de développement. Restez à l'écoute pour les mises à jour !</p>
        </div>
    );
}