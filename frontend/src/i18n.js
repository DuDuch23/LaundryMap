import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from '../public/locales/FR/translation.json';
import en from '../public/locales/EN/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            fr: { translation: fr },
            en: { translation: en },
        },
        fallbackLng: 'fr',
        supportedLngs: ['fr', 'en'],
        detection: {
            order: ['localStorage', 'navigator'],
            cacheUserLanguage: true,
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;