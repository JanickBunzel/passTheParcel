import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
