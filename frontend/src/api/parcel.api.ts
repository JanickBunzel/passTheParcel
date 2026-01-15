import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAccount } from '@/contexts/AccountContext';
import type { ParcelRow } from '@/lib/types';

async function fetchParcelById(id: string): Promise<ParcelRow> {
    const { data, error } = await supabase.from('parcels').select('*').eq('id', id).single();

    if (error) {
        console.error('Error fetching parcels:', error);
        throw error;
    }

    if (!data) {
        throw new Error('Parcel not found');
    }

    return data;
}

export function useParcelByIdQuery(id: string) {
    return useQuery({
        queryKey: ['parcels', id],
        enabled: !!id,
        queryFn: () => fetchParcelById(id),
    });
}
