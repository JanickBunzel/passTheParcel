import { useEffect } from 'react';
import { Outlet, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

export function AuthLayout() {
    const { user, authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            void router.navigate({ to: '/login' });
        }
    }, [authLoading, user, router]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-gray-600">Lade Session...</p>
            </div>
        );
    }

    return <Outlet />;
}
