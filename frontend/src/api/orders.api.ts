import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { OrderRow } from '@/lib/types';

// Fetch available orders (owner is null)
async function fetchAvailableOrders(): Promise<OrderRow[]> {
    const { data, error } = await supabase.from('orders').select('*').is('owner', null);
    if (error) throw error;
    return data ?? [];
}

// Add to cart (claim order)
async function claimOrder({ orderId, userId }: { orderId: string; userId: string }) {
    const startedAt = new Date().toISOString();
    const { error } = await supabase.from('orders').update({ owner: userId, started: startedAt }).eq('id', orderId);
    if (error) throw error;
    return true;
}

export function useAvailableOrdersQuery() {
    return useQuery<OrderRow[]>({
        queryKey: ['orders', 'available'],
        queryFn: fetchAvailableOrders,
    });
}

export function useClaimOrderMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: claimOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
        },
    });
}
