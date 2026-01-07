import { Link } from '@tanstack/react-router';
import { Button } from '@/components/shadcn/button';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { Package } from 'lucide-react';

const Home = () => {
    const { openLogoutModal } = useAuth();
    const { account } = useAccount();

    return (
        <div className="w-full h-screen p-4 flex flex-col gap-4 justify-center items-center">
            <h2>Logged in. Here will be the Home Screen</h2>
            <div>
                Your account:
                <pre className="bg-gray-100 rounded p-2 text-sm overflow-x-auto">
                    {JSON.stringify(account || {}, null, 2)}
                </pre>
            </div>
            <div className="flex gap-2 items-center">
                <Button variant="outline" asChild>
                    <Link to="/paket">
                        <Package />
                        Paket details
                    </Link>
                </Button>
                <Button onClick={openLogoutModal}>Logout</Button>
            </div>
        </div>
    );
};

export default Home;
