import { useState } from 'react';
import { Card, CardContent } from '@/components/shadcn/card';
import { MapPin, Leaf, AlertTriangle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import type { AccountRow, AddressRow, ParcelRow, OrderWithParcel } from '@/lib/types';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';
import { useDeliveryOrdersQuery, useMarkOrderDeliveredMutation } from '@/api/delivery.api';
import { useAllParcelsQuery } from '@/api/parcels.api';
import { useAddressesQuery } from '@/api/addresses.api';
import { useAccount } from '@/contexts/AccountContext';
import { useAccountsQuery } from '@/api/accounts.api.ts';


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
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Address display helper
function formatAddress(address?: AddressRow | null) {
    if (!address) return 'Unknown location';

    const parts = [address.street, address.house_number, address.postal_code, address.city, address.country].filter(
        Boolean
    );

    if (parts.length > 0) return parts.join(' ');

    const g: any = address.geodata;
    const lat = g?.lat ?? g?.latitude;
    const lng = g?.lng ?? g?.longitude;

    if (typeof lat === 'number' && typeof lng === 'number') {
        return `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    return 'Unknown location';
}

function formatReceiver(_parcel: ParcelRow, receiver: AccountRow): string {
    return receiver.name?.trim() || receiver.email || 'Unknown receiver';
}

/* ---------------- component ---------------- */
export default function Delivery() {
    const [tab, setTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
    const [selectedOrder, setSelectedOrder] = useState<OrderWithParcel | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const openDetails = (order: OrderWithParcel) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setDetailsOpen(false);
        setSelectedOrder(null);
    };

    const { account: user } = useAccount();

    // React Query hooks
    const { data: ordersData = [] } = useDeliveryOrdersQuery(user?.id || null);
    const { data: parcelsData = [] } = useAllParcelsQuery();
    const { data: addresses = [] } = useAddressesQuery();
    const { data: receivers = [] } = useAccountsQuery();
    const markOrderDeliveredMutation = useMarkOrderDeliveredMutation();

    // Enrich orders with parcel and address info
    const orders: OrderWithParcel[] = ordersData.map((order) => {
        const parcel = parcelsData.find((p) => p.id === order.parcel)!;
        const distanceKm = calculateDistanceKm();
        const price = calculatePrice(parcel, distanceKm);
        const co2 = calculateCO2Saved(parcel, distanceKm);

                return {
                    ...order,
                    deadline: mockDeadlineMs(order.id),
                    parcelData: parcel,
                    fromAddress: addresses?.find((a) => a.id === order.from) ?? null,
                    toAddress: addresses?.find((a) => a.id === order.to) ?? null,
                    receiver: receivers?.find((r) => r.id === parcel.receiver) ?? null,
                    distanceKm,
                    price,
                    co2,
                };
            });

    /* ---------- mark delivered ---------- */
    const markDelivered = async (order: OrderWithParcel) => {
        try {
            await markOrderDeliveredMutation.mutateAsync({ orderId: order.id, parcelId: order.parcelData.id });
        } catch (error) {
            console.error(error);
        }
    };

    /* ---------- filter ---------- */
    const visibleOrders = orders
        .filter((o) => (tab === 'ACTIVE' ? o.finished === null : o.finished !== null))
        .sort((a, b) => {
            if (tab !== 'ACTIVE') return 0;
            return a.deadline - b.deadline; // soonest first
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
                    const { parcelData, distanceKm, price, co2 } = order;

                    return (
                        <Card
                            key={order.id}
                            className="rounded-2xl shadow-sm cursor-pointer"
                            onClick={() => openDetails(order)}
                        >
                        <CardContent className="p-4 space-y-3">
                                {/* Title row: deadline (ACTIVE) or Completed (PAST) */}
                                {tab === 'ACTIVE' ? (
                                    <div className="flex items-center gap-2 text-green-700 font-semibold text-base">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDeadline(order.deadline)}</span>
                                    </div>
                                ) : (
                                    <div className="text-green-700 font-semibold text-base leading-tight">
                                        Completed
                                    </div>
                                )}

                                {/* From / To (receiver omitted as requested) */}
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium">From:</span> {formatAddress(order.fromAddress)}
                                    </div>
                                    <div>
                                        <span className="font-medium">To:</span> {formatAddress(order.toAddress)}
                                    </div>
                                </div>

                                {/* Bottom row: metrics left, price + action right */}
                                <div className="flex justify-between items-start gap-4 border-t pt-3">
                                    {/* Left: type/weight/distance/co2 */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        {parcelData.type !== 'NORMAL' && (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <AlertTriangle className="h-4 w-4" />
                                                {parcelData.type}
                                            </div>
                                        )}

                                        <div className="text-gray-700">
                                            <span className="font-medium">Weight:</span> {parcelData.weight} kg
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
                                        {tab === 'ACTIVE' ? (
                                            <>
                                                <div className="font-semibold text-lg">€{price.toFixed(2)}</div>
                                                <Button
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markDelivered(order);
                                                    }}
                                                >
                                                    <Check />
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="text-sm font-medium text-gray-500">
                                                €{price.toFixed(2)}
                                                <span className="text-sm font-normal text-gray-600">
                                                    {' '}
                                                    reward received
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

            <OrderDetailsModal
                open={detailsOpen}
                order={selectedOrder}
                onClose={closeDetails}
                currentUserId={user?.id ?? null}
                formatAddress={formatAddress}
                formatReceiver={formatReceiver}
                formatDeadline={(ms: number) =>
                    new Date(ms).toLocaleString(undefined, {
                        weekday: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                }
            />
        </div>
    );
}
