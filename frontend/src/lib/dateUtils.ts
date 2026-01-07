import { format } from 'date-fns';

/** Returns date as "YYYY-MM-DD" */
export function toDateOnlyString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Returns date as ie "Monday, 01 January" */
export function toReadableDate(date: Date | null | undefined, locale: string, fallback: string = ''): string {
    if (!date) return fallback || '-';

    return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    });
}

/** Returns date as 'dd/MM/yy' ('01/01/24') or custom formatStr */
export function dateDisplay(date?: string | null, formatStr?: string): string {
    if (!date) return '-';

    return format(new Date(date), formatStr || 'dd/MM/yy');
}
