export const BASE_INPUT_FIELD_CLASSES = 'w-full px-3 py-2.5 border rounded-lg bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all';

export const EDITABLE_INPUT_FIELD_CLASSES = 'border-gray-300 focus:border-[#22ACE2] focus:ring-2 focus:ring-[#22ACE2]/25';

export const READONLY_INPUT_FIELD_CLASSES = 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed pointer-events-none focus:ring-0';

export function getInputFieldClasses(readOnly: boolean): string {
  return `${BASE_INPUT_FIELD_CLASSES} ${readOnly ? READONLY_INPUT_FIELD_CLASSES : EDITABLE_INPUT_FIELD_CLASSES}`;
}
