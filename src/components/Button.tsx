import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
  
  const sizes = {
    sm: 'min-h-[36px] px-3 text-sm min-w-[36px]',
    md: 'min-h-[44px] px-4 text-base min-w-[44px]', // Criterio 44x44px min touch target
    lg: 'min-h-[52px] px-6 text-lg min-w-[52px]',
  }

  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-700/20 active:bg-emerald-800',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 active:bg-zinc-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-700/20 active:bg-rose-800',
    ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200',
  }

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
