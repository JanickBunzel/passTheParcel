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
import Home from '@/pages/Home';
import Paket from '@/pages/Paket';

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
    component: Outlet,
});

// Account check
const indexRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/',
    beforeLoad: ({ context }) => {
        if (context.account.accountLoading) return;

        if (!context.account.account) throw redirect({ to: '/login' });
    },
    component: Home,
});

// Routes
const pages = [{ path: 'paket', component: Paket }] as const;

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
