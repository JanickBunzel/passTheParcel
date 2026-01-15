import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Locate, MapPin, ZoomIn, ZoomOut } from "lucide-react";
import { Map as MapLibre, type MapRef, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParcelsQuery } from "@/api/parcels.api";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import OrderDetailsModal from "@/components/modals/OrderDetailsModal";
import type { OrderWithParcel } from "@/lib/types";

/* ---------- types ---------- */
type ParcelRow = Database["public"]["Tables"]["parcels"]["Row"];
type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];
type UserRow = Database["public"]["Tables"]["accounts"]["Row"];

/* ---------- helpers (same as elsewhere) ---------- */
const calculateDistanceKm = () => Number((Math.random() * 4.8 + 0.2).toFixed(2));
const calculateCO2Saved = (_: ParcelRow, km: number) => Math.round(km * 120);
const calculatePrice = (parcel: ParcelRow, km: number) =>
    Number((1 + km * 0.4 + parcel.weight * 0.2).toFixed(2));

function hashToInt(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
}
function mockDeadlineMs(seed: string) {
    const h = hashToInt(seed);
    const hours = (h % 72) + 1;
    return Date.now() + hours * 60 * 60 * 1000;
}
function formatDeadline(ms: number) {
    return new Date(ms).toLocaleString(undefined, {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}

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

// ensured never null
function formatReceiver(_parcel: ParcelRow, receiver: UserRow) {
    return receiver.name?.trim() || receiver.email;
}

const Map = () => {
    const mapRef = useRef<MapRef | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const { data: parcels = [] } = useParcelsQuery();

    // modal state
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithParcel | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const closeDetails = () => {
        setDetailsOpen(false);
        setSelectedOrder(null);
    };

    const zoomOnParcels = () => {
        const map = mapRef.current;
        if (!map) return;

        const points = parcels.filter((parcel) => parcel.lat != null && parcel.lng != null);
        if (points.length === 0) return;

        if (points.length === 1) {
            const { lat, lng } = points[0];
            map.flyTo({ center: [lng!, lat!], zoom: 12, duration: 600 });
            return;
        }

        const minLng = Math.min(...points.map((parcel) => parcel.lng!));
        const minLat = Math.min(...points.map((parcel) => parcel.lat!));
        const maxLng = Math.max(...points.map((parcel) => parcel.lng!));
        const maxLat = Math.max(...points.map((parcel) => parcel.lat!));

        const bounds: [[number, number], [number, number]] = [
            [minLng, minLat],
            [maxLng, maxLat],
        ];
        map.fitBounds(bounds, { padding: 80, duration: 800 });
    };

    const zoomed = useRef(false);
    useEffect(() => {
        if (zoomed.current || !mapLoaded) return;
        const t = setTimeout(() => {
            zoomed.current = true;
            zoomOnParcels();
        }, 350);
        return () => clearTimeout(t);
    }, [parcels, mapLoaded]);

    const MAX_ZOOM = 24;
    const MIN_ZOOM = 0;
    const zoom = (direction: "in" | "out") => {
        const map = mapRef.current;
        if (!map) return;
        const current = typeof map.getZoom === "function" ? map.getZoom() : undefined;
        if (current == null) return;
        const next = direction === "in" ? Math.min(current + 1, MAX_ZOOM) : Math.max(current - 1, MIN_ZOOM);
        map.flyTo({ zoom: next, duration: 300 });
    };

    const openParcelDetails = async (parcelId: string) => {
        setLoadingDetails(true);

        // 1) pick the single active order for the parcel (finished == NULL)
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("parcel", parcelId)
            .is("finished", null)
            .single();

        if (orderError || !order) {
            console.error("Failed to load active order:", orderError);
            setLoadingDetails(false);
            return;
        }

        // 2) parcel row
        const { data: parcel, error: parcelError } = await supabase
            .from("parcels")
            .select("*")
            .eq("id", order.parcel)
            .single();

        if (parcelError || !parcel) {
            console.error(parcelError);
            setLoadingDetails(false);
            return;
        }

        // 3) addresses
        const addressIds = [order.from, order.to].filter((id): id is string => Boolean(id));
        const { data: addresses, error: addrError } = await supabase
            .from("addresses")
            .select("*")
            .in("id", addressIds);

        if (addrError) console.error(addrError);

        // 4) receiver (you said ensured not null)
        const { data: receiverRow, error: receiverError } = await supabase
            .from("accounts")
            .select("*")
            .eq("id", parcel.receiver)
            .single();

        if (receiverError || !receiverRow) {
            console.error(receiverError);
            setLoadingDetails(false);
            return;
        }

        // 5) computed fields
        const distanceKm = calculateDistanceKm();
        const price = calculatePrice(parcel, distanceKm);
        const co2 = calculateCO2Saved(parcel, distanceKm);

        const enriched: OrderWithParcel = {
            ...order,
            parcelData: parcel,
            fromAddress: addresses?.find((a) => a.id === order.from) ?? null,
            toAddress: addresses?.find((a) => a.id === order.to) ?? null,
            receiver: receiverRow,
            distanceKm,
            price,
            co2,
            deadline: mockDeadlineMs(order.id),
        };

        setSelectedOrder(enriched);
        setDetailsOpen(true);
        setLoadingDetails(false);
    };

    return (
        <div className="relative size-full">
            <div className="flex gap-1 absolute top-2 left-2 right-2 z-50">
                <Button variant="outline" onClick={() => zoom("in")}>
                    <ZoomIn />
                </Button>
                <Button variant="outline" onClick={() => zoom("out")}>
                    <ZoomOut />
                </Button>

                <Button className="ml-auto" variant="outline" onClick={zoomOnParcels}>
                    <Locate />
                    Recenter
                </Button>
            </div>

            <MapLibre
                ref={mapRef}
                onLoad={() => setMapLoaded(true)}
                initialViewState={{
                    latitude: 48.137154,
                    longitude: 11.576124,
                    zoom: 6,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=IXFb3VpnbYogHluMPMN7"
                attributionControl={false}
            >
                {parcels
                    .filter((p) => p.status !== "DELIVERED" && !!p.lat && !!p.lng)
                    .map((parcel) => (
                        <Marker
                            longitude={parcel.lng!}
                            latitude={parcel.lat!}
                            anchor="bottom"
                            key={parcel.id}
                            className="cursor-pointer"
                            onClick={(e) => {
                                // prevent map click propagation
                                // @vis.gl/react-maplibre passes an event-like object; this is safe to attempt
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (e as any)?.originalEvent?.stopPropagation?.();
                                openParcelDetails(parcel.id);
                            }}
                        >
                            <MapPin size={36} color="transparent" fill="var(--primary)" />
                        </Marker>
                    ))}
            </MapLibre>

            {/* Modal */}
            <OrderDetailsModal
                open={detailsOpen}
                order={selectedOrder}
                onClose={closeDetails}
                // only show button if owner == null; modal already handles this
                onTakeOrder={(o) => {
                    // You can reuse your addToCart() logic here if you have it on this page.
                    // For now, just log to show wiring works.
                    console.log("Take order", o.id);
                }}
                formatAddress={formatAddress}
                formatReceiver={formatReceiver}
                formatDeadline={formatDeadline}
            />

            {/* Optional small loading indicator */}
            {loadingDetails && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 border rounded-full px-3 py-1 text-sm shadow">
                    Loading…
                </div>
            )}
        </div>
    );
};

export default Map;
