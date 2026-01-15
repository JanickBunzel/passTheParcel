import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Filter, ArrowUpDown, MapPin, Plus, AlertTriangle, Leaf, Clock } from 'lucide-react';
import { useAvailableOrdersQuery, useClaimOrderMutation } from '@/api/orders.api';
import { useAllParcelsQuery } from '@/api/parcels.api';
import { useAddressesQuery } from '@/api/addresses.api';
import { useAccountsQuery } from '@/api/accounts.api';
import { sortItems, type SortOption } from '@/lib/utils';
import type { AccountRow, AddressRow, OrderWithParcel, ParcelRow } from '@/lib/types';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';
import { useAccount } from '@/contexts/AccountContext';
import { useNavigate } from '@tanstack/react-router';

// -----------------------------
// Mock calculation helpers
// -----------------------------

// Convert hash to [0, 1)
function hashToUnitFloat(orderId: string, salt: string) {
    const h = hashToInt(`${orderId}:${salt}`);
    return h / 0xffffffff; // 0..1
}

/**
 * Distance: deterministic in range [0.2, 5.0] km based on orderId
 */
export function calculateDistanceKmDet(orderId: string): number {
    const u = hashToUnitFloat(orderId, 'distance');
    const km = 0.2 + u * 4.8;
    return Number(km.toFixed(2));
}

/**
 * CO2 saved: deterministic, derived from distance (and optionally weight)
 */
export function calculateCO2SavedDet(orderId: string, distanceKm: number): number {
    // Keep your old logic but deterministic; add a tiny deterministic jitter if desired
    const jitter = 0.9 + hashToUnitFloat(orderId, 'co2') * 0.2; // 0.9..1.1
    return Math.round(distanceKm * 120 * jitter);
}

/**
 * Price: deterministic from distance + parcel weight + small deterministic surcharge
 */
export function calculatePriceDet(orderId: string, parcel: ParcelRow, distanceKm: number): number {
    const base = 1.0;
    const weightFactor = parcel.weight ? parcel.weight * 0.2 : 0.5;

    // deterministic small surcharge/discount: -0.20 .. +0.30
    const tweak = -0.2 + hashToUnitFloat(orderId, 'price') * 0.5;

    const price = base + distanceKm * 0.4 + weightFactor + tweak;
    return Number(price.toFixed(2));
}

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

// Address
function formatAddress(address?: AddressRow | null) {
    if (!address) return 'Unknown location';

    const parts = [address.street, address.house_number, address.postal_code, address.city, address.country].filter(
        Boolean
    );

    if (parts.length > 0) return parts.join(' ');

    // fallback: coordinates from geodata JSON
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

// -----------------------------
// Component
// -----------------------------

export default function Orders() {
    const navigate = useNavigate();

    const { account: user } = useAccount();

    const [query, setQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>(null);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithParcel | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterType, setFilterType] = useState<ParcelRow['type'] | null>(null);
    const [maxWeightKg, setMaxWeightKg] = useState<number | null>(null);

    // React Query hooks
    const { data: ordersData = [] } = useAvailableOrdersQuery();
    const { data: parcelsData = [] } = useAllParcelsQuery();
    const { data: addresses = [] } = useAddressesQuery();
    const { data: receivers = [] } = useAccountsQuery();
    const claimOrderMutation = useClaimOrderMutation();

    const openDetails = (order: OrderWithParcel) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setDetailsOpen(false);
        setSelectedOrder(null);
    };

    // Toggle sort dropdown
    const toggleSort = () => setIsSortOpen((prev) => !prev);
    const toggleFilter = () => setIsFilterOpen((prev) => !prev);

    // Enrich orders with parcel, address, and receiver info
    const orders: OrderWithParcel[] = ordersData
        .map((order) => {
            const parcel = parcelsData.find((p) => p.id === order.parcel);
            if (!parcel) return undefined;
            const distanceKm = calculateDistanceKmDet(order.id);
            const price = calculatePriceDet(order.id, parcel, distanceKm);
            const co2 = calculateCO2SavedDet(order.id, distanceKm);

            return {
                ...order,
                deadline: mockDeadlineMs(order.id),
                parcelData: parcel,
                fromAddress: addresses.find((a) => a.id === order.from) ?? null,
                toAddress: addresses.find((a) => a.id === order.to) ?? null,
                receiver: receivers.find((r) => r.id === parcel.receiver) ?? null,
                distanceKm,
                price,
                co2,
            } as OrderWithParcel;
        })
        .filter((o): o is OrderWithParcel => !!o);

    const availableParcelTypes = Array.from(new Set(orders.map((o) => o.parcelData.type).filter(Boolean)));

    const addToCart = async (order: OrderWithParcel) => {
        if (!user) return;

        claimOrderMutation.mutateAsync({ orderId: order.id, userId: user.id });
        navigate({ to: '/delivery' });
    };

    // Apply filtering then sorting
    const filteredOrders = orders.filter((order) => {
        if (filterType && order.parcelData.type !== filterType) return false;
        if (maxWeightKg !== null && (order.parcelData.weight ?? 0) > maxWeightKg) return false;
        return true;
    });
    const sortedOrders = sortItems(filteredOrders, sortBy);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Top bar */}
            <div className="p-4 bg-white shadow-sm flex items-center gap-2 relative">
                <Input placeholder="Where are you going?" value={query} onChange={(e) => setQuery(e.target.value)} />
                <div className="relative">
                    {/* Sort button */}

                    <Button variant="outline" size="icon" onClick={toggleSort}>
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>

                    {isSortOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-10 p-2 space-y-1">
                            <button
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                    setSortBy('priceAsc');
                                    setIsSortOpen(false);
                                }}
                            >
                                Price: Low → High
                            </button>
                            <button
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                    setSortBy('priceDesc');
                                    setIsSortOpen(false);
                                }}
                            >
                                Price: High → Low
                            </button>
                            <button
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                    setSortBy('distanceAsc');
                                    setIsSortOpen(false);
                                }}
                            >
                                Distance: Short → Long
                            </button>
                            <button
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                    setSortBy('distanceDesc');
                                    setIsSortOpen(false);
                                }}
                            >
                                Distance: Long → Short
                            </button>
                        </div>
                    )}
                </div>

                <Button variant="outline" size="icon" onClick={toggleFilter}>
                    <Filter className="h-4 w-4" />
                </Button>

                {isFilterOpen && (
                    <div className="absolute right-0 top-14 w-48 bg-white border rounded-md shadow-md z-10 p-2 space-y-2">
                        {/* ---- TYPE FILTER ---- */}
                        <div className="space-y-1">
                            <button
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                onClick={() => setFilterType(null)}
                            >
                                All types
                            </button>

                            {availableParcelTypes.map((type) => (
                                <button
                                    key={type}
                                    className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                                    onClick={() => setFilterType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* ---- WEIGHT FILTER ---- */}
                        <div className="border-t pt-2 space-y-2">
                            <label className="block text-xs font-medium text-gray-600">
                                Parcel weight {maxWeightKg !== null ? `≤ ${maxWeightKg} kg` : '(any)'}
                            </label>

                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={0.05}
                                value={maxWeightKg ?? 10}
                                onChange={(e) => setMaxWeightKg(Number(e.target.value))}
                                className="w-full"
                            />

                            <button
                                className="text-xs text-gray-500 hover:underline"
                                onClick={() => setMaxWeightKg(null)}
                            >
                                Reset weight
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedOrders.map((order) => {
                    const { parcelData, distanceKm, price, co2 } = order;
                    return (
                        <Card
                            key={order.id}
                            className="rounded-2xl shadow-sm cursor-pointer"
                            onClick={() => openDetails(order)}
                        >
                            <CardContent className="p-4 space-y-3">
                                {/* Title: deadline */}
                                <div className="flex items-center gap-2 text-green-700 font-semibold text-base">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDeadline(order.deadline)}</span>
                                </div>

                                {/* From / To */}
                                <div className="text-sm text-gray-700 space-y-1">
                                    <div>
                                        <span className="font-medium">From:</span> {formatAddress(order.fromAddress)}
                                    </div>
                                    <div>
                                        <span className="font-medium">To:</span> {formatAddress(order.toAddress)}
                                    </div>
                                </div>

                                {/* Bottom row: metrics (left) + price/action (right) */}
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

                                    {/* Right: keep price + addToCart unchanged */}
                                    <div className="flex items-center gap-3">
                                        <div className="font-semibold text-lg">€{price.toFixed(2)}</div>
                                        <Button
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(order);
                                            }}
                                        >
                                            <Plus />
                                        </Button>
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
                onTakeOrder={addToCart} // uses your existing logic; modal only shows if owner == null
                currentUserId={user?.id ?? null}
                formatAddress={formatAddress}
                formatReceiver={formatReceiver}
                formatDeadline={(deadlineMs: number) =>
                    new Date(deadlineMs).toLocaleString(undefined, {
                        weekday: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                }
            />
        </div>
    );
}
