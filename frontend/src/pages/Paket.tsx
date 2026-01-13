import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
    ShoppingCart,
    Filter,
    ArrowUpDown,
    Package,
    MapPin,
    Plus,
    AlertTriangle,
    Leaf,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
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

export default function OrderSearchPage() {
    const [query, setQuery] = useState<string>("");
    const [orders, setOrders] = useState<OrderWithParcel[]>([]);
    const [cart, setCart] = useState<OrderWithParcel[]>([]);
    const [user, setUser] = useState<any>(null); // Current logged-in user

    useEffect(() => {
        const fetchUser = async () => {
            // get current account from auth
            const { data: { user: accountUser }, error: accountError } = await supabase.auth.getUser();
            if (accountError || !accountUser) {
                console.error("No account logged in:", accountError);
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
                .from("orders")
                .select("*")
                .is("owner", null);

            if (ordersError || !ordersData) {
                console.error(ordersError);
                return;
            }

            // fetch all related parcels
            const parcelIds = ordersData.map((o) => o.parcel);
            const { data: parcelsData, error: parcelsError } = await supabase
                .from("parcels")
                .select("*")
                .in("id", parcelIds);

            if (parcelsError || !parcelsData) {
                console.error(parcelsError);
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
    }, []);

    const addToCart = async (order: OrderWithParcel) => {
        if (!user) {
            console.warn("No user logged in!");
            return;
        }

        // update the owner of the order in Supabase
        const { error } = await supabase
            .from("orders")
            .update({ owner: user.id })
            .eq("id", order.id);

        if (error) {
            console.error(error);
            return;
        }

        // update local state
        setCart((prev) => [...prev, order]);
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <div className="p-4 bg-white shadow-sm flex items-center gap-2">
                <Input
                    placeholder="Where are you going?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
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

                                <Button size="icon" onClick={() => addToCart(order)}>
                                    <Plus />
                                </Button>
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
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full px-2">
                  {cart.length}
                </span>
                        )}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
