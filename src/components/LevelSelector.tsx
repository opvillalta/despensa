import type { ComponentType } from 'react'
import { CircleSlash, BatteryLow, BatteryMedium, Sparkles } from 'lucide-react'
import type { Level } from '../lib/shopping'
import { es } from '../i18n/es'

interface LevelSelectorProps {
  value: Level | null | undefined
  onChange: (level: Level) => void
  disabled?: boolean
}

export function LevelSelector({ value, onChange, disabled }: LevelSelectorProps) {
  const levels: { level: Level; label: string; Icon: ComponentType<{ className?: string; strokeWidth?: number }>; activeColor: string }[] = [
    { level: 'empty', label: es.levels.empty, Icon: CircleSlash, activeColor: 'bg-red-50 text-destructive border-red-200' },
    { level: 'low', label: es.levels.low, Icon: BatteryLow, activeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { level: 'half', label: es.levels.half, Icon: BatteryMedium, activeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
    { level: 'full', label: es.levels.full, Icon: Sparkles, activeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  return (
    <div className="inline-flex rounded-xl border border-border bg-secondary/50 p-1 w-full max-w-sm gap-1">
      {levels.map(({ level, label, Icon, activeColor }) => {
        const isSelected = value === level
        return (
          <button
            key={level}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level)}
            className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg active:scale-[0.96] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isSelected
                ? `${activeColor} border shadow-xs`
                : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
