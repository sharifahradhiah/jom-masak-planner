import { Check } from 'lucide-react';

export default function ChipToggle({ label, selected, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'border-terracotta-500 bg-terracotta-500 text-white'
          : 'border-cream-300 bg-white text-ink-700 hover:border-terracotta-300'
      } ${className}`}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
