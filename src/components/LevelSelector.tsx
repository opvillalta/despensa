import type { Level } from '../lib/shopping'
import { es } from '../i18n/es'

interface LevelSelectorProps {
  value: Level | null | undefined
  onChange: (level: Level) => void
  disabled?: boolean
}

export function LevelSelector({ value, onChange, disabled }: LevelSelectorProps) {
  const levels: { level: Level; label: string; icon: string; activeColor: string }[] = [
    { level: 'empty', label: es.levels.empty, icon: '🪹', activeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
    { level: 'low', label: es.levels.low, icon: '📉', activeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
    { level: 'half', label: es.levels.half, icon: '⚖️', activeColor: 'bg-sky-100 text-sky-800 border-sky-300' },
    { level: 'full', label: es.levels.full, icon: '✨', activeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ]

  return (
    <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-full max-w-sm gap-1">
      {levels.map(({ level, label, icon, activeColor }) => {
        const isSelected = value === level
        return (
          <button
            key={level}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level)}
            className={`flex-1 min-h-[38px] flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold rounded-lg active:scale-[0.96] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isSelected
                ? `${activeColor} border shadow-xs`
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <span className="text-sm">{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
