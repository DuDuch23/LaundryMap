import { useEffect, useRef } from 'react';

export interface FilterSection {
    label: string;
    key: string;
    options: FilterOption[];
}

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterValues {
    [key: string]: string;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filtres: FilterValues) => void;
    onClear: () => void;
    sections: FilterSection[];
    values: FilterValues;
    onChange: (key: string, value: string) => void;
}

export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    onClear,
    sections,
    values,
    onChange,
}: FilterModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<Element | null>(null);

    // --- NOUVEAU : Vérifie s'il y a au moins un filtre actif (non vide, non null) ---
    const hasActiveFilters = Object.values(values).some(val => val !== '' && val !== null && val !== undefined);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            modalRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();

        if (e.key === 'Tab') {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusableElements || focusableElements.length === 0) return;

            const first = focusableElements[0] as HTMLElement;
            const last = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    const handleEffacer = () => {
        onClear();
    };

    const handleAppliquer = () => {
        onApply(values);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            role="presentation"
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-modal-title"
                ref={modalRef}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition"
                            aria-label="Retour"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <h2 id="filter-modal-title" className="text-lg font-bold">Filtres</h2>
                    </div>

                    {/* NOUVEAU : Affichage conditionnel des boutons */}
                    <div className="flex items-center gap-3">
                        {hasActiveFilters ? (
                            <>
                                <button
                                    onClick={handleEffacer}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer"
                                >
                                    Effacer
                                </button>
                                <button
                                    onClick={handleEffacer}
                                    className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition cursor-pointer"
                                    aria-label="Effacer les filtres"
                                >
                                    <img src="/src/assets/layers_clear.svg" alt="" className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                className="bg-black text-white p-1.5 rounded-md hover:bg-gray-800 transition cursor-default"
                                aria-label="Filtres"
                            >
                                <img src="/src/assets/filter_alt.svg" alt="Aucun filtre" className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sections de filtres */}
                <div className="p-5 space-y-6">
                    {sections.map((section) => (
                        <div key={section.key}>
                            <h3 className="text-black font-semibold text-sm mb-3 underline underline-offset-4 decoration-1">
                                {section.label}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {section.options.map((option) => {
                                    const isActive = values[section.key] === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => onChange(section.key, option.value)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${isActive
                                                    ? 'bg-[#22ACE2] text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bouton Appliquer */}
                <div className="p-5 pt-2">
                    <button
                        onClick={handleAppliquer}
                        className="w-fit mx-auto block bg-[#22ACE2] hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-sm cursor-pointer"
                    >
                        Appliquer les filtres
                    </button>
                </div>
            </div>
        </div>
    );
}