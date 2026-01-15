import { useEffect } from 'react';
import { Outlet, useRouter } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import TopBar from './TopBar';

const AuthenticatedLayout = () => {
    const router = useRouter();
    const { user, authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            void router.navigate({ to: '/login' });
        }
    }, [authLoading, user, router]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-gray-600">Loading Session...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="sticky top-0 w-full z-50">
                <TopBar />
            </div>

            <main className="flex-1 min-h-0 overflow-scroll pb-20">
                <Outlet />
            </main>

            <div className="fixed bottom-0 left-0 right-0 w-full z-50 h-20">
                <Navbar />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
