import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
}

interface SelectProps {
  label?: string
  error?: string
  icon?: ReactNode
  options: SelectOption[]
  value?: string
  onChange?: (e: { target: { value: string; name?: string } }) => void
  placeholder?: string
  name?: string
  id?: string
  disabled?: boolean
  className?: string
}

export function Select({
  label,
  error,
  icon,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar opción…',
  name,
  id,
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleSelect(val: string) {
    if (onChange) {
      onChange({ target: { value: val, name } })
    }
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      {/* Botón Trigger */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border bg-card flex items-center justify-between text-left transition-[border-color,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen
            ? 'border-ring ring-2 ring-ring/20 shadow-xs'
            : 'border-input hover:border-muted-foreground shadow-2xs'
        } ${error ? 'border-destructive ring-2 ring-destructive/20' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer'
        } ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {icon && (
            <span className="flex-shrink-0 text-muted-foreground">
              {selectedOption?.icon || icon}
            </span>
          )}
          <span
            className={`text-base truncate ${
              selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        >
          <ChevronDown className="w-4.5 h-4.5" strokeWidth={2.2} />
        </span>
      </button>

      {/* Menú flotante */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-popover rounded-2xl border border-border shadow-lg p-1.5 max-h-60 overflow-y-auto scrollbar-thin animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full min-h-[42px] px-3 py-2 rounded-xl flex items-center justify-between text-left transition-[background-color,color] duration-100 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-foreground hover:bg-secondary hover:text-foreground font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {opt.icon && (
                    <span
                      className={`flex-shrink-0 ${
                        isSelected ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <span className="text-sm truncate">{opt.label}</span>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  )
}
