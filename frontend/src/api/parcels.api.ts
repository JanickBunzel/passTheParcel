import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAccount } from '@/contexts/AccountContext';
import type { OrderInsert, ParcelInsert, ParcelRow } from '@/lib/types';

async function fetchAllParcels(): Promise<ParcelRow[]> {
    const { data, error } = await supabase.from('parcels').select('*');

    if (error) {
        console.error('Error fetching parcels:', error);
        throw error;
    }

    return data ?? [];
}

export function useAllParcelsQuery() {
    const { account } = useAccount();

    return useQuery({
        queryKey: ['parcels'],
        enabled: !!account,
        queryFn: fetchAllParcels,
    });
}

// Create parcel and initial order in a single mutation
async function createParcelAndOrder({ parcel, order }: { parcel: ParcelInsert; order: OrderInsert }) {
    const { supabase } = await import('@/lib/supabaseClient');
    const { data: newParcel, error: parcelError } = await supabase.from('parcels').insert(parcel).select().single();
    if (parcelError || !newParcel) throw parcelError || new Error('Parcel creation failed');

    const orderPayload = { ...order, parcel: newParcel.id };
    const { error: orderError } = await supabase.from('orders').insert(orderPayload);
    if (orderError) throw orderError;
    return newParcel;
}

export function useCreateParcelAndOrderMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createParcelAndOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parcels'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'available'] });
        },
    });
}
