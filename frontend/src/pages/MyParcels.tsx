import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Package, Plus, MapPin, Leaf, Clock, LogOut, AlertTriangle, ShoppingCart } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import CreateParcelModal from '@/components/modals/CreateParcelModal';

/* ---------------- types ---------------- */
type ParcelRow = Database['public']['Tables']['parcels']['Row'];

type ParcelUI = ParcelRow & {
    distanceKm: number;
    eta: string;
    co2: number;
    price: number;
};

/* ---------------- mock helpers ---------------- */
const mockDistanceKm = () => Number((Math.random() * 10 + 0.5).toFixed(1));
const mockETA = () => `${Math.floor(Math.random() * 3) + 1} days`;
const mockCO2 = (km: number) => Math.round(km * 120);
const mockPrice = (km: number, weight: number) => Number((1.5 + km * 0.4 + weight * 0.2).toFixed(2));

/* ---------------- page ---------------- */
const MyParcels = () => {
    const { openLogoutModal } = useAuth();
    const { account } = useAccount();

    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
    const [parcels, setParcels] = useState<ParcelUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);

    /* ---------- fetch parcels ---------- */
    useEffect(() => {
        if (!account?.id) return;

        const fetchParcels = async () => {
            setLoading(true);

            const { data, error } = await supabase.from('parcels').select('*').eq('sender', account.id);

            if (error || !data) {
                console.error(error);
                setLoading(false);
                return;
            }

            const enriched: ParcelUI[] = data.map((parcel) => {
                const distanceKm = mockDistanceKm();
                return {
                    ...parcel,
                    distanceKm,
                    eta: mockETA(),
                    co2: mockCO2(distanceKm),
                    price: mockPrice(distanceKm, parcel.weight),
                };
            });

            setParcels(enriched);
            setLoading(false);
        };

        fetchParcels();
    }, [account?.id]);

    /* ---------- filters ---------- */
    const visibleParcels = parcels.filter((p) =>
        activeTab === 'ACTIVE' ? p.status !== 'DELIVERED' : p.status === 'DELIVERED'
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">My Parcels</h1>
                    <p className="text-xs text-gray-500">Logged in as {account?.email}</p>
                </div>

                <div className="flex gap-2">
                    <Button size="icon" onClick={() => setCreateOpen(true)}>
                        <Plus />
                    </Button>
                    <Button size="icon" variant="outline" onClick={openLogoutModal}>
                        <LogOut />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b">
                <button
                    className={`flex-1 py-2 ${
                        activeTab === 'ACTIVE' ? 'font-semibold border-b-2 border-black' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('ACTIVE')}
                >
                    Active
                </button>
                <button
                    className={`flex-1 py-2 ${
                        activeTab === 'PAST' ? 'font-semibold border-b-2 border-black' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('PAST')}
                >
                    Past
                </button>
            </div>

            {/* Parcel list */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {loading && <p className="text-sm text-gray-500">Loading parcels…</p>}

                {!loading && visibleParcels.length === 0 && (
                    <p className="text-sm text-gray-500">No {activeTab.toLowerCase()} parcels yet.</p>
                )}

                {visibleParcels.map((parcel) => (
                    <Card key={parcel.id} className="rounded-2xl shadow-sm">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-start gap-3">
                                <Package />
                                <div>
                                    <div className="font-semibold">€{parcel.price.toFixed(2)}</div>

                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {parcel.distanceKm} km
                                    </div>

                                    <div className="text-xs text-green-700 flex items-center gap-1 mt-1">
                                        <Leaf className="h-3 w-3" />
                                        CO₂ saved: {parcel.co2} g
                                    </div>

                                    {parcel.type !== 'NORMAL' && (
                                        <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3" /> {parcel.type}
                                        </div>
                                    )}

                                    {activeTab === 'ACTIVE' && (
                                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                            <Clock className="h-3 w-3" />
                                            ETA: {parcel.eta}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom navigation */}
            <div className="bg-white border-t p-3 flex justify-around">
                <Button variant="ghost" asChild>
                    <Link to="/orders">Search</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link to="/">MyParcels</Link>
                </Button>
                <Button variant="ghost" asChild className="relative">
                    <Link to="/delivery">
                        <ShoppingCart />
                    </Link>
                </Button>
            </div>

            {account?.id && (
                <CreateParcelModal
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    ownerId={account.id}
                    ownerAddress={account.address}
                />
            )}
        </div>
    );
};

export default MyParcels;
