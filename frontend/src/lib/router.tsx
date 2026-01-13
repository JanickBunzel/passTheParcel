import {
    createRootRouteWithContext,
    createRoute,
    createRouter,
    Navigate,
    Outlet,
    redirect,
} from '@tanstack/react-router';
import type { AuthContext } from '@/contexts/AuthContext';
import type { AccountContext } from '@/contexts/AccountContext';

import Login from '@/pages/Login';
import MyParcels from '@/pages/MyParcels';
import Profile from '@/pages/Profile';
import Delivery from '@/pages/Delivery';
import Orders from '@/pages/Orders';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Map from '@/pages/Map';

export type RouterContext = {
    auth: AuthContext;
    account: AccountContext;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: Outlet,
    notFoundComponent: () => <Navigate to="/" replace />,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
    beforeLoad: ({ context }) => {
        if (context.auth.authLoading || context.account.accountLoading) return;

        if (context.auth.user && context.account.account) {
            throw redirect({ to: '/', replace: true });
        }
    },
});

// Auth check
const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    beforeLoad: ({ context }) => {
        if (context.auth.authLoading) return;
        if (!context.auth.user) throw redirect({ to: '/login' });
    },
    component: AuthenticatedLayout,
});

// Account check
const indexRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/',
    beforeLoad: ({ context }) => {
        if (context.account.accountLoading) return;

        if (!context.account.account) throw redirect({ to: '/login' });
    },
    component: MyParcels,
});

// Routes
const pages = [
    { path: 'orders', component: Orders },
    { path: 'delivery', component: Delivery },
    { path: 'myParcels', component: MyParcels },
    { path: 'profile', component: Profile },
    { path: 'map', component: Map },
] as const;

// Router
const routeTree = rootRoute.addChildren([
    loginRoute,
    authenticatedRoute.addChildren([
        indexRoute,
        ...pages.map(({ path, component }) =>
            createRoute({
                getParentRoute: () => authenticatedRoute,
                path,
                component,
            })
        ),
    ]),
]);

export const router = createRouter({
    routeTree,
    context: null as unknown as RouterContext,
    defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
