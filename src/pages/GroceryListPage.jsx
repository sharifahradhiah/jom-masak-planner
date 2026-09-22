import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Share2, Plus, ShoppingBasket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useToast } from '../contexts/ToastContext';
import * as groceryService from '../services/api/groceryService';
import { getWeekDates, addDays, formatRange, formatDay, formatDayLong, getDayNumber, todayISO } from '../utils/date';
import { openWhatsAppShare } from '../utils/whatsapp';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import GroceryCategoryGroup from '../components/groceries/GroceryCategoryGroup';
import ChipToggle from '../components/ui/ChipToggle';

export default function GroceryListPage() {
  const { user } = useAuth();
  const { plannedMeals, getRecipeById } = useMealPlan();
  const { showToast } = useToast();

  const [anchorDate, setAnchorDate] = useState(todayISO());
  const [selectedDay, setSelectedDay] = useState(null); // null = whole week
  const [checkedMap, setCheckedMap] = useState({});
  const [extraItems, setExtraItems] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', qty: '', category: 'Other' });

  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate]);

  useEffect(() => {
    if (!user) return;
    groceryService.getCheckedState(user.id).then(setCheckedMap);
    groceryService.getExtraItems(user.id).then(setExtraItems);
  }, [user]);

  const rangeMeals = useMemo(
    () =>
      plannedMeals.filter((m) => (selectedDay ? m.date === selectedDay : weekDates.includes(m.date))),
    [plannedMeals, weekDates, selectedDay]
  );

  const groups = useMemo(() => {
    const derived = groceryService.deriveGroceryList(rangeMeals, getRecipeById);
    const extrasByCategory = new Map();
    extraItems.forEach((item) => {
      const list = extrasByCategory.get(item.category) || [];
      list.push({ ...item, unit: '', usedIn: [], isExtra: true });
      extrasByCategory.set(item.category, list);
    });

    const merged = derived.map((g) => ({
      category: g.category,
      items: [...g.items, ...(extrasByCategory.get(g.category) || [])],
    }));
    extrasByCategory.forEach((items, category) => {
      if (!merged.some((g) => g.category === category)) {
        merged.push({ category, items });
      }
    });
    return merged;
  }, [rangeMeals, getRecipeById, extraItems]);

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const checkedCount = groups.reduce(
    (sum, g) => sum + g.items.filter((i) => checkedMap[i.id]).length,
    0
  );

  async function handleToggle(item) {
    const next = !checkedMap[item.id];
    setCheckedMap((prev) => ({ ...prev, [item.id]: next }));
    await groceryService.setItemChecked(user.id, item.id, next);
  }

  async function handleRemoveExtra(item) {
    setExtraItems((prev) => prev.filter((i) => i.id !== item.id));
    await groceryService.removeExtraItem(user.id, item.id);
  }

  async function handleAddExtra(e) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const created = await groceryService.addExtraItem(user.id, newItem);
    setExtraItems((prev) => [...prev, created]);
    setNewItem({ name: '', qty: '', category: 'Other' });
    setAddOpen(false);
  }

  function buildShareText() {
    const header = selectedDay
      ? `*Grocery list* — ${formatDayLong(selectedDay)}`
      : `*Grocery list* — ${formatRange(weekDates[0], weekDates[6])}`;
    const lines = [header, ''];
    groups.forEach((g) => {
      const toBuy = g.items.filter((item) => !checkedMap[item.id]);
      if (toBuy.length === 0) return;
      lines.push(`*${g.category}*`);
      toBuy.forEach((item) => {
        const qty = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''} ` : '';
        lines.push(`☐ ${qty}${item.name}`);
      });
      lines.push('');
    });
    lines.push('Sent from JomMasak Planner');
    return lines.join('\n');
  }

  function handleShare() {
    if (totalItems - checkedCount === 0) {
      showToast("Everything's already checked off — nothing left to buy", 'info');
      return;
    }
    openWhatsAppShare(buildShareText());
    showToast('Opening WhatsApp to share your list…');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Grocery list"
        subtitle="Auto-generated from your planned meals — check items off as you shop."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-cream-300 bg-white px-1 py-1">
          <button
            onClick={() => {
              setAnchorDate((d) => addDays(d, -7));
              setSelectedDay(null);
            }}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[150px] text-center text-sm font-semibold text-ink-800">
            {formatRange(weekDates[0], weekDates[6])}
          </span>
          <button
            onClick={() => {
              setAnchorDate((d) => addDays(d, 7));
              setSelectedDay(null);
            }}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-cream-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
          <Button size="sm" onClick={handleShare} disabled={totalItems - checkedCount === 0}>
            <Share2 className="h-4 w-4" /> Share to WhatsApp
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <ChipToggle label="Whole week" selected={!selectedDay} onClick={() => setSelectedDay(null)} />
        {weekDates.map((date) => (
          <ChipToggle
            key={date}
            label={`${formatDay(date)} ${getDayNumber(date)}`}
            selected={selectedDay === date}
            onClick={() => setSelectedDay(date)}
          />
        ))}
      </div>

      {totalItems > 0 && (
        <Card className="mb-4 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-700">Shopping progress</span>
            <span className="font-semibold text-ink-900">
              {checkedCount}/{totalItems}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-sage-500 transition-all"
              style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </Card>
      )}

      {totalItems > 0 ? (
        <div className="space-y-3">
          {groups.map((g) => (
            <GroceryCategoryGroup
              key={g.category}
              category={g.category}
              items={g.items}
              checkedMap={checkedMap}
              onToggle={handleToggle}
              onRemove={handleRemoveExtra}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBasket}
          title="No groceries yet"
          description={`Plan some meals for ${
            selectedDay ? formatDayLong(selectedDay) : 'this week'
          } and your shopping list will build itself.`}
          action={<Button onClick={() => setAddOpen(true)}>Add an item manually</Button>}
        />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} size="sm" title="Add grocery item">
        <form onSubmit={handleAddExtra} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Item name</label>
            <input
              autoFocus
              required
              value={newItem.name}
              onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))}
              placeholder="Paper towels"
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Quantity</label>
              <input
                value={newItem.qty}
                onChange={(e) => setNewItem((f) => ({ ...f, qty: e.target.value }))}
                placeholder="2 rolls"
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-terracotta-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-2 py-2 text-sm outline-none focus:border-terracotta-400"
              >
                {groceryService.CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full justify-center">
            Add to list
          </Button>
        </form>
      </Modal>
    </PageContainer>
  );
}
