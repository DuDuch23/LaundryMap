import type { FormEvent } from 'react';
import type { GeoSuggestion, Position } from '../../types/Laverie';

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
    return (
        <form onSubmit={onSubmit} className="relative">
            <div className="flex gap-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-2">

                {/* Input */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && onSuggestionBlur()}
                        onBlur={() => setTimeout(onSuggestionBlur, 200)}
                        placeholder="Rechercher par ville, code postal, adresse…"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                        aria-label="Recherche de laveries"
                        autoComplete="off"
                    />
                    {geocoding && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#14A8DE] border-t-transparent rounded-full animate-spin" />
                        </span>
                    )}
                </div>

                {/* Bouton rechercher */}
                <button
                    type="submit"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#14A8DE] text-white text-sm font-semibold hover:bg-[#119ac8] transition-colors"
                >
                    Rechercher
                </button>

                {/* Bouton géolocalisation */}
                {showGeo && onGeoClick && (
                    <button
                        type="button"
                        onClick={onGeoClick}
                        title="Utiliser ma position"
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        aria-label="Recentrer sur ma position"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                            <circle cx="12" cy="12" r="9"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Liste de suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <ul
                    role="listbox"
                    aria-label="Suggestions de localisation"
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                    {suggestions.map((s, i) => {
                        const [principal, ...reste] = s.label.split(',');
                        return (
                            <li key={i} role="option" aria-selected={false}>
                                <button
                                    type="button"
                                    onMouseDown={() => onSuggestionPick(s)}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <span className="font-medium text-slate-800">{principal}</span>
                                    {reste.length > 0 && (
                                        <span className="text-slate-400 text-xs ml-2">{reste.join(',').trim()}</span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </form>
    );
}
