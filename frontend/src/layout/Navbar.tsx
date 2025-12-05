import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/shadcn/button';
import { LogOut } from 'lucide-react';

type Props = {
    title?: string;
    fullWidth?: boolean;
    contentClassName?: string;
    children?: React.ReactNode;
};

const Navbar = ({ title, fullWidth, contentClassName, children }: Props) => {
    const { user, logout } = useAuth();

    return (
        <div className="h-full flex flex-col items-center">
            <nav className={`p-4 flex items-center w-full ${fullWidth ? '' : 'max-w-[var(--content-width)]'}`}>
                {title && <h1 className="text-4xl font-semibold">{title}</h1>}

                <div className="flex-1 flex justify-end items-center gap-2">
                    <p className="text-sm">
                        Logged in as <span className="font-semibold">{user?.email || 'Loading...'}</span>
                    </p>
                    <Button variant="outline" onClick={logout}>
                        Logout <LogOut />
                    </Button>
                </div>
            </nav>

            <div className={cn('flex flex-col items-start size-full gap-4 p-4 pt-0', contentClassName)}>{children}</div>
        </div>
    );
};

export default Navbar;
