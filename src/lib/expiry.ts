import { addDays, daysDiff, formatDate, parseDate, today } from './dates'

export type ExpiryStatus = 'ok' | 'soon' | 'expired' | 'none'

export interface ExpiryInput {
  expiry_date?: string | null
  opened_at?: string | null
  days_after_opening?: number | null
}

/**
 * Calcula la fecha efectiva de vencimiento.
 * Si el producto está abierto, usa min(expiry_date, opened_at + days_after_opening).
 * Retorna null si no hay ninguna fecha definida.
 */
export function calculateExpiryEffective(item: ExpiryInput): string | null {
  const { expiry_date, opened_at, days_after_opening } = item

  if (!expiry_date && !opened_at) return null

  if (!expiry_date) return null // sin expiry_date no calculamos

  if (!opened_at || days_after_opening == null) return expiry_date

  const expiryDate = parseDate(expiry_date)
  const openedDate = parseDate(opened_at)
  const afterOpeningDate = addDays(openedDate, days_after_opening)

  // Usar la fecha que llegue primero
  return afterOpeningDate < expiryDate
    ? formatDate(afterOpeningDate)
    : expiry_date
}

/**
 * Determina el estado de vencimiento de un ítem.
 * @param nDays - Días de anticipación para considerar "soon" (default 3)
 */
export function calculateExpiryStatus(item: ExpiryInput, nDays: number): ExpiryStatus {
  const effective = calculateExpiryEffective(item)
  if (!effective) return 'none'

  const effectiveDate = parseDate(effective)
  const todayDate = today()
  const diff = daysDiff(todayDate, effectiveDate) // positivo = futuro

  if (diff < 0) return 'expired' // ya pasó
  if (diff === 0) return 'expired' // vence hoy = expirado
  if (diff <= nDays) return 'soon'
  return 'ok'
}

/**
 * Genera texto descriptivo del vencimiento para mostrar en la UI.
 * Siempre acompañar con color/icono, nunca texto solo.
 */
export function formatExpiryText(item: ExpiryInput, _nDays: number = 3): string {
  const effective = calculateExpiryEffective(item)
  if (!effective) return ''

  const effectiveDate = parseDate(effective)
  const todayDate = today()
  const diff = daysDiff(todayDate, effectiveDate)

  if (diff === 0) return 'Vence hoy'
  if (diff === 1) return 'Vence mañana'
  if (diff > 1) return `Vence en ${diff} días`
  if (diff === -1) return 'Venció hace 1 día'
  return `Venció hace ${Math.abs(diff)} días`
}

/** Texto corto para badges y cards */
export function formatExpiryShort(item: ExpiryInput, nDays: number = 3): string {
  const status = calculateExpiryStatus(item, nDays)
  if (status === 'none') return ''

  const effective = calculateExpiryEffective(item)!
  const diff = daysDiff(today(), parseDate(effective))

  if (status === 'expired') {
    return diff === 0 ? 'Hoy' : `Hace ${Math.abs(diff)}d`
  }
  if (status === 'soon') return diff === 1 ? 'Mañana' : `${diff}d`
  return ''
}
