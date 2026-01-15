import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/shadcn/card';
import { MapPin, Leaf, AlertTriangle, Check, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types';
import { Button } from '@/components/shadcn/button';

/* ---------------- types ---------------- */

type ParcelRow = Database['public']['Tables']['parcels']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];

type OrderWithParcel = Omit<OrderRow, 'parcel'> & {
    parcel: ParcelRow;
    fromAddress?: AddressRow | null;
    toAddress?: AddressRow | null;
    distanceKm: number;
    price: number;
    co2: number;
    deadlineMs: number;
};

/* ---------------- mock helpers ---------------- */

const calculateDistanceKm = () => Number((Math.random() * 4.8 + 0.2).toFixed(2));

const calculatePrice = (parcel: ParcelRow, km: number) => Number((1 + km * 0.4 + parcel.weight * 0.2).toFixed(2));

const calculateCO2Saved = (_: ParcelRow, km: number) => Math.round(km * 120);

function hashToInt(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
}

// Stable deadline between 1 and 72 hours from "now", based on order id
function mockDeadlineMs(orderId: string) {
    const h = hashToInt(orderId);
    const hours = (h % 72) + 1;
    return Date.now() + hours * 60 * 60 * 1000;
}

// Show weekday + time (no "deadline" text)
function formatDeadline(ms: number) {
    return new Date(ms).toLocaleString(undefined, {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Address display helper
function formatAddress(address?: AddressRow | null) {
    if (!address) return "Unknown location";

    const parts = [
        address.street,
        address.house_number,
        address.postal_code,
        address.city,
        address.country,
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(" ");

    const g: any = address.geodata;
    const lat = g?.lat ?? g?.latitude;
    const lng = g?.lng ?? g?.longitude;

    if (typeof lat === "number" && typeof lng === "number") {
        return `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    return "Unknown location";
}

/* ---------------- component ---------------- */

export default function Delivery() {
    const [orders, setOrders] = useState<OrderWithParcel[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');

    /* ---------- current user ---------- */
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null);
        });
    }, []);

    /* ---------- fetch orders ---------- */
    useEffect(() => {
        if (!userId) return;

        const fetchOrders = async () => {
            const { data: ordersData } = await supabase.from('orders').select('*').eq('owner', userId);

            if (!ordersData || ordersData.length === 0) {
                setOrders([]);
                return;
            }

            const parcelIds = ordersData.map((o) => o.parcel);

            const { data: parcelsData } = await supabase.from('parcels').select('*').in('id', parcelIds);

            if (!parcelsData) return;

            // Filter out nulls for addressIds and receiverIds
            const addressIds = ordersData.flatMap((o) => [o.from, o.to]).filter((id): id is string => Boolean(id));
            const receiverIds = parcelsData.map((p) => p.receiver).filter((id): id is string => Boolean(id));

            const { data: addresses } = await supabase.from('addresses').select('*').in('id', addressIds);

            const enriched: OrderWithParcel[] = ordersData.map((order) => {
                const parcel = parcelsData.find((p) => p.id === order.parcel)!;
                const distanceKm = calculateDistanceKm();
                const price = calculatePrice(parcel, distanceKm);
                const co2 = calculateCO2Saved(parcel, distanceKm);

                return {
                    // Explicitly assign all OrderRow fields except 'parcel', then override with full parcel object
                    id: order.id,
                    owner: order.owner,
                    parcel: parcel,
                    from: order.from,
                    to: order.to,
                    started: order.started,
                    finished: order.finished,
                    next: order.next,
                    // Enriched fields
                    fromAddress: addresses?.find((a) => a.id === order.from) ?? null,
                    toAddress: addresses?.find((a) => a.id === order.to) ?? null,
                    distanceKm,
                    price,
                    co2,
                    deadlineMs: mockDeadlineMs(order.id),
                };
            });

            setOrders(enriched);
        };

        fetchOrders();
    }, [userId]);

    /* ---------- mark delivered ---------- */
    const markDelivered = async (order: OrderWithParcel) => {
        const finishedAt = new Date().toISOString();

        const { error: orderError } = await supabase.from('orders').update({ finished: finishedAt }).eq('id', order.id);

        if (orderError) {
            console.error(orderError);
            return;
        }

        const { error: parcelError } = await supabase
            .from('parcels')
            .update({ status: 'DELIVERED' })
            .eq('id', order.parcel.id);

        if (parcelError) {
            console.error(parcelError);
            return;
        }

        // update local state
        setOrders((prev) =>
            prev.map((o) => {
                if (o.id === order.id) {
                    // Only spread if o.parcel is an object
                    if (o.parcel && typeof o.parcel === 'object' && !Array.isArray(o.parcel)) {
                        return {
                            ...o,
                            finished: finishedAt,
                            parcel: { ...o.parcel, status: 'DELIVERED' },
                        };
                    } else {
                        return {
                            ...o,
                            finished: finishedAt,
                        };
                    }
                }
                return o;
            })
        );
    };

    /* ---------- filter ---------- */
    const visibleOrders = orders
        .filter((o) => (tab === 'ACTIVE' ? o.finished === null : o.finished !== null))
        .sort((a, b) => {
            if (tab !== "ACTIVE") return 0;
            return a.deadlineMs - b.deadlineMs; // soonest first
        });

    return (
        <div className="flex flex-col">
            {/* Tabs */}
            <div className="bg-white border-b flex">
                <button
                    className={`flex-1 py-2 ${tab === 'ACTIVE' && 'border-b-2 font-semibold'}`}
                    onClick={() => setTab('ACTIVE')}
                >
                    Active
                </button>
                <button
                    className={`flex-1 py-2 ${tab === 'PAST' && 'border-b-2 font-semibold'}`}
                    onClick={() => setTab('PAST')}
                >
                    Past
                </button>
            </div>

            {/* Orders */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {visibleOrders.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No {tab.toLowerCase()} orders.</div>
                )}

                {visibleOrders.map((order) => {
                    const { parcel, distanceKm, price, co2 } = order;

                    return (
                        <Card key={order.id} className="rounded-2xl shadow-sm">
                            <CardContent className="p-4 space-y-3">
                                {/* Title row: deadline (ACTIVE) or Completed (PAST) */}
                                {tab === "ACTIVE" ? (
                                    <div className="flex items-center gap-2 text-green-700 font-semibold text-base">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDeadline(order.deadlineMs)}</span>
                                    </div>
                                ) : (
                                    <div className="text-green-700 font-semibold text-base leading-tight">
                                        Completed
                                    </div>
                                )}

                                {/* From / To (receiver omitted as requested) */}
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium">From:</span>{" "}
                                        {formatAddress(order.fromAddress)}
                                    </div>
                                    <div>
                                        <span className="font-medium">To:</span>{" "}
                                        {formatAddress(order.toAddress)}
                                    </div>
                                </div>

                                {/* Bottom row: metrics left, price + action right */}
                                <div className="flex justify-between items-start gap-4 border-t pt-3">
                                    {/* Left: type/weight/distance/co2 */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        {parcel.type !== "NORMAL" && (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                {parcel.type}
                                            </div>
                                        )}

                                        <div className="text-gray-700">
                                            <span className="font-medium">Weight:</span>{" "}
                                            {parcel.weight} g
                                        </div>

                                        <div className="flex items-center gap-1 text-gray-700">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            {distanceKm} km
                                        </div>

                                        <div className="flex items-center gap-1 text-green-700">
                                            <Leaf className="h-4 w-4" />
                                            {co2} g CO₂
                                        </div>
                                    </div>

                                    {/* Right: price + mark delivered (ACTIVE only) */}
                                    <div className="flex items-center gap-3">
                                        {tab === "ACTIVE" ? (
                                            <>
                                                <div className="font-semibold text-lg">
                                                    €{price.toFixed(2)}
                                                </div>
                                                <Button size="icon" onClick={() => markDelivered(order)}>
                                                    <Check />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-sm font-medium text-gray-500">
                                                €{price.toFixed(2)}
                                                <span className="text-sm font-normal text-gray-600">
                                                    {" "} reward received
                                                </span>
                                            </div>
                                        )}
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
