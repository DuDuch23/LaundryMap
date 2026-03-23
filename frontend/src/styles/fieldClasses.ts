export const BASE_INPUT_FIELD_CLASSES = 'w-full p-3 border border-slate-200 rounded-lg text-slate-700 outline-none transition-all';

export const EDITABLE_INPUT_FIELD_CLASSES = 'focus:ring-2 focus:ring-[#22ACE2] focus:border-transparent';

export const READONLY_INPUT_FIELD_CLASSES = 'bg-slate-100 text-slate-500 cursor-not-allowed pointer-events-none focus:ring-0';

export function getInputFieldClasses(readOnly: boolean): string {
  return `${BASE_INPUT_FIELD_CLASSES} ${readOnly ? READONLY_INPUT_FIELD_CLASSES : EDITABLE_INPUT_FIELD_CLASSES}`;
}
