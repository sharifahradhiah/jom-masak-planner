export default function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-xl bg-cream-200 p-1 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
