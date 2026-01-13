import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';

const AuthenticatedLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 min-h-0 overflow-auto">
                <Outlet />
            </main>
            <div className="sticky bottom-0 w-full z-50">
                <Navbar />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
