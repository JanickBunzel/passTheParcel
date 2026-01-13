import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AccountProvider, useAccount } from '@/contexts/AccountContext';
import '@/index.css';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './lib/router';
import { Toaster } from 'sonner';

const SHOW_DEVTOOLS = false;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 2, // 2 minutes
        },
    },
});

const AppRouter = () => {
    const auth = useAuth();
    const account = useAccount();

    return <RouterProvider router={router} context={{ auth, account }} />;
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AccountProvider>
                    <AppRouter />
                </AccountProvider>
            </AuthProvider>

            {SHOW_DEVTOOLS && <ReactQueryDevtools buttonPosition="bottom-right" />}
            <Toaster position="bottom-right" />
        </QueryClientProvider>
    </StrictMode>
);
