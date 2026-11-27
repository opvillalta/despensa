import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] px-3.5 py-2 text-base rounded-xl border border-zinc-300 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </div>
  )
}
