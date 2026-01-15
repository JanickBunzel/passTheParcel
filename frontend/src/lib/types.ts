import type { Database } from '@/lib/database.types';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type ParcelRow = Database['public']['Tables']['parcels']['Row'];
export type AddressRow = Database['public']['Tables']['addresses']['Row'];
export type UserRow = Database['public']['Tables']['accounts']['Row'];

export type SortableParcel = {
    id: string;
    price?: number;
    distanceKm?: number;
    co2?: number;
    type?: string;
};

export type OrderWithParcel = OrderRow &
    SortableParcel & {
        parcelData: ParcelRow;
        fromAddress: AddressRow | null;
        toAddress: AddressRow | null;
        receiver: UserRow | null;
        distanceKm: number;
        price: number; // ✅ MUST be required
        co2: number;
        deadline: number;
    };
