import { Link, useRouter } from '@tanstack/react-router';
import { Container, Package, Route, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';

const navBarItems: NavBarItem[] = [
    { path: '/orders', name: 'Orders', icon: Route },
    { path: '/', name: 'My Parcels', icon: Package },
    { path: '/delivery', name: 'Delivery', icon: Container },
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
        <div className="w-full border-t p-4 flex gap-4 items-center justify-around bg-white">
            {navBarItems.map(({ path, name, icon: Icon }) => (
                <Link
                    key={path}
                    to={path}
                    className={cn(
                        'flex flex-col gap-1 items-center justify-center mx-4 text-sm w-full',
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
