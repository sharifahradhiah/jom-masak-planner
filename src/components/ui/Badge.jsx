const TONES = {
  terracotta: 'bg-terracotta-50 text-terracotta-600',
  sage: 'bg-sage-50 text-sage-600',
  honey: 'bg-honey-300/40 text-ink-700',
  ink: 'bg-cream-200 text-ink-500',
  white: 'bg-white/90 text-ink-700',
};

export default function Badge({ tone = 'ink', className = '', children, icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
