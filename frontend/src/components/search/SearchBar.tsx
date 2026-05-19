/**
 * SearchBar — Combobox accessible avec navigation clavier (↑↓ sur suggestions,
 * Enter pour sélectionner, Escape pour fermer).
 *
 * Utilise @headlessui/react Combobox qui gère automatiquement :
 *  - aria-expanded / aria-haspopup / aria-autocomplete sur l'input
 *  - role="listbox" et role="option" sur les suggestions
 *  - aria-activedescendant pour annoncer l'option courante aux lecteurs d'écran
 *  - Navigation ↑↓ + Enter + Escape
 */
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
} from '@headlessui/react';
import type { GeoSuggestion } from '../../types/Laverie';

interface Props {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (e: FormEvent) => void;
    onGeoClick?: () => void;
    showGeo: boolean;
    geocoding: boolean;
    suggestions: GeoSuggestion[];
    showSuggestions: boolean;
    onSuggestionPick: (s: GeoSuggestion) => void;
    onSuggestionBlur: () => void;
}

export default function SearchBar({
    value, onChange, onSubmit, onGeoClick, showGeo,
    geocoding, suggestions, showSuggestions, onSuggestionPick, onSuggestionBlur,
}: Props) {
    const { t } = useTranslation();

    // On masque les suggestions en passant un tableau vide quand showSuggestions=false.
    // Headlessui ne rend plus <ComboboxOptions> → aucune suggestion visible.
    const visibleSuggestions = showSuggestions ? suggestions : [];

    return (
        <form onSubmit={onSubmit} className="relative" role="search">
            <div className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-2">

                {/*
                  * Combobox headlessui :
                  * - onChange  → appelé quand une suggestion est choisie (↑↓ Enter ou clic)
                  * - onClose   → appelé quand le panneau se ferme (Escape, clic dehors)
                  */}
                <Combobox
                    as="div"
                    className="w-full box-border flex-1"
                    onChange={(s: GeoSuggestion) => onSuggestionPick(s)}
                    onClose={onSuggestionBlur}
                >
                    {/* Icône loupe — décorative */}
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none"
                        aria-hidden="true"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </span>

                    {/*
                      * ComboboxInput ajoute automatiquement :
                      *   aria-autocomplete="list"
                      *   aria-expanded={ouvert}
                      *   aria-controls={id du listbox}
                      *   aria-activedescendant={id de l'option courante}
                      *
                      * displayValue : headlessui appelle cette fonction avec la valeur
                      * sélectionnée pour remplir l'input. Ici on ignore cet argument
                      * et on retourne toujours `value` (la saisie contrôlée du parent).
                      */}
                    <ComboboxInput
                        className="!box-border pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                        placeholder={t('main.search_bar.placeholder')}
                        aria-label={t('main.search_bar.placeholder')}
                        id='search-input'
                        autoComplete="off"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        displayValue={() => value}
                    />

                    {/* Spinner geocoding — décoratif */}
                    {geocoding && (
                        <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                            aria-hidden="true"
                        >
                            <div className="w-4 h-4 border-2 border-[#14A8DE] border-t-transparent rounded-full animate-spin" />
                        </span>
                    )}

                    {/*
                      * ComboboxOptions reçoit automatiquement role="listbox".
                      * Chaque ComboboxOption reçoit role="option" + aria-selected.
                      * L'option courante (via ↑↓) est mise en évidence via focus=true.
                      */}
                    {visibleSuggestions.length > 0 && (
                        <ComboboxOptions className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                            {visibleSuggestions.map((s, i) => {
                                const [principal, ...reste] = s.label.split(',');
                                return (
                                    <ComboboxOption
                                        key={i}
                                        value={s}
                                        className={({ focus }) =>
                                            `w-full text-left px-4 py-3 text-sm border-b border-slate-50 last:border-0 cursor-pointer transition-colors ${focus ? 'bg-slate-50' : ''}`
                                        }
                                    >
                                        <span className="font-medium text-slate-800">{principal}</span>
                                        {reste.length > 0 && (
                                            <span className="text-slate-400 text-xs ml-2">{reste.join(',').trim()}</span>
                                        )}
                                    </ComboboxOption>
                                );
                            })}
                        </ComboboxOptions>
                    )}
                </Combobox>

                {/* Bouton Rechercher */}
                <button
                    id='search-button'
                    type="submit"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#14A8DE] text-white text-sm font-semibold hover:bg-[#119ac8] transition-colors"
                >
                    {t('main.search_bar.rechercher')}
                </button>

                {/* Bouton Géolocalisation */}
                {showGeo && onGeoClick && (
                    <button
                        type="button"
                        onClick={onGeoClick}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        id='search-button'
                        aria-label={t('main.search_bar.recentrer')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                            <circle cx="12" cy="12" r="9"/>
                        </svg>
                    </button>
                )}
            </div>
        </form>
    );
}
