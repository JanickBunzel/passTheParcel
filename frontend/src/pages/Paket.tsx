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

// -----------------------------
// Types
// -----------------------------

type ParcelRow = Database["public"]["Tables"]["parcels"]["Row"];

type ParcelWithComputed = ParcelRow & {
    distanceKm: number;
    price: number;
    co2: number;
};

// -----------------------------
// Mock calculation helpers
// (replace later with real routing / pricing / CO₂ logic)
// -----------------------------

function calculateDistanceKm(_: ParcelRow): number {
    // mock: random distance between 0.2 – 5 km
    return Number((Math.random() * 4.8 + 0.2).toFixed(2));
}

function calculatePrice(parcel: ParcelRow, distanceKm: number): number {
    // mock: base + distance + weight factor
    const base = 1.0;
    const weightFactor = parcel.weight ? parcel.weight * 0.2 : 0.5;
    return Number((base + distanceKm * 0.4 + weightFactor).toFixed(2));
}

function calculateCO2Saved(_: ParcelRow, distanceKm: number): number {
    // mock: grams of CO₂ saved compared to van delivery
    return Math.round(distanceKm * 120);
}

export default function ParcelSearchPage() {
    const [query, setQuery] = useState<string>("");
    const [parcels, setParcels] = useState<ParcelWithComputed[]>([]);
    const [cart, setCart] = useState<ParcelWithComputed[]>([]);

    useEffect(() => {
        const fetchParcels = async () => {
            const { data, error } = await supabase
                .from("parcels")
                .select("*");

            if (error || !data) {
                console.error(error);
                return;
            }

            const enriched: ParcelWithComputed[] = data.map((parcel) => {
                const distanceKm = calculateDistanceKm(parcel);
                const price = calculatePrice(parcel, distanceKm);
                const co2 = calculateCO2Saved(parcel, distanceKm);

                return {
                    ...parcel,
                    distanceKm,
                    price,
                    co2,
                };
            });

            setParcels(enriched);
        };

        fetchParcels();
    }, []);

    const addToCart = (parcel: ParcelWithComputed) => {
        setCart((prev) => [...prev, parcel]);
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

            {/* Parcel list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {parcels.map((parcel) => (
                    <Card key={parcel.id} className="rounded-2xl shadow-sm">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Package />
                                <div>
                                    <div className="font-semibold">€{parcel.price.toFixed(2)}</div>

                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {parcel.distanceKm} km
                                    </div>

                                    <div className="text-xs text-green-700 flex items-center gap-1 mt-1">
                                        <Leaf className="h-3 w-3" /> CO₂ saved: {parcel.co2} g
                                    </div>

                                    {parcel.type !== "NORMAL" && (
                                        <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                            <AlertTriangle className="h-3 w-3" /> {parcel.type}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button size="icon" onClick={() => addToCart(parcel)}>
                                <Plus />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom navigation */}
            <div className="bg-white border-t p-3 flex justify-around">
                <Button variant="ghost">Search</Button>
                <Button variant="ghost">Home</Button>
                <Button variant="ghost" className="relative">
                    <ShoppingCart />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full px-2">
              {cart.length}
            </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
