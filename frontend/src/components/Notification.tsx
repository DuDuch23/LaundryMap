import { useEffect, useState } from 'react';

type Props = {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
  duration?: number;
};

export default function Notification({ type, message, onClose, duration = 3000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger entrance animation
    const raf = requestAnimationFrame(() => setVisible(true));

    // auto-dismiss
    const id = window.setTimeout(() => setVisible(false), duration);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
    };
  }, [duration]);

  // call onClose after animation ends when hiding
  useEffect(() => {
    if (!visible) {
      const t = window.setTimeout(() => onClose && onClose(), 200);
      return () => clearTimeout(t);
    }
    return;
  }, [visible, onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 w-auto max-w-sm origin-top-right transform-gpu transition-all duration-200 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
      }`}
    >
      <div className={`rounded-lg shadow-lg px-4 py-3 text-sm font-semibold text-white ${bg} flex items-center gap-3`}>
        <div className="flex-1 text-center leading-tight">{message}</div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-3 -mr-1 rounded-md px-2 py-1 text-white/95 hover:text-white focus:outline-none"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
