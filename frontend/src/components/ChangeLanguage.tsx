import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Langue } from '../types/Langue';

type ChangeLanguageProps = {
    langues: Langue[];
    selectedLangueId: number | '';
    onSelectLangueId: (langueId: number) => void;
};

export default function ChangeLanguage({ langues, selectedLangueId, onSelectLangueId }: ChangeLanguageProps) {
    const { i18n, t } = useTranslation();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = Number(event.target.value);

        if (!selectedId) {
            return;
        }

        onSelectLangueId(selectedId);

        const langueSelectionnee = langues.find((langue) => langue.id === selectedId);
        if (langueSelectionnee?.code) {
            i18n.changeLanguage(langueSelectionnee.code);
        }
    };

    return (
        <select
            value={selectedLangueId === '' ? '' : String(selectedLangueId)}
            onChange={handleChange}
            className="w-auto min-w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none transition-all focus:ring-2 focus:ring-[#22ACE2] focus:border-transparent"
        >
            <option value="" disabled>
                {t('main.profil.langue')}
            </option>
            {langues.map((langue) => (
                <option key={langue.id} value={langue.id}>
                    {langue.nom}
                </option>
            ))}
        </select>
    );
}
