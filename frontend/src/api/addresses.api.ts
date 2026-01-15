import { supabase } from '@/lib/supabaseClient';
import type { AddressRow } from '@/lib/types';

import { useQuery } from '@tanstack/react-query';

export async function fetchAllAddresses(): Promise<AddressRow[]> {
    const { data, error } = await supabase.from('addresses').select('*');
    if (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
    return data ?? [];
}

export function useAddressesQuery() {
    return useQuery({
        queryKey: ['addresses'],
        queryFn: fetchAllAddresses,
    });
}
