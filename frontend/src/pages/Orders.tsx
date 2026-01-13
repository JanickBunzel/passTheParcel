import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Filter, ArrowUpDown, MapPin, Plus, AlertTriangle, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';

// -----------------------------
// Types
// -----------------------------

type ParcelRow = Database['public']['Tables']['parcels']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];
type UserRow = Database['public']['Tables']['accounts']['Row'];

type OrderWithParcel = Omit<OrderRow, 'parcel'> & {
    parcel: ParcelRow;
    fromAddress?: AddressRow | null;
    toAddress?: AddressRow | null;
    receiver?: UserRow | null;
    distanceKm: number;
    price: number;
    co2: number;
};

// -----------------------------
// Mock calculation helpers
// -----------------------------

function calculateDistanceKm(_: ParcelRow): number {
    return Number((Math.random() * 4.8 + 0.2).toFixed(2));
}

function calculatePrice(parcel: ParcelRow, distanceKm: number): number {
    const base = 1.0;
    const weightFactor = parcel.weight ? parcel.weight * 0.2 : 0.5;
    return Number((base + distanceKm * 0.4 + weightFactor).toFixed(2));
}

function calculateCO2Saved(_: ParcelRow, distanceKm: number): number {
    return Math.round(distanceKm * 120);
}

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

// -----------------------------
// Component
// -----------------------------

export default function Orders() {
    const [query, setQuery] = useState<string>('');
    const [orders, setOrders] = useState<OrderWithParcel[]>([]);
    const [user, setUser] = useState<any>(null); // Current logged-in user

    useEffect(() => {
        const fetchUser = async () => {
            // get current account from auth
            const {
                data: { user: accountUser },
                error: accountError,
            } = await supabase.auth.getUser();
            if (accountError || !accountUser) {
                console.error('No account logged in:', accountError);
                return;
            }

            setUser(accountUser); // store users row
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            // fetch orders where owner is NULL
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .is('owner', null);

            if (ordersError || !ordersData) {
                console.error(ordersError);
                return;
            }

            // fetch all related parcels
            const parcelIds = ordersData.map((o) => o.parcel);
            const { data: parcelsData, error: parcelsError } = await supabase
                .from('parcels')
                .select('*')
                .in('id', parcelIds);

            if (parcelsError || !parcelsData) {
                console.error(parcelsError);
                return;
            }

            // Filter out nulls for addressIds and receiverIds
            const addressIds = ordersData.flatMap((o) => [o.from, o.to]).filter((id): id is string => Boolean(id));
            const receiverIds = parcelsData.map((p) => p.receiver).filter((id): id is string => Boolean(id));

            const { data: addresses } = await supabase.from('addresses').select('*').in('id', addressIds);

            const { data: receivers } = await supabase.from('accounts').select('*').in('id', receiverIds);

            // merge orders with parcel info + compute derived fields
            const enriched: OrderWithParcel[] = ordersData.map((order) => {
                const parcel = parcelsData.find((p) => p.id === order.parcel)!;
                const distanceKm = calculateDistanceKm(parcel);
                const price = calculatePrice(parcel, distanceKm);
                const co2 = calculateCO2Saved(parcel, distanceKm);

                return {
                    ...order,
                    parcel,
                    fromAddress: addresses?.find((a) => a.id === order.from) ?? null,
                    toAddress: addresses?.find((a) => a.id === order.to) ?? null,
                    receiver: receivers?.find((r) => r.id === parcel.receiver) ?? null,
                    distanceKm,
                    price,
                    co2,
                };
            });

            setOrders(enriched);
        };

        fetchOrders();
    }, []);

    const addToCart = async (order: OrderWithParcel) => {
        if (!user) {
            console.warn('No user logged in!');
            return;
        }

        // update the owner of the order in Supabase
        const { error } = await supabase.from('orders').update({ owner: user.id }).eq('id', order.id);

        if (error) {
            console.error(error);
            return;
        }

        // update local state
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
    };

    return (
        <div className="flex flex-col">
            {/* Top bar */}
            <div className="p-4 bg-white shadow-sm flex items-center gap-2">
                <Input placeholder="Where are you going?" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {orders.map((order) => {
                    const { parcel, distanceKm, price, co2 } = order;
                    return (
                        <Card key={order.id} className="rounded-2xl shadow-sm">
                            <CardContent className="p-4 space-y-3">
                                {/* Route + Receiver */}
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium">From:</span> {formatAddress(order.fromAddress)}
                                    </div>
                                    <div>
                                        <span className="font-medium">To:</span> {formatAddress(order.toAddress)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Receiver:</span>{' '}
                                        {formatReceiver(parcel, order.receiver)}
                                    </div>
                                </div>

                                {/* Metrics row */}
                                <div className="flex justify-between items-center gap-4 border-t pt-3">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            {distanceKm} km
                                        </div>

                                        <div className="flex items-center gap-1 text-green-700">
                                            <Leaf className="h-4 w-4" />
                                            {co2} g CO₂
                                        </div>

                                        {parcel.type !== 'NORMAL' && (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                {parcel.type}
                                            </div>
                                        )}
                                    </div>

                                    {/* Price + action */}
                                    <div className="flex items-center gap-3">
                                        <div className="font-semibold text-lg">€{price.toFixed(2)}</div>
                                        <Button size="icon" onClick={() => addToCart(order)}>
                                            <Plus />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
