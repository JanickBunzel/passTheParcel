import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/shadcn/card";
import { Package, MapPin, Leaf, AlertTriangle, ShoppingCart } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { Button } from '@/components/shadcn/button.tsx';
import { Link } from '@tanstack/react-router';

// -----------------------------
// Types
// -----------------------------

type ParcelRow = Database["public"]["Tables"]["parcels"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

type OrderWithParcel = OrderRow & {
    parcel: ParcelRow;
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

// -----------------------------
// Component
// -----------------------------

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<OrderWithParcel[]>([]);
    const [user, setUser] = useState<any>(null); // users row

    useEffect(() => {
        const fetchCurrentUser = async () => {
            // get logged-in account
            const { data: { user: accountUser }, error: accountError } = await supabase.auth.getUser();
            if (accountError || !accountUser) {
                console.error("No account logged in:", accountError);
                return;
            }

            setUser(accountUser);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            // fetch orders owned by current user
            const { data: ordersData, error: ordersError } = await supabase
                .from("orders")
                .select("*")
                .eq("owner", user.id);

            if (ordersError || !ordersData) {
                console.error("Failed to fetch orders:", ordersError);
                return;
            }

            // fetch all related parcels
            const parcelIds = ordersData.map((o) => o.parcel);
            const { data: parcelsData, error: parcelsError } = await supabase
                .from("parcels")
                .select("*")
                .in("id", parcelIds);

            if (parcelsError || !parcelsData) {
                console.error("Failed to fetch parcels:", parcelsError);
                return;
            }

            // merge orders with parcel info + compute derived fields
            const enriched: OrderWithParcel[] = ordersData.map((order) => {
                const parcel = parcelsData.find((p) => p.id === order.parcel)!;
                const distanceKm = calculateDistanceKm(parcel);
                const price = calculatePrice(parcel, distanceKm);
                const co2 = calculateCO2Saved(parcel, distanceKm);

                return {
                    ...order,
                    parcel,
                    distanceKm,
                    price,
                    co2,
                };
            });

            setOrders(enriched);
        };

        fetchOrders();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {orders.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        You haven’t taken any orders yet.
                    </div>
                )}

                {orders.map((order) => {
                    const { parcel, distanceKm, price, co2 } = order;
                    return (
                        <Card key={order.id} className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <Package />
                                    <div>
                                        <div className="font-semibold">€{price.toFixed(2)}</div>

                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {distanceKm} km
                                        </div>

                                        <div className="text-xs text-green-700 flex items-center gap-1 mt-1">
                                            <Leaf className="h-3 w-3" /> CO₂ saved: {co2} g
                                        </div>

                                        {parcel.type !== "NORMAL" && (
                                            <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                                <AlertTriangle className="h-3 w-3" /> {parcel.type}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom navigation */}
            <div className="bg-white border-t p-3 flex justify-around">
                <Button variant="ghost" asChild>
                    <Link to="/paket">Search</Link>
                </Button>
                <Button variant="ghost" asChild>
                    <Link to="/">Home</Link>
                </Button>
                <Button variant="ghost" asChild className="relative">
                    <Link to="/orders">
                        <ShoppingCart />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
