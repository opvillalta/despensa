import { useState } from 'react'
import { useInventory, useLocations, useCategories } from '../hooks/useInventory'
import { ItemCard } from '../components/ItemCard'
import { FAB } from '../../../components/FAB'
import { es } from '../../../i18n/es'
import { calculateExpiryStatus } from '../../../lib/expiry'

export function InventoryPage() {
  const { data: items = [], isLoading } = useInventory()
  const { data: locations = [] } = useLocations()
  const { data: categories = [] } = useCategories()

  const [search, setSearch] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredItems = items.filter((item) => {
    // Buscador
    if (search && !item.product.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Filtro Ubicación
    if (selectedLocation !== 'all' && item.location_id !== selectedLocation) {
      return false
    }
    // Filtro Categoría
    if (selectedCategory !== 'all' && item.product.category_id !== selectedCategory) {
      return false
    }
    // Filtro Estado Vencimiento
    if (selectedStatus !== 'all') {
      const status = calculateExpiryStatus({
        expiry_date: item.expiry_date,
        opened_at: item.opened_at,
        days_after_opening: item.days_after_opening,
      }, 3)
      if (status !== selectedStatus) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-zinc-900">{es.inventory.title}</h1>
        <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-200 text-zinc-700 rounded-full">
          {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'}
        </span>
      </header>

      {/* Buscador */}
      <div className="relative">
        <span className="absolute left-3.5 top-3 text-zinc-400">🔍</span>
        <input
          type="search"
          placeholder={es.inventory.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-base placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
        />
      </div>

      {/* Filtros horizontales scrolleables */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="min-h-[36px] px-3 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700"
        >
          <option value="all">{es.inventory.filterLocation}: {es.inventory.all}</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.icon || '📍'} {loc.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="min-h-[36px] px-3 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700"
        >
          <option value="all">{es.inventory.filterCategory}: {es.inventory.all}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="min-h-[36px] px-3 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-700"
        >
          <option value="all">{es.inventory.filterStatus}: {es.inventory.all}</option>
          <option value="soon">⚠️ {es.expiry.soon}</option>
          <option value="expired">🔴 {es.expiry.expired}</option>
          <option value="ok">🟢 {es.expiry.ok}</option>
          <option value="none">⚪ {es.expiry.none}</option>
        </select>
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="flex justify-center p-8 text-zinc-400">{es.errors.loading}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-zinc-300">
          <span className="text-4xl block mb-2">🥣</span>
          <p className="text-sm font-medium text-zinc-600">
            {items.length === 0 ? es.inventory.empty : es.inventory.emptyFiltered}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <FAB to="/agregar" />
    </div>
  )
}
