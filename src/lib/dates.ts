// Lógica de fechas — sin dependencias externas, testeable
// Usamos strings ISO 'YYYY-MM-DD' para evitar problemas de timezone

export function parseDate(dateStr: string): Date {
  // Parsear como fecha local (no UTC) para evitar off-by-one por timezone
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Diferencia en días completos: positivo = dateB está en el futuro.
 * Ambas fechas DEBEN estar normalizadas a midnight (hora 00:00:00) del día local
 * para evitar off-by-one por timezone o DST.
 */
export function daysDiff(dateA: Date, dateB: Date): number {
  // Normalizar ambas fechas a midnight UTC para comparación limpia
  const a = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate())
  const b = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate())
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}
