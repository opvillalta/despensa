import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/hooks/useAuth'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { es } from '../../../i18n/es'
import type { Database } from '../../../lib/database.types'

type ShoppingItem = Database['public']['Tables']['shopping_list_items']['Row']

export function ShoppingPage() {
  const { householdId } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newItemName, setNewItemName] = useState('')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopping', householdId],
    queryFn: async (): Promise<ShoppingItem[]> => {
      if (!householdId) return []
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('household_id', householdId)
        .order('checked', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!householdId,
  })

  // Mutación: Alternar checked
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ checked })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', householdId] })
    },
  })

  // Mutación: Agregar item manual
  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!householdId) {
        throw new Error('No se encontró un hogar asignado a tu usuario. Intentá recargar la página.')
      }
      const { error } = await supabase.from('shopping_list_items').insert({
        household_id: householdId,
        name: name.trim(),
        checked: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setNewItemName('')
      queryClient.invalidateQueries({ queryKey: ['shopping', householdId] })
    },
  })

  // Mutación: Limpiar comprados
  const clearCheckedMutation = useMutation({
    mutationFn: async () => {
      if (!householdId) return
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('household_id', householdId)
        .eq('checked', true)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', householdId] })
    },
  })

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return
    addItemMutation.mutate(newItemName)
  }

  const hasChecked = items.some((i) => i.checked)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-zinc-900">{es.shopping.title}</h1>
        {hasChecked && (
          <button
            type="button"
            onClick={() => clearCheckedMutation.mutate()}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            {es.shopping.clear}
          </button>
        )}
      </header>

      {/* Agregar manual */}
      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ej: Manteca, Café…"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newItemName.trim() || addItemMutation.isPending}>
            {addItemMutation.isPending ? '...' : es.actions.add}
          </Button>
        </div>
        {addItemMutation.isError && (
          <div className="p-2.5 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {addItemMutation.error instanceof Error
              ? addItemMutation.error.message
              : 'Error al agregar producto'}
          </div>
        )}
      </form>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-8 text-zinc-400">{es.errors.loading}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-zinc-300">
          <span className="text-4xl block mb-2">🛒</span>
          <p className="text-sm font-medium text-zinc-600">{es.shopping.empty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                item.checked
                  ? 'bg-zinc-100/70 border-zinc-200 text-zinc-400'
                  : 'bg-white border-zinc-200/90 text-zinc-800 shadow-2xs'
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) =>
                    toggleItemMutation.mutate({ id: item.id, checked: e.target.checked })
                  }
                  className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer"
                />
                <span className={`text-sm font-medium ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </span>
              </label>

              {/* Si está marcado como comprado, botón directo para registrarlo en el inventario */}
              {item.checked && (
                <button
                  type="button"
                  onClick={() => navigate(`/agregar?name=${encodeURIComponent(item.name)}`)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                  📥 Guardar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
