import type { Database } from '@/lib/database.types';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type ParcelRow = Database['public']['Tables']['parcels']['Row'];
type AddressRow = Database['public']['Tables']['addresses']['Row'];
type UserRow = Database['public']['Tables']['accounts']['Row'];

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
        price: number;     // ✅ MUST be required
        co2: number;
    };
