import { Link } from 'react-router-dom'
import { Clock, TrendingDown } from 'lucide-react'
import { useInventory } from '../../features/inventory/hooks/useInventory'
import { ItemCard } from '../../features/inventory/components/ItemCard'
import { FAB } from '../../components/FAB'
import { es } from '../../i18n/es'
import { calculateExpiryStatus } from '../../lib/expiry'
import { shouldSuggestItem } from '../../lib/shopping'

export function HomePage() {
  const { data: items = [], isLoading } = useInventory()

  // Items que vencen pronto o están vencidos
  const expiringItems = items
    .filter((item) => {
      const status = calculateExpiryStatus({
        expiry_date: item.expiry_date,
        opened_at: item.opened_at,
        days_after_opening: item.days_after_opening,
      }, 3)
      return status === 'soon' || status === 'expired'
    })
    .sort((a, b) => {
      // Expirados primero, luego los más próximos
      const dateA = a.expiry_date || '9999-99-99'
      const dateB = b.expiry_date || '9999-99-99'
      return dateA.localeCompare(dateB)
    })

  // Items que se están acabando
  const runningLowItems = items.filter((item) =>
    shouldSuggestItem({
      tracking_type: item.product.tracking_type,
      level: item.level,
      quantity: item.quantity,
      has_it: item.has_it,
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <header className="pt-2">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Control de Hogar</span>
        <h1 className="text-2xl font-black text-zinc-900">{es.app.name}</h1>
      </header>

      {/* Bloque: Vence pronto */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#23221e] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8c5304]" strokeWidth={2.2} />
            <span>{es.home.expiringSoon}</span>
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#fef8ee] text-[#8c5304] border border-[#f4ddbe]">
            {expiringItems.length}
          </span>
        </div>

        {isLoading ? (
          <div className="text-xs text-zinc-400 py-4">{es.errors.loading}</div>
        ) : expiringItems.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 text-xs font-medium text-zinc-500 text-center">
            {es.home.noExpiringSoon}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {expiringItems.slice(0, 5).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Bloque: Se está acabando */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#23221e] flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#2d5a3f]" strokeWidth={2.2} />
            <span>{es.home.runningLow}</span>
          </h2>
          <Link to="/compras" className="text-xs font-semibold text-[#2d5a3f] hover:underline">
            Ver lista
          </Link>
        </div>

        {isLoading ? (
          <div className="text-xs text-zinc-400 py-4">{es.errors.loading}</div>
        ) : runningLowItems.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 text-xs font-medium text-zinc-500 text-center">
            {es.home.noRunningLow}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {runningLowItems.slice(0, 5).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <FAB to="/agregar" />
    </div>
  )
}
