import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react'
import type { ExpiryStatus } from '../lib/expiry'
import { es } from '../i18n/es'

interface BadgeProps {
  status: ExpiryStatus
  label?: string
  className?: string
}

export function Badge({ status, label, className = '' }: BadgeProps) {
  const styles = {
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    soon: 'bg-amber-50 text-amber-700 border-amber-200',
    expired: 'bg-red-50 text-destructive border-red-200',
    none: 'bg-muted text-muted-foreground border-border',
  }

  const icons = {
    ok: CheckCircle2,
    soon: AlertTriangle,
    expired: XCircle,
    none: MinusCircle,
  }

  const Icon = icons[status]
  const text = label || es.expiry[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}
