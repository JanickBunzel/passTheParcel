import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Plus, MapPin, Leaf, Clock, LogOut, AlertTriangle } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import CreateParcelModal from '@/components/modals/CreateParcelModal';

/* ---------------- types ---------------- */
type ParcelRow = Database['public']['Tables']['parcels']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];
type UserRow = Database['public']['Tables']['accounts']['Row'];

type ParcelUI = ParcelRow & {
    distanceKm: number;
    eta: string;
    co2: number;
    price: number;
    toAddress?: AddressRow | null;
    toReceiver?: UserRow | null;
};

/* ---------------- mock helpers ---------------- */
const mockDistanceKm = () => Number((Math.random() * 10 + 0.5).toFixed(1));
const mockETA = () => `${Math.floor(Math.random() * 3) + 1} days`;
const mockCO2 = (km: number) => Math.round(km * 120);
const mockPrice = (km: number, weight: number) => Number((1.5 + km * 0.4 + weight * 0.2).toFixed(2));

// Address display helper
function formatAddress(address?: any | null) {
    if (!address) return 'Unknown location';

    const parts = [address.street, address.postcode, address.city, address.country].filter(Boolean);

    if (parts.length > 0) {
        return parts.join(', ');
    }

    if (address.lat && address.lng) {
        return `(${address.lat.toFixed(4)}, ${address.lng.toFixed(4)})`;
    }

    return 'Unknown location';
}

// Receiver display helper
function formatReceiver(parcel: ParcelRow, receiver?: any | null) {
    if (!parcel.receiver) return 'Unknown receiver';
    if (!receiver) return 'Unknown receiver';

    return receiver.name ?? receiver.email ?? 'Unknown receiver';
}

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

            // Filter out nulls for addressIds and receiverIds
            const addressIds = data.map((p) => p.destination).filter((id): id is string => Boolean(id));
            const receiverIds = data.map((p) => p.receiver).filter((id): id is string => Boolean(id));

            const { data: addresses } = await supabase.from('addresses').select('*').in('id', addressIds);

            const { data: receivers } = await supabase.from('accounts').select('*').in('id', receiverIds);

            const enriched: ParcelUI[] = data.map((parcel) => {
                const distanceKm = mockDistanceKm();
                return {
                    ...parcel,
                    distanceKm,
                    eta: mockETA(),
                    co2: mockCO2(distanceKm),
                    price: mockPrice(distanceKm, parcel.weight),
                    toAddress: addresses?.find((a) => a.id === parcel.destination) ?? null,
                    toReceiver: receivers?.find((r) => r.id === parcel.receiver) ?? null,
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
        <div className="flex flex-col">
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
                        <CardContent className="p-4 space-y-3">
                            {/* Route + Receiver */}
                            <div className="text-sm text-gray-700 space-y-1">
                                <div>
                                    <span className="font-medium">To:</span> {formatAddress(parcel.toAddress)}
                                </div>
                                <div>
                                    <span className="font-medium">Receiver:</span>{' '}
                                    {formatReceiver(parcel, parcel.toReceiver)}
                                </div>
                            </div>

                            {/* Metrics row */}
                            <div className="flex justify-between items-center gap-4 border-t pt-3">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        {parcel.distanceKm} km
                                    </div>

                                    <div className="flex items-center gap-1 text-green-700">
                                        <Leaf className="h-4 w-4" />
                                        {parcel.co2} g CO₂
                                    </div>

                                    {parcel.type !== 'NORMAL' && (
                                        <div className="flex items-center gap-1 text-orange-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            {parcel.type}
                                        </div>
                                    )}
                                </div>

                                {activeTab === 'ACTIVE' && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="font-semibold text-lg" />
                                        ETA: {parcel.eta}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
