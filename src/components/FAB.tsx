import { Link } from 'react-router-dom'

interface FABProps {
  to: string
  label?: string
}

export function FAB({ to, label = 'Agregar' }: FABProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="fixed bottom-20 right-5 z-40 flex items-center gap-2 bg-emerald-600 text-white min-h-[52px] min-w-[52px] px-4 rounded-full shadow-lg shadow-emerald-700/30 hover:bg-emerald-700 active:scale-95 transition-all text-base font-semibold"
    >
      <span className="text-2xl leading-none" aria-hidden="true">+</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
