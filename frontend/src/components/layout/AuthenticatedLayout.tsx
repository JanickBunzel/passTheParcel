import { Outlet } from '@tanstack/react-router';
import Navbar from './Navbar';
import TopBar from './TopBar';

const AuthenticatedLayout = () => {
    return (
        <div className="h-screen flex flex-col">
            <div className="sticky top-0 w-full z-50">
                <TopBar />
            </div>

            <main className="flex-1 min-h-0 overflow-scroll">
                <Outlet />
            </main>

            <div className="sticky bottom-0 w-full z-50">
                <Navbar />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
