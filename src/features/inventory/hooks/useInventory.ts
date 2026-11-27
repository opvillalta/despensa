import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/hooks/useAuth'
import type { Database } from '../../../lib/database.types'
import { shouldSuggestItem } from '../../../lib/shopping'

export type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row']
export type ProductRow = Database['public']['Tables']['products']['Row']
export type LocationRow = Database['public']['Tables']['locations']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']

export interface InventoryItemWithDetails extends InventoryItemRow {
  product: ProductRow
  location: LocationRow | null
}

export function useInventory() {
  const { householdId } = useAuth()

  return useQuery({
    queryKey: ['inventory', householdId],
    queryFn: async (): Promise<InventoryItemWithDetails[]> => {
      if (!householdId) return []

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          product:products(*),
          location:locations(*)
        `)
        .eq('household_id', householdId)
        .eq('status', 'active')
        .order('expiry_date', { ascending: true, nullsFirst: false })

      if (error) throw error
      return (data as unknown as InventoryItemWithDetails[]) || []
    },
    enabled: !!householdId,
  })
}

export function useLocations() {
  const { householdId } = useAuth()
  return useQuery({
    queryKey: ['locations', householdId],
    queryFn: async () => {
      if (!householdId) return []
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('household_id', householdId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!householdId,
  })
}

export function useCategories() {
  const { householdId } = useAuth()
  return useQuery({
    queryKey: ['categories', householdId],
    queryFn: async () => {
      if (!householdId) return []
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('household_id', householdId)
        .order('name', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!householdId,
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  const { householdId } = useAuth()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      itemContext,
    }: {
      id: string
      updates: Partial<Database['public']['Tables']['inventory_items']['Update']>
      itemContext?: { name: string; tracking_type: 'units' | 'level' | 'presence'; product_id: string }
    }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Si se redujo el stock (low, empty, 0 o false), sugerir en lista de compras
      if (householdId && itemContext) {
        const checkItem = {
          tracking_type: itemContext.tracking_type,
          level: updates.level !== undefined ? updates.level : data.level,
          quantity: updates.quantity !== undefined ? updates.quantity : data.quantity,
          has_it: updates.has_it !== undefined ? updates.has_it : data.has_it,
        }

        if (shouldSuggestItem(checkItem)) {
          // Agregar a shopping_list_items evitando duplicar
          const { data: existing } = await supabase
            .from('shopping_list_items')
            .select('id')
            .eq('household_id', householdId)
            .eq('name', itemContext.name)
            .eq('checked', false)
            .maybeSingle()

          if (!existing) {
            await supabase.from('shopping_list_items').insert({
              household_id: householdId,
              product_id: itemContext.product_id,
              name: itemContext.name,
              checked: false,
            })
            queryClient.invalidateQueries({ queryKey: ['shopping', householdId] })
          }
        }
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', householdId] })
    },
  })
}
