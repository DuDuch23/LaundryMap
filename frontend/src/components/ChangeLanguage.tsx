import { useTranslation } from 'react-i18next';
import type { Langue } from '../types/Langue';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type ChangeLanguageProps = {
    langues: Langue[];
    selectedLangueId: number | '';
    onSelectLangueId: (langueId: number) => void;
};

export default function ChangeLanguage({ langues, selectedLangueId, onSelectLangueId }: ChangeLanguageProps) {
    const { i18n, t } = useTranslation();

    const handleChange = (value: string) => {
        const selectedId = Number(value);
        if (!selectedId) return;
        onSelectLangueId(selectedId);
        const langue = langues.find((l) => l.id === selectedId);
        if (langue?.code) i18n.changeLanguage(langue.code);
    };

    return (
        <Select
            value={selectedLangueId === '' ? undefined : String(selectedLangueId)}
            onValueChange={handleChange}
        >
            <SelectTrigger
                className="w-auto min-w-32 text-sm text-slate-700"
                aria-label={t('main.change_language.aria_label')}
            >
                <SelectValue placeholder={t('main.profil.langue')} />
            </SelectTrigger>
            <SelectContent>
                {langues.map((langue) => (
                    <SelectItem key={langue.id} value={String(langue.id)}>
                        {langue.nom}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
