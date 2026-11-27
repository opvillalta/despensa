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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl select-none active:scale-[0.97] transition-[transform,background-color,border-color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] disabled:opacity-50 disabled:pointer-events-none'
  
  const sizes = {
    sm: 'min-h-[36px] px-3 text-sm min-w-[36px]',
    md: 'min-h-[44px] px-4 text-base min-w-[44px]',
    lg: 'min-h-[52px] px-6 text-lg min-w-[52px]',
  }

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-emerald-600 shadow-sm shadow-primary/20 active:bg-emerald-700',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-sky-100 border border-border active:bg-sky-200',
    danger: 'bg-destructive text-destructive-foreground hover:bg-red-600 shadow-sm shadow-destructive/20 active:bg-red-700',
    ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-sky-100',
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
