import GroceryItemRow from './GroceryItemRow';

const CATEGORY_EMOJI = {
  Produce: '🥕',
  'Meat & Seafood': '🍗',
  'Dairy & Eggs': '🥛',
  'Grains & Pantry': '🌾',
  Spices: '🧂',
  Other: '🧺',
};

export default function GroceryCategoryGroup({ category, items, checkedMap, onToggle, onRemove }) {
  const doneCount = items.filter((i) => checkedMap[i.id]).length;
  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-3.5">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
          <span>{CATEGORY_EMOJI[category] || '🧺'}</span> {category}
        </p>
        <span className="text-xs font-medium text-ink-400">
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <GroceryItemRow
            key={item.id}
            item={item}
            checked={!!checkedMap[item.id]}
            onToggle={() => onToggle(item)}
            onRemove={() => onRemove(item)}
            isExtra={item.isExtra}
          />
        ))}
      </div>
    </div>
  );
}
