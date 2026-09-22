export default function Card({ className = '', children, ...props }) {
  // Tailwind utilities of equal specificity are ordered by the generated
  // stylesheet, not by className string order — so a caller-provided
  // `bg-*` override can silently lose to this default. Only apply the
  // default background when the caller hasn't supplied their own.
  const hasBgOverride = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-2xl border border-cream-300/70 ${hasBgOverride ? '' : 'bg-white'} shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
