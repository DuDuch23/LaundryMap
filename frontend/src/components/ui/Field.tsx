export function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export function inputClass(error?: string) {
    return `w-full max-w-[stretch] px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
        error
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 bg-white focus:border-[#14A8DE] focus:ring-2 focus:ring-[#14A8DE]/20'
    }`;
}
