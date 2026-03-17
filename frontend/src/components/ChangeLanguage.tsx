import React, { useEffect } from 'react';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { Langue } from '../types/Langue';
import { getLangues } from '../services/request';

export default function ChangeLanguage() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;
    const [langues, setLangues] = React.useState<Langue[]>([]);

    useEffect(() => {
        getLangues()
            .then((data: Langue[]) => setLangues(Array.isArray(data) ? data : []))
            .catch(() => {
                setLangues([
                    { id: 1, nom: 'Français', code: 'fr' },
                    { id: 2, nom: 'English', code: 'en' }
                ]);
            })
    }, []);

    const changeLanguage = (lng:string) => {
        i18n.changeLanguage(lng);
    }

    return (
        <select value={currentLang} onChange={(e) => changeLanguage(e.target.value)}>
            {langues.map((langue) => (
                <option key={langue.id} value={langue.code}>
                    {langue.nom}
                </option>
            ))}
        </select>
    );
}
