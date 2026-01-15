import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { OrderRow } from '@/lib/types';

// Fetch orders for current user
async function fetchDeliveryOrders(userId: string): Promise<OrderRow[]> {
    const { data, error } = await supabase.from('orders').select('*').eq('owner', userId);
    if (error) throw error;
    return data ?? [];
}

// Mark order as delivered
async function markOrderDelivered({ orderId, parcelId }: { orderId: string; parcelId: string }) {
    const finishedAt = new Date().toISOString();
    const { error: orderError } = await supabase.from('orders').update({ finished: finishedAt }).eq('id', orderId);
    if (orderError) throw orderError;
    const { error: parcelError } = await supabase.from('parcels').update({ status: 'DELIVERED' }).eq('id', parcelId);
    if (parcelError) throw parcelError;
    return true;
}

export function useDeliveryOrdersQuery(userId: string | null) {
    return useQuery<OrderRow[]>({
        queryKey: ['orders', 'delivery', userId],
        queryFn: () => (userId ? fetchDeliveryOrders(userId) : Promise.resolve([])),
        enabled: !!userId,
    });
}

export function useMarkOrderDeliveredMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markOrderDelivered,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', 'delivery'] });
        },
    });
}
