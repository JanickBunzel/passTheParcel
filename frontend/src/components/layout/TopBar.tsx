import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../shadcn/avatar';
import { Button } from '../shadcn/button';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@tanstack/react-router';

const TopBar = () => {
    const { openLogoutModal } = useAuth();
    const { account } = useAccount();

    const initials = account?.name
        ? account.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : null;

    return (
        <div className="w-full border-b p-4 flex gap-4 items-center justify-between bg-white">
            <Button asChild variant="ghost" className="px-0! flex gap-2 items-center">
                <Link to="/profile">
                    <Avatar className="size-8">
                        <AvatarFallback className="text-sm text-white bg-primary">
                            {initials ? initials : <User className="size-4" />}
                        </AvatarFallback>
                    </Avatar>
                    {account?.name && <span className="font-medium">{account.name}</span>}
                </Link>
            </Button>

            <Button size="icon" variant="outline" onClick={openLogoutModal}>
                <LogOut />
            </Button>
        </div>
    );
};

export default TopBar;
