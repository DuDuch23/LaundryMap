import React from 'react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
    

export default function ChangeLanguage() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const changeLanguage = (lng:string) => {
        i18n.changeLanguage(lng);
    }

    return (
        <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
        </select>
    );
}
