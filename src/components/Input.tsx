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
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] px-3.5 py-2 text-base rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25 focus:border-ring transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xs ${
          error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  )
}
