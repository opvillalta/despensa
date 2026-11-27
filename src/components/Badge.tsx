import type { ExpiryStatus } from '../lib/expiry'
import { es } from '../i18n/es'

interface BadgeProps {
  status: ExpiryStatus
  label?: string
  className?: string
}

export function Badge({ status, label, className = '' }: BadgeProps) {
  const styles = {
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    soon: 'bg-amber-50 text-amber-700 border-amber-200/80',
    expired: 'bg-rose-50 text-rose-700 border-rose-200/80',
    none: 'bg-zinc-50 text-zinc-600 border-zinc-200/80',
  }

  const icons = {
    ok: '🟢',
    soon: '⚠️',
    expired: '🔴',
    none: '⚪',
  }

  const text = label || es.expiry[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]} ${className}`}
    >
      <span className="text-[10px]" aria-hidden="true">{icons[status]}</span>
      <span>{text}</span>
    </span>
  )
}
