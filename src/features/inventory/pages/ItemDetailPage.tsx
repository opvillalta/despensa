import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FolderOpen, CheckCircle, Trash2, MapPin } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/hooks/useAuth'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { calculateExpiryStatus, formatExpiryText } from '../../../lib/expiry'
import { es } from '../../../i18n/es'
import type { InventoryItemWithDetails } from '../hooks/useInventory'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { householdId, user } = useAuth()
  const [confirmAction, setConfirmAction] = useState<'consumed' | 'discarded' | null>(null)

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: async (): Promise<InventoryItemWithDetails> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          product:products(*),
          location:locations(*)
        `)
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as unknown as InventoryItemWithDetails
    },
    enabled: !!id,
  })

  // Mutación para cambiar status (consumed / discarded) y registrar evento
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'consumed' | 'discarded') => {
      if (!item || !householdId) return

      const { error: updateErr } = await supabase
        .from('inventory_items')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (updateErr) throw updateErr

      // Registrar en item_events
      await supabase.from('item_events').insert({
        household_id: householdId,
        item_id: item.id,
        type: newStatus,
        user_id: user?.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', householdId] })
      navigate('/inventario')
    },
  })

  // Mutación para marcar abierto
  const markOpenedMutation = useMutation({
    mutationFn: async () => {
      if (!item || !householdId) return
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('inventory_items')
        .update({ opened_at: today })
        .eq('id', item.id)

      if (error) throw error

      await supabase.from('item_events').insert({
        household_id: householdId,
        item_id: item.id,
        type: 'opened',
        user_id: user?.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory', householdId] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-zinc-400">{es.errors.loading}</div>
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600">{es.errors.notFound}</p>
        <Button onClick={() => navigate('/inventario')} className="mt-4">
          {es.actions.back}
        </Button>
      </div>
    )
  }

  const expiryStatus = calculateExpiryStatus(
    {
      expiry_date: item.expiry_date,
      opened_at: item.opened_at,
      days_after_opening: item.days_after_opening,
    },
    3
  )

  const expiryText = formatExpiryText(
    {
      expiry_date: item.expiry_date,
      opened_at: item.opened_at,
      days_after_opening: item.days_after_opening,
    },
    3
  )

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          ← {es.actions.back}
        </button>
        {expiryStatus !== 'none' && <Badge status={expiryStatus} label={expiryText} />}
      </header>

      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{item.product.name}</h1>
          <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#848074]" strokeWidth={2} />
            <span>{item.location?.name || 'Sin ubicación'}</span>
          </p>
        </div>

        {/* Detalles de fechas */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl text-xs">
          <div>
            <span className="text-zinc-400 block">{es.detail.expiresOn}</span>
            <span className="font-semibold text-zinc-800">{item.expiry_date || '—'}</span>
          </div>
          <div>
            <span className="text-zinc-400 block">{es.detail.purchasedOn}</span>
            <span className="font-semibold text-zinc-800">{item.purchased_at || '—'}</span>
          </div>
          <div>
            <span className="text-zinc-400 block">{es.detail.openedOn}</span>
            <span className="font-semibold text-zinc-800">{item.opened_at || 'No abierto'}</span>
          </div>
          {item.days_after_opening && (
            <div>
              <span className="text-zinc-400 block">Días tras abrir</span>
              <span className="font-semibold text-zinc-800">{item.days_after_opening} días</span>
            </div>
          )}
        </div>

        {/* Notas */}
        {item.notes && (
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50 text-xs text-amber-900">
            <span className="font-bold block mb-1">Notas:</span>
            {item.notes}
          </div>
        )}

        {/* Botón Marcar Abierto si aún no se abrió */}
        {!item.opened_at && (
          <Button
            variant="secondary"
            onClick={() => markOpenedMutation.mutate()}
            disabled={markOpenedMutation.isPending}
            className="w-full flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-4 h-4" strokeWidth={2} />
            <span>{es.detail.markOpened}</span>
          </Button>
        )}
      </div>

      {/* Acciones de Ciclo de Vida: Consumido / Desechado */}
      <div className="bg-white p-5 rounded-2xl border border-[#e9e6dc] shadow-xs flex flex-col gap-3">
        <h2 className="text-sm font-bold text-[#5e5b52]">Acciones</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            onClick={() => setConfirmAction('consumed')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={2} />
            <span>{es.detail.markConsumed}</span>
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmAction('discarded')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            <span>{es.detail.markDiscarded}</span>
          </Button>
        </div>
      </div>

      {/* Modal / Dialog de confirmación simple */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold text-zinc-800">
              {confirmAction === 'consumed'
                ? es.detail.confirmConsumed
                : es.detail.confirmDiscarded}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmAction(null)}
                className="flex-1"
              >
                {es.detail.cancel}
              </Button>
              <Button
                variant={confirmAction === 'consumed' ? 'primary' : 'danger'}
                onClick={() => {
                  updateStatusMutation.mutate(confirmAction)
                  setConfirmAction(null)
                }}
                className="flex-1"
              >
                {es.detail.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
