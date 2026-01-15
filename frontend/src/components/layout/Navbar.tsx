import { Link, useRouter } from '@tanstack/react-router';
import { Map, Package, Route, ScrollText, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';

const navBarItems: NavBarItem[] = [
    { path: '/map', name: 'Map', icon: Map },
    { path: '/orders', name: 'Orders', icon: ScrollText },
    { path: '/', name: 'My Parcels', icon: Package },
    { path: '/delivery', name: 'My Deliveries', icon: Route },
];

type NavBarItem = {
    path: string;
    name: string;
    icon: LucideIcon;
};

const Navbar = () => {
    const router = useRouter();
    const [currentPath, setCurrentPath] = useState(router.state.location.pathname);

    useEffect(() => {
        const unsub = router.subscribe('onResolved', () => {
            setCurrentPath(router.state.location.pathname);
        });
        return unsub;
    }, [router]);

    const getIsActive = useCallback((path: string) => currentPath === path, [currentPath]);

    return (
        <div className="size-full border-t px-2 py-3 flex gap-2 items-center justify-around bg-white">
            {navBarItems.map(({ path, name, icon: Icon }) => (
                <Link
                    key={path}
                    to={path}
                    className={cn(
                        'flex flex-col gap-1.5 items-center justify-center text-sm text-center w-full',
                        getIsActive(path) && 'text-primary'
                    )}
                >
                    <Icon className={cn('size-4', getIsActive(path) && 'text-primary')} />
                    {name}
                </Link>
            ))}
        </div>
    );
};

export default Navbar;
