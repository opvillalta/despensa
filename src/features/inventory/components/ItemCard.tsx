import { Link } from 'react-router-dom'
import { MapPin, Check, X, Minus, Plus } from 'lucide-react'
import type { InventoryItemWithDetails } from '../hooks/useInventory'
import { Badge } from '../../../components/Badge'
import { LevelSelector } from '../../../components/LevelSelector'
import { calculateExpiryStatus, formatExpiryText } from '../../../lib/expiry'
import { useUpdateItem } from '../hooks/useInventory'
import type { Level } from '../../../lib/shopping'

interface ItemCardProps {
  item: InventoryItemWithDetails
  warningDays?: number
}

export function ItemCard({ item, warningDays = 3 }: ItemCardProps) {
  const updateItem = useUpdateItem()

  const expiryStatus = calculateExpiryStatus(
    {
      expiry_date: item.expiry_date,
      opened_at: item.opened_at,
      days_after_opening: item.days_after_opening,
    },
    warningDays
  )

  const expiryText = formatExpiryText(
    {
      expiry_date: item.expiry_date,
      opened_at: item.opened_at,
      days_after_opening: item.days_after_opening,
    },
    warningDays
  )

  function handleLevelChange(newLevel: Level) {
    updateItem.mutate({
      id: item.id,
      updates: { level: newLevel },
      itemContext: {
        name: item.product.name,
        tracking_type: item.product.tracking_type,
        product_id: item.product_id,
      },
    })
  }

  function handleQuantityChange(delta: number) {
    const current = item.quantity ?? 0
    const next = Math.max(0, current + delta)
    updateItem.mutate({
      id: item.id,
      updates: { quantity: next },
      itemContext: {
        name: item.product.name,
        tracking_type: item.product.tracking_type,
        product_id: item.product_id,
      },
    })
  }

  function handlePresenceToggle() {
    const next = !item.has_it
    updateItem.mutate({
      id: item.id,
      updates: { has_it: next },
      itemContext: {
        name: item.product.name,
        tracking_type: item.product.tracking_type,
        product_id: item.product_id,
      },
    })
  }

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs flex flex-col gap-3 transition-[box-shadow,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-sm hover:border-border/80">
      {/* Header del producto */}
      <div className="flex items-start justify-between gap-2">
        <Link to={`/item/${item.id}`} className="group flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
            {item.product.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                <span>{item.location.name}</span>
              </span>
            )}
            {item.opened_at && <span className="text-amber-700 font-medium">Abierto</span>}
          </div>
        </Link>
        <Badge status={expiryStatus} label={expiryText} />
      </div>

      {/* Controles según tipo de tracking */}
      <div className="pt-2 border-t border-muted flex items-center justify-between gap-3">
        {item.product.tracking_type === 'level' && (
          <LevelSelector
            value={item.level}
            onChange={handleLevelChange}
            disabled={updateItem.isPending}
          />
        )}

        {item.product.tracking_type === 'units' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-muted-foreground">Unidades:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:scale-[0.92] hover:bg-sky-100 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-4 h-4" strokeWidth={2.2} />
              </button>
              <span className="w-8 text-center font-bold text-foreground tabular-nums">{item.quantity ?? 0}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:scale-[0.92] hover:bg-sky-100 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}

        {item.product.tracking_type === 'presence' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-muted-foreground">Disponibilidad:</span>
            <button
              type="button"
              onClick={handlePresenceToggle}
              className={`min-h-[38px] px-3.5 flex items-center gap-1.5 rounded-xl text-xs font-semibold border active:scale-[0.96] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                item.has_it
                  ? 'bg-accent text-accent-foreground border-emerald-200'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {item.has_it ? (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Tengo</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>No tengo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
