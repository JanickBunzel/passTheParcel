import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SortableParcel } from '@/lib/types'; // adjust path if needed

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

export type SortOption =
    | 'priceAsc'
    | 'priceDesc'
    | 'distanceAsc'
    | 'distanceDesc'
    | null;

export function sortItems<T extends SortableParcel>(
    items: T[],
    sortBy: SortOption
): T[] {
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