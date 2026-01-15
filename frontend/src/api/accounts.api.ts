import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import type { AccountRow } from '@/lib/types';

export async function fetchAllAccounts(): Promise<AccountRow[]> {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
    return data ?? [];
}

export function useAccountsQuery() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAllAccounts,
    });
}
