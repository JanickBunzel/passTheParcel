import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AccountRow, AddressRow, ParcelRow, SortableParcel } from '@/lib/types'; // adjust path if needed

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Returns ie 5500 to 55,00 €
export function formatCentsToEuroString(cents?: number | null): string {
    return ((cents || 0) / 100).toLocaleString('it-IT', {
        style: 'currency',
        currency: 'EUR',
    });
}

export type SortOption = 'priceAsc' | 'priceDesc' | 'distanceAsc' | 'distanceDesc' | null;

export function sortItems<T extends SortableParcel>(items: T[], sortBy: SortOption): T[] {
    if (!sortBy) return items;

    return [...items].sort((a, b) => {
        switch (sortBy) {
            case 'priceAsc':
                return (a.price ?? 0) - (b.price ?? 0);
            case 'priceDesc':
                return (b.price ?? 0) - (a.price ?? 0);
            case 'distanceAsc':
                return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
            case 'distanceDesc':
                return (b.distanceKm ?? 0) - (a.distanceKm ?? 0);
            default:
                return 0;
        }
    });
}

// Address display helper
export function formatAddress(address?: AddressRow | null) {
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

export function formatReceiver(_parcel: ParcelRow, receiver: AccountRow): string {
    return receiver.name?.trim() || receiver.email || 'Unknown receiver';
}

export function formatDeadline(ms: number): string {
    return new Date(ms).toLocaleString(undefined, {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}
