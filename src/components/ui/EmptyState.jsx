export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cream-400 bg-cream-50 px-6 py-12 text-center">
      {Icon && (
        <div className="rounded-full bg-cream-200 p-3 text-terracotta-500">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="font-display text-base font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
