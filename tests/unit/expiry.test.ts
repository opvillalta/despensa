import { describe, expect, it } from 'vitest'
import {
  calculateExpiryEffective,
  calculateExpiryStatus,
  formatExpiryText,
} from '../../src/lib/expiry'

// Helper: fecha relativa a hoy en formato YYYY-MM-DD (hora local, no UTC)
function daysFromNow(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  // Formatear con hora local para evitar off-by-one por UTC offset
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

// --- calculateExpiryEffective ---

describe('calculateExpiryEffective', () => {
  it('retorna null si no hay fecha de vencimiento ni apertura', () => {
    expect(calculateExpiryEffective({})).toBeNull()
  })

  it('retorna expiry_date si no hay opened_at', () => {
    const date = daysFromNow(10)
    expect(calculateExpiryEffective({ expiry_date: date })).toBe(date)
  })

  it('retorna opened_at + days_after_opening si es anterior a expiry_date', () => {
    const expiry = daysFromNow(20)
    const opened = daysFromNow(0) // hoy
    // hoy + 5 < hoy + 20 → effective = hoy + 5
    const result = calculateExpiryEffective({
      expiry_date: expiry,
      opened_at: opened,
      days_after_opening: 5,
    })
    expect(result).toBe(daysFromNow(5))
  })

  it('retorna expiry_date si es anterior a opened_at + days_after_opening', () => {
    const expiry = daysFromNow(3)
    const opened = daysFromNow(0)
    // hoy + 10 > hoy + 3 → effective = hoy + 3
    const result = calculateExpiryEffective({
      expiry_date: expiry,
      opened_at: opened,
      days_after_opening: 10,
    })
    expect(result).toBe(expiry)
  })

  it('ignora days_after_opening si opened_at es null', () => {
    const expiry = daysFromNow(10)
    expect(calculateExpiryEffective({ expiry_date: expiry, days_after_opening: 3 })).toBe(expiry)
  })
})

// --- calculateExpiryStatus ---

describe('calculateExpiryStatus', () => {
  const N = 3

  it('retorna none si no hay fecha efectiva', () => {
    expect(calculateExpiryStatus({}, N)).toBe('none')
  })

  it('retorna expired si la fecha pasó', () => {
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(-1) }, N)).toBe('expired')
  })

  it('retorna expired si vence hoy', () => {
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(0) }, N)).toBe('expired')
  })

  it('retorna soon si vence dentro de N días exacto', () => {
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(N) }, N)).toBe('soon')
  })

  it('retorna soon si vence dentro de N días (1 día)', () => {
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(1) }, N)).toBe('soon')
  })

  it('retorna ok si vence en más de N días', () => {
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(N + 1) }, N)).toBe('ok')
  })

  it('usa expiry_effective cuando el producto está abierto', () => {
    // opened hoy + 2 días de vida → effective = hoy+2 → soon (N=3)
    const status = calculateExpiryStatus(
      {
        expiry_date: daysFromNow(30),
        opened_at: daysFromNow(0),
        days_after_opening: 2,
      },
      N,
    )
    expect(status).toBe('soon')
  })

  it('respeta N configurable', () => {
    // Con N=7, vence en 5 días → soon
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(5) }, 7)).toBe('soon')
    // Con N=3, vence en 5 días → ok
    expect(calculateExpiryStatus({ expiry_date: daysFromNow(5) }, 3)).toBe('ok')
  })
})

// --- formatExpiryText ---

describe('formatExpiryText', () => {
  it('retorna vacío si no hay fecha', () => {
    expect(formatExpiryText({}, 3)).toBe('')
  })

  it('retorna "Venció hace 1 día" si venció ayer', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(-1) }, 3)).toBe('Venció hace 1 día')
  })

  it('retorna "Venció hace 3 días" si venció hace 3 días', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(-3) }, 3)).toBe('Venció hace 3 días')
  })

  it('retorna "Vence hoy" si vence hoy', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(0) }, 3)).toBe('Vence hoy')
  })

  it('retorna "Vence mañana" si vence mañana', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(1) }, 3)).toBe('Vence mañana')
  })

  it('retorna "Vence en 3 días" si vence en 3 días', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(3) }, 3)).toBe('Vence en 3 días')
  })

  it('retorna "Vence en 10 días" si vence en 10 días', () => {
    expect(formatExpiryText({ expiry_date: daysFromNow(10) }, 3)).toBe('Vence en 10 días')
  })
})
