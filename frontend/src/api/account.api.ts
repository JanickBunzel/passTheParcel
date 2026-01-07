import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

export type Account = Database['public']['Tables']['accounts']['Row'];

async function fetchAccount(userId: string): Promise<Account | null> {
    const { data, error } = await supabase.from('accounts').select('*').eq('id', userId).single();

    if (error) {
        console.error('Error fetching account:', error);
        throw error;
    }

    return data;
}

export function useAccountQuery() {
    const userId = useAuth().user?.id;

    return useQuery({
        queryKey: ['account', userId],
        enabled: !!userId,
        queryFn: () => fetchAccount(userId as string),
        staleTime: 60 * 1000 * 5, // 5 minutes
        gcTime: 60 * 1000 * 30, // 30 minutes
    });
}
