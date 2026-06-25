import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Machine } from '@/types/Machine';

interface MachineRowProps {
    machine: Machine;
    index: number;
    onUpdate: (id: string, field: keyof Machine, value: string) => void;
    onRemove: (id: string) => void;
}

const fieldClass =
    'w-full max-w-[stretch] px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#14A8DE] focus:outline-none';

export function MachineRow({ machine, index, onUpdate, onRemove }: MachineRowProps) {
    return (
        <div
            className={`p-4 rounded-xl border ${
                machine.wiline_machine_id ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
            }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Machine #{index + 1}
                    </span>
                    {machine.wiline_machine_id && (
                        <span className="text-xs bg-[#14A8DE]/10 text-[#14A8DE] px-2 py-0.5 rounded-full font-medium">
                            WI-LINE
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemove(machine.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    aria-label="Supprimer la machine"
                >
                    <X />
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                    <input
                        type="text"
                        value={machine.nom}
                        onChange={(e) => onUpdate(machine.id, 'nom', e.target.value)}
                        placeholder="Ex: Machine 1"
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <Select
                        value={machine.type}
                        onValueChange={(val) => onUpdate(machine.id, 'type', val)}
                    >
                        <SelectTrigger className="w-full max-w-[stretch] h-auto py-2 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lave-linge">Lave-linge</SelectItem>
                            <SelectItem value="sèche-linge">Sèche-linge</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Capacité (kg)</label>
                    <input
                        type="number"
                        value={machine.capacite}
                        onChange={(e) => onUpdate(machine.id, 'capacite', e.target.value)}
                        placeholder="8"
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tarif (€)</label>
                    <input
                        type="number"
                        step="0.10"
                        value={machine.tarif}
                        onChange={(e) => onUpdate(machine.id, 'tarif', e.target.value)}
                        placeholder="4.50"
                        className={fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Durée (min)</label>
                    <input
                        type="number"
                        value={machine.duree}
                        onChange={(e) => onUpdate(machine.id, 'duree', e.target.value)}
                        placeholder="45"
                        className={fieldClass}
                    />
                </div>
            </div>
        </div>
    );
}
