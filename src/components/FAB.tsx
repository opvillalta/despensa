import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

interface FABProps {
  to: string
  label?: string
}

export function FAB({ to, label = 'Agregar' }: FABProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="fixed bottom-20 right-5 z-40 flex items-center justify-center gap-2 bg-primary text-primary-foreground min-h-[52px] min-w-[52px] px-4 rounded-full shadow-md shadow-primary/25 hover:bg-emerald-600 active:scale-[0.94] transition-[transform,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] text-base font-semibold"
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
