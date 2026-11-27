import { useState } from 'react'
import { Search, PackageOpen, MapPin, Tag, ShieldAlert, ChevronDown } from 'lucide-react'
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
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#9c9789]" strokeWidth={2} />
        <input
          type="search"
          placeholder={es.inventory.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-[#d6d2c4] bg-white text-base text-[#23221e] placeholder:text-[#9c9789] focus:outline-none focus:ring-2 focus:ring-[#2d5a3f]/20 focus:border-[#2d5a3f] shadow-2xs"
        />
      </div>

      {/* Filtros horizontales scrolleables con iconos y estilo refinado */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {/* Filtro Ubicación */}
        <div className="relative inline-flex items-center">
          <MapPin className="absolute left-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="min-h-[38px] pl-7 pr-8 rounded-xl border border-[#d6d2c4] bg-white font-medium text-[#403e38] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2d5a3f]/20 focus:border-[#2d5a3f] shadow-2xs"
          >
            <option value="all">{es.inventory.filterLocation}: {es.inventory.all}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
        </div>

        {/* Filtro Categoría */}
        <div className="relative inline-flex items-center">
          <Tag className="absolute left-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[38px] pl-7 pr-8 rounded-xl border border-[#d6d2c4] bg-white font-medium text-[#403e38] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2d5a3f]/20 focus:border-[#2d5a3f] shadow-2xs"
          >
            <option value="all">{es.inventory.filterCategory}: {es.inventory.all}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
        </div>

        {/* Filtro Estado */}
        <div className="relative inline-flex items-center">
          <ShieldAlert className="absolute left-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="min-h-[38px] pl-7 pr-8 rounded-xl border border-[#d6d2c4] bg-white font-medium text-[#403e38] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2d5a3f]/20 focus:border-[#2d5a3f] shadow-2xs"
          >
            <option value="all">{es.inventory.filterStatus}: {es.inventory.all}</option>
            <option value="soon">{es.expiry.soon}</option>
            <option value="expired">{es.expiry.expired}</option>
            <option value="ok">{es.expiry.ok}</option>
            <option value="none">{es.expiry.none}</option>
          </select>
          <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-[#848074] pointer-events-none" strokeWidth={2} />
        </div>
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="flex justify-center p-8 text-[#9c9789]">{es.errors.loading}</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-[#dcd8cc] flex flex-col items-center">
          <PackageOpen className="w-10 h-10 text-[#9c9789] mb-2" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#5e5b52]">
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
