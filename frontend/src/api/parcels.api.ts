import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAccount } from '@/contexts/AccountContext';
import type { ParcelRow } from '@/lib/types';

async function fetchMyParcels(): Promise<ParcelRow[]> {
    const { data, error } = await supabase.from('parcels').select('*');

    if (error) {
        console.error('Error fetching parcels:', error);
        throw error;
    }

    return data ?? [];
}

export function useParcelsQuery() {
    const { account } = useAccount();

    return useQuery({
        queryKey: ['parcels'],
        enabled: !!account,
        queryFn: fetchMyParcels,
    });
}
