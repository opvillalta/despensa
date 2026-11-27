import { Link } from 'react-router-dom'
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
    <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col gap-3 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/item/${item.id}`} className="flex-1 group">
          <h2 className="font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors">
            {item.product.name}
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
            {item.location && (
              <span className="flex items-center gap-1">
                <span>{item.location.icon || '📍'}</span>
                <span>{item.location.name}</span>
              </span>
            )}
            {item.opened_at && <span className="text-amber-700 font-medium">Abierto</span>}
          </div>
        </Link>
        {expiryStatus !== 'none' && (
          <Badge status={expiryStatus} label={expiryText} />
        )}
      </div>

      {/* Control Rápido de Stock según tracking_type */}
      <div className="pt-1 border-t border-zinc-100 flex items-center justify-between">
        {item.product.tracking_type === 'level' && (
          <LevelSelector
            value={item.level}
            onChange={handleLevelChange}
            disabled={updateItem.isPending}
          />
        )}

        {item.product.tracking_type === 'units' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-zinc-600">Unidades:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 font-bold active:scale-95 text-zinc-700 hover:bg-zinc-100"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-zinc-900">{item.quantity ?? 0}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 font-bold active:scale-95 text-zinc-700 hover:bg-zinc-100"
              >
                +
              </button>
            </div>
          </div>
        )}

        {item.product.tracking_type === 'presence' && (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-zinc-600">Disponibilidad:</span>
            <button
              type="button"
              onClick={handlePresenceToggle}
              className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold border transition-all ${
                item.has_it
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              }`}
            >
              {item.has_it ? '✅ Tengo' : '❌ No tengo'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
