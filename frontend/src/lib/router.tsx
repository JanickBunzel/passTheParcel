import {
    RouterProvider,
    createRootRouteWithContext,
    createRoute,
    createRouter,
    Outlet,
    redirect,
    Navigate,
} from '@tanstack/react-router';
import { supabase } from '@/lib/supabaseClient';
import { AuthLayout } from '@/layout/AuthLayout';
import { Login } from '@/pages/Login';
import Home from '@/pages/Home';

export type RouterContext = {
    supabase: typeof supabase;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: Outlet,
    notFoundComponent: () => <Navigate to="/" replace />,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
});

const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    component: AuthLayout,
    beforeLoad: async ({ context }) => {
        const { data, error } = await context.supabase.auth.getSession();

        if (error) {
            console.error('Error getting session in beforeLoad', error);
            throw redirect({ to: '/login' });
        }

        if (!data.session) throw redirect({ to: '/login' });

        return {};
    },
});

const homeRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/',
    component: Home,
});

const routeTree = rootRoute.addChildren([loginRoute, authenticatedRoute.addChildren([homeRoute])]);

export const router = createRouter({
    routeTree,
    context: { supabase },
    defaultPreload: 'intent',
    notFoundMode: 'root',
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export function AppRouter() {
    return <RouterProvider router={router} />;
}
