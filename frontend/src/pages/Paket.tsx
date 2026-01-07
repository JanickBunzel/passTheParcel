import { Button } from '@/components/shadcn/button';
import { Link } from '@tanstack/react-router';

const Paket = () => {
    return (
        <div className="flex flex-col items-center gap-4 justify-center h-screen bg-green-200">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Paket Seite</h1>
                <p className="text-lg">Willkommen auf der Paket Seite!</p>
            </div>

            <Button asChild className="mt-6">
                <Link to="/">Zurück zur Startseite</Link>
            </Button>
        </div>
    );
};

export default Paket;
