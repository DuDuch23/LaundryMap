interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full transition-colors relative shrink-0 focus-visible:ring-2 focus-visible:ring-[#14A8DE]/50 focus-visible:outline-none ${
                checked ? 'bg-[#14A8DE]' : 'bg-gray-200'
            }`}
        >
            {label && <span className="sr-only">{label}</span>}
            <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
}
