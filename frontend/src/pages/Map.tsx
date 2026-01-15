import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Locate, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Map as MapLibre, type MapRef, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useParcelsQuery } from '@/api/parcels.api';

const Map = () => {
    const mapRef = useRef<MapRef | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const { data: parcels = [] } = useParcelsQuery();

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
    const zoom = (direction: 'in' | 'out') => {
        const map = mapRef.current;
        if (!map) return;
        const current = typeof map.getZoom === 'function' ? map.getZoom() : undefined;
        if (current == null) return;
        const next = direction === 'in' ? Math.min(current + 1, MAX_ZOOM) : Math.max(current - 1, MIN_ZOOM);
        map.flyTo({ zoom: next, duration: 300 });
    };

    return (
        <div className="relative size-full">
            <div className="flex gap-1 absolute top-2 left-2 right-2 z-50">
                <Button variant="outline" onClick={() => zoom('in')}>
                    <ZoomIn />
                </Button>
                <Button variant="outline" onClick={() => zoom('out')}>
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
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=IXFb3VpnbYogHluMPMN7"
                attributionControl={false}
            >
                {parcels
                    .filter((parcel) => !!parcel.lat && !!parcel.lng)
                    .map((parcel) => (
                        <Marker
                            longitude={parcel.lng!}
                            latitude={parcel.lat!}
                            anchor="bottom"
                            key={parcel.id}
                            className="cursor-pointer"
                            onClick={() => console.log('Clicked parcel', parcel.id)}
                        >
                            <MapPin size={36} color="transparent" fill="var(--primary)" />
                        </Marker>
                    ))}
            </MapLibre>
        </div>
    );
};

export default Map;
