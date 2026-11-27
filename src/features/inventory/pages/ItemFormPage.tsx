import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/hooks/useAuth'
import { useLocations, useCategories } from '../hooks/useInventory'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Select } from '../../../components/Select'
import { LevelSelector } from '../../../components/LevelSelector'
import { es } from '../../../i18n/es'
import type { TrackingType, Level } from '../../../lib/shopping'

export function ItemFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { householdId, user } = useAuth()
  const { data: locations = [] } = useLocations()
  const { data: categories = [] } = useCategories()

  // Form states
  const [name, setName] = useState('')
  const [locationId, setLocationId] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [trackingType, setTrackingType] = useState<TrackingType>('level')
  const [level, setLevel] = useState<Level>('full')
  const [quantity, setQuantity] = useState<number>(1)
  const [hasIt, setHasIt] = useState<boolean>(true)

  // Advanced collapsed
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [purchasedAt, setPurchasedAt] = useState('')
  const [openedAt, setOpenedAt] = useState('')
  const [daysAfterOpening, setDaysAfterOpening] = useState<string>('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Al seleccionar categoría, sugerir shelf life si no hay expiryDate
  function handleCategoryChange(catId: string) {
    setCategoryId(catId)
    const cat = categories.find((c) => c.id === catId)
    if (cat) {
      if (cat.default_tracking_type) {
        setTrackingType(cat.default_tracking_type)
      }
      if (cat.default_shelf_life_days && !expiryDate) {
        const d = new Date()
        d.setDate(d.getDate() + cat.default_shelf_life_days)
        setExpiryDate(d.toISOString().split('T')[0])
      }
      if (cat.default_days_after_opening) {
        setDaysAfterOpening(String(cat.default_days_after_opening))
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(es.form.errors.nameRequired)
      return
    }
    if (!householdId) {
      setError('Falta el hogar asignado al usuario')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // 1. Obtener o crear producto en el catálogo del hogar
      let productId: string
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('household_id', householdId)
        .eq('name', name.trim())
        .maybeSingle()

      if (existingProd) {
        productId = existingProd.id
      } else {
        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert({
            household_id: householdId,
            name: name.trim(),
            category_id: categoryId || null,
            tracking_type: trackingType,
            default_location_id: locationId || null,
          })
          .select('id')
          .single()

        if (prodErr) throw prodErr
        productId = newProd.id
      }

      // 2. Insertar item de inventario
      const { error: itemErr } = await supabase.from('inventory_items').insert({
        household_id: householdId,
        product_id: productId,
        location_id: locationId || null,
        expiry_date: expiryDate || null,
        purchased_at: purchasedAt || null,
        opened_at: openedAt || null,
        days_after_opening: daysAfterOpening ? Number(daysAfterOpening) : null,
        quantity: trackingType === 'units' ? quantity : null,
        level: trackingType === 'level' ? level : null,
        has_it: trackingType === 'presence' ? hasIt : null,
        notes: notes.trim() || null,
        status: 'active',
        created_by: user?.id,
      })

      if (itemErr) throw itemErr

      queryClient.invalidateQueries({ queryKey: ['inventory', householdId] })
      navigate('/inventario')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : es.errors.generic
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-zinc-900">{es.form.addTitle}</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          {es.actions.cancel}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {/* Nombre con autocompletado nativo */}
        <Input
          label={es.form.name}
          placeholder={es.form.namePlaceholder}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Ubicación */}
        <Select
          label={es.form.location}
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={[
            { value: '', label: 'Seleccionar ubicación…' },
            ...locations.map((loc) => ({
              value: loc.id,
              label: `${loc.icon || '📍'} ${loc.name}`,
            })),
          ]}
        />

        {/* Fecha de vencimiento */}
        <Input
          type="date"
          label={es.form.expiryDate}
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        {/* Tracking Type Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Tipo de seguimiento</label>
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
            {(['level', 'units', 'presence'] as TrackingType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrackingType(t)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  trackingType === t
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {es.tracking[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Control del Tracking seleccionado */}
        {trackingType === 'level' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">{es.form.level}</label>
            <LevelSelector value={level} onChange={(lvl) => setLevel(lvl)} />
          </div>
        )}

        {trackingType === 'units' && (
          <Input
            type="number"
            min={0}
            label={es.form.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
          />
        )}

        {trackingType === 'presence' && (
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span className="text-sm font-medium text-zinc-700">¿Lo tenés en casa?</span>
            <button
              type="button"
              onClick={() => setHasIt(!hasIt)}
              className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold border transition-all ${
                hasIt
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              }`}
            >
              {hasIt ? es.presence.has : es.presence.hasNot}
            </button>
          </div>
        )}

        {/* Sección Avanzada Colapsada */}
        <div className="border-t border-zinc-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <span>⚙️ {es.form.advanced}</span>
            <span>{showAdvanced ? '▲' : '▼'}</span>
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3.5 mt-3 pt-2">
              <Select
                label={es.form.category}
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={[
                  { value: '', label: 'Sin categoría' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <Input
                type="date"
                label={es.form.purchasedAt}
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
              />

              <Input
                type="date"
                label={es.form.openedAt}
                value={openedAt}
                onChange={(e) => setOpenedAt(e.target.value)}
              />

              <Input
                type="number"
                min={1}
                label={es.form.daysAfterOpening}
                placeholder="Ej: 5"
                value={daysAfterOpening}
                onChange={(e) => setDaysAfterOpening(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">{es.form.notes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones opcionales…"
                  className="w-full px-3.5 py-2 text-base rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full mt-2">
          {submitting ? es.errors.loading : es.form.save}
        </Button>
      </form>
    </div>
  )
}
