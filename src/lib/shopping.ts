export type TrackingType = 'units' | 'level' | 'presence'
export type Level = 'full' | 'half' | 'low' | 'empty'

export interface SuggestableItem {
  tracking_type: TrackingType
  level?: Level | null
  quantity?: number | null
  has_it?: boolean | null
}

/**
 * Determina si un ítem debe sugerirse en la lista de compras.
 * - level: low o empty → true
 * - units: quantity <= 1 → true (si queda 1 o 0, se considera que se está acabando)
 * - presence: has_it === false → true
 */
export function shouldSuggestItem(item: SuggestableItem): boolean {
  switch (item.tracking_type) {
    case 'level':
      return item.level === 'low' || item.level === 'empty'
    case 'units':
      return typeof item.quantity === 'number' && item.quantity <= 1
    case 'presence':
      return item.has_it === false
    default:
      return false
  }
}

/** Etiqueta legible para el nivel */
export function levelLabel(level: Level | null | undefined): string {
  switch (level) {
    case 'full': return 'Lleno'
    case 'half': return 'Mitad'
    case 'low': return 'Poco'
    case 'empty': return 'Vacío'
    default: return '—'
  }
}

/** Orden numérico del nivel (para ordenar listas) */
export function levelOrder(level: Level | null | undefined): number {
  switch (level) {
    case 'empty': return 0
    case 'low': return 1
    case 'half': return 2
    case 'full': return 3
    default: return 4
  }
}
