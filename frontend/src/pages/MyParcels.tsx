import { useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { useAccount } from '@/contexts/AccountContext';
import { Plus, Clock, AlertTriangle, PackagePlus } from 'lucide-react';
import CreateParcelModal from '@/components/modals/CreateParcelModal';
import type { AccountRow, AddressRow, ParcelRow } from '@/lib/types';
import { useAllParcelsQuery } from '@/api/parcels.api';
import { useAddressesQuery } from '@/api/addresses.api';
import { useAccountsQuery } from '@/api/accounts.api';

type ParcelUI = ParcelRow & {
    distanceKm: number;
    eta: string;
    co2: number;
    price: number;
    toAddress?: AddressRow | null;
    toReceiver?: AccountRow | null;
};

/* ---------------- mock helpers ---------------- */
const mockDistanceKm = () => Number((Math.random() * 10 + 0.5).toFixed(1));
const mockETA = () => `${Math.floor(Math.random() * 3) + 1} days`;
const mockCO2 = (km: number) => Math.round(km * 120);
const mockPrice = (km: number, weight: number) => Number((1.5 + km * 0.4 + weight * 0.2).toFixed(2));

// Address display helper
function formatAddress(address?: AddressRow | null) {
    if (!address) return 'Unknown location';

    const parts = [address.street, address.house_number, address.postal_code, address.city, address.country].filter(
        Boolean
    );

    if (parts.length > 0) return parts.join(' ');

    // fallback: coordinates in geodata if present
    const g: any = address.geodata;
    const lat = g?.lat ?? g?.latitude;
    const lng = g?.lng ?? g?.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
        return `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    return 'Unknown location';
}

/* ---------------- page ---------------- */
const MyParcels = () => {
    const { account } = useAccount();
    const { data: addresses, isLoading: addressesLoading } = useAddressesQuery();
    const { data: accounts, isLoading: accountsLoading } = useAccountsQuery();
    const { data: allParcels, isLoading: parcelsLoading } = useAllParcelsQuery();

    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
    const [createOpen, setCreateOpen] = useState(false);

    // Filter parcels for current user
    const userParcelsRaw = (allParcels ?? []).filter((p) => p.sender === account?.id);

    // Enrich parcels with address and receiver info
    const parcels: ParcelUI[] = userParcelsRaw.map((parcel) => {
        const distanceKm = mockDistanceKm();
        return {
            ...parcel,
            distanceKm,
            eta: mockETA(),
            co2: mockCO2(distanceKm),
            price: mockPrice(distanceKm, parcel.weight),
            toAddress: addresses?.find((a) => a.id === parcel.destination) ?? null,
            toReceiver: accounts?.find((r) => r.id === parcel.receiver) ?? null,
        };
    });

    const loading = parcelsLoading || addressesLoading || accountsLoading;

    /* ---------- filters ---------- */
    const visibleParcels = parcels.filter((p) =>
        activeTab === 'ACTIVE' ? p.status !== 'DELIVERED' : p.status === 'DELIVERED'
    );

    return (
        <div className="flex flex-col">
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

                {visibleParcels.map((parcel) => {
                    const receiverName = parcel.toReceiver?.name ?? parcel.toReceiver?.email ?? 'Receiver';
                    const statusLabel = parcel.status ? parcel.status.replaceAll('_', ' ').toLowerCase() : 'unknown';

                    return (
                        <Card key={parcel.id} className="rounded-2xl shadow-sm">
                            <CardContent className="p-4 space-y-3">
                                {/* Title: Receiver */}
                                <div className="text-green-700 font-semibold text-base">{receiverName}</div>

                                {/* Route */}
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium">To:</span> {formatAddress(parcel.toAddress)}
                                    </div>
                                </div>

                                {/* Status + Metrics */}
                                <div className="flex justify-between items-start gap-4 border-t pt-3">
                                    {/* Left: status (+ ETA) */}
                                    <div className="flex flex-col gap-1 text-sm">
                                        <div className="font-medium text-gray-700">
                                            Status: <span className="capitalize">{statusLabel}</span>
                                        </div>

                                        {activeTab === 'ACTIVE' && (
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <Clock className="h-4 w-4" />
                                                ETA: {parcel.eta}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: description + flags */}
                                    <div className="flex flex-col items-end gap-2 text-sm">
                                        {parcel.description && (
                                            <div className="text-gray-600 text-right max-w-55">
                                                {parcel.description}
                                            </div>
                                        )}

                                        {parcel.type !== 'NORMAL' && (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                {parcel.type}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Floating create button (above bottom nav) */}
            <Button
                type="button"
                size="icon"
                onClick={() => setCreateOpen(true)}
                className="fixed right-10 bottom-24 z-50 h-14 w-14 rounded-full shadow-lg"
                aria-label="Create parcel"
            >
                <PackagePlus strokeWidth={1.5} className="size-6" />
            </Button>

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
