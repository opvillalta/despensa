import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || props.name

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full min-h-[44px] px-3.5 py-2 text-base rounded-xl border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
          error ? 'border-rose-400 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </div>
  )
}
