import { Check, X } from 'lucide-react';

export default function GroceryItemRow({ item, checked, onToggle, onRemove, isExtra }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5">
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          checked ? 'border-sage-500 bg-sage-500 text-white' : 'border-cream-400 hover:border-sage-400'
        }`}
        aria-label={checked ? 'Mark as not bought' : 'Mark as bought'}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${checked ? 'text-ink-300 line-through' : 'text-ink-800'}`}>
          {item.name}
        </p>
        {item.usedIn?.length > 0 && (
          <p className="truncate text-xs text-ink-400">{item.usedIn.join(', ')}</p>
        )}
      </div>
      <span className={`shrink-0 text-sm ${checked ? 'text-ink-300' : 'text-ink-500'}`}>
        {item.qty} {item.unit}
      </span>
      {isExtra && (
        <button onClick={onRemove} className="shrink-0 rounded-lg p-1 text-ink-300 hover:bg-terracotta-50 hover:text-terracotta-600">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
