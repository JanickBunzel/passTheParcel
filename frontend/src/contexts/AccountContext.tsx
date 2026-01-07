import React, { createContext, useContext, useMemo } from 'react';
import { useAccountQuery, type Account } from '@/api/account.api';

export type AccountContext = {
    account: Account | null | undefined;
    accountLoading: boolean;
    accountError: unknown;
    refetchAccount: () => Promise<unknown>;
};

const AccountContext = createContext<AccountContext | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
    const { data: account, isLoading, isFetching, error, refetch } = useAccountQuery();

    const value = useMemo<AccountContext>(
        () => ({
            account,
            accountLoading: isLoading || isFetching,
            accountError: error,
            refetchAccount: () => refetch(),
        }),
        [account, isLoading, isFetching, error, refetch]
    );

    return <AccountContext.Provider value={value} children={children} />;
}

export function useAccount() {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
}
