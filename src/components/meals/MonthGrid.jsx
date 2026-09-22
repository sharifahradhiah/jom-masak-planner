import { getMonthMatrix, getDayNumber, isToday, isSameMonth } from '../../utils/date';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthGrid({ referenceDate, plannedMeals, onSelectDate, selectedDate }) {
  const { weeks } = getMonthMatrix(referenceDate);

  function countFor(date) {
    return plannedMeals.filter((m) => m.date === date).length;
  }

  return (
    <div className="w-full min-w-0 rounded-2xl border border-cream-300 bg-cream-50 p-2 sm:p-4">
      <div className="grid grid-cols-7 gap-0.5 pb-2 text-center text-[10px] font-semibold uppercase text-ink-400 sm:gap-1 sm:text-[11px]">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {weeks.flat().map((date) => {
          const inMonth = isSameMonth(date, referenceDate);
          const count = countFor(date);
          const selected = date === selectedDate;
          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-colors sm:text-sm ${
                selected
                  ? 'bg-terracotta-500 text-white'
                  : isToday(date)
                  ? 'bg-terracotta-50 text-terracotta-600 font-semibold'
                  : inMonth
                  ? 'bg-white text-ink-800 hover:bg-cream-200'
                  : 'bg-transparent text-ink-300 hover:bg-cream-100'
              }`}
            >
              <span>{getDayNumber(date)}</span>
              {count > 0 && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    selected ? 'bg-white' : 'bg-terracotta-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
