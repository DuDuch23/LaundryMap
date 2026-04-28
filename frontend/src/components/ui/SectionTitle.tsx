export function SectionTitle({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
    return (
        <div className="flex items-start gap-4 mb-6 flex-wrap">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#14A8DE] text-white flex items-center justify-center text-sm font-bold">
                {step}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}
