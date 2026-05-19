import { Skeleton } from '@/components/ui/skeleton';

export interface CheckboxItem {
    id: string | number;
    label: string;
}

interface CheckboxGroupProps {
    title: string;
    items: CheckboxItem[];
    isChecked: (id: string | number) => boolean;
    onToggle: (id: string | number) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export function CheckboxGroup({
    title,
    items,
    isChecked,
    onToggle,
    loading,
    emptyMessage = 'Aucun élément disponible.',
}: CheckboxGroupProps) {
    return (
        <div>
            <p className="text-md font-medium text-gray-700 mb-2">{title}</p>
            {loading ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-28" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-sm text-gray-400">{emptyMessage}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {items.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isChecked(item.id)}
                                onChange={() => onToggle(item.id)}
                                className="w-4 h-4 rounded border-gray-300 accent-[#14A8DE]"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
