import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Textarea } from '@/components/shadcn/textarea';
import { useAccountsQuery } from '@/api/accounts.api';
import { useAddressesQuery } from '@/api/addresses.api';
import { useCreateParcelAndOrderMutation } from '@/api/parcels.api';
import { useAccount } from '@/contexts/AccountContext';
import { X } from 'lucide-react';
import type { OrderInsert, ParcelInsert } from '@/lib/types';

type Props = {
    open: boolean;
    onClose: () => void;
    ownerId: string;
    ownerAddress: string | null;
};

export default function CreateParcelModal({ open, onClose, ownerId, ownerAddress }: Props) {
    const [loading, setLoading] = useState(false);
    const createParcelAndOrderMutation = useCreateParcelAndOrderMutation();
    const { account } = useAccount();
    const { data: accounts = [] } = useAccountsQuery();
    const { data: addresses = [] } = useAddressesQuery();

    const [fromAddress, setFromAddress] = useState<string>(ownerAddress ?? '');

    // Receiver is REQUIRED now: initialize as empty string (invalid until selected)
    const [form, setForm] = useState<ParcelInsert>({
        destination: '',
        weight: 0.1,
        description: '',
        type: 'NORMAL',
        owner: account?.id ?? '',
        sender: account?.id ?? '',
        receiver: '', // required
        // lat/lng will be set at submit time
    });

    useEffect(() => {
        // Update owner/sender if account changes
        setForm((prev) => ({ ...prev, owner: account?.id ?? '', sender: account?.id ?? '' }));
    }, [account?.id]);

    if (!open) return null;

    /* ---------- submit ---------- */
    const submit = async () => {
        if (!fromAddress || !form.destination || !form.receiver) {
            alert('Please select receiver, from address, and destination.');
            return;
        }

        if (!form.weight || form.weight <= 0) {
            alert('Please enter a valid weight.');
            return;
        }

        setLoading(true);

        // 🔍 find selected "from" address
        const fromAddr = addresses.find((a) => a.id === fromAddress);

        if (!fromAddr || !fromAddr.geodata) {
            alert('Selected from address has no geodata.');
            setLoading(false);
            return;
        }

        // 📍 extract lat/lng from geodata
        const { lat, lng } = typeof fromAddr.geodata === 'string' ? JSON.parse(fromAddr.geodata) : fromAddr.geodata;

        // 1️⃣ create parcel and order using mutation
        const parcelPayload: ParcelInsert = {
            ...form,
            lat,
            lng,
        };
        const orderPayload: OrderInsert = {
            parcel: '', // will be set in mutation
            from: fromAddress,
            to: form.destination,
            owner: null,
            next: null,
            started: null,
            finished: null,
        };

        try {
            await createParcelAndOrderMutation.mutateAsync({ parcel: parcelPayload, order: orderPayload });
            setLoading(false);
            onClose();
        } catch (error) {
            setLoading(false);
            alert('Parcel or order creation failed');
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 pb-24 space-y-4 overflow-y-auto max-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Create Parcel</h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* From address */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">From address</label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                    >
                        <option value="">Select from address</option>
                        {addresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                                {addr.street} {addr.house_number}, {addr.city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Receiver (required) */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Receiver</label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={form.receiver ?? ''}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                receiver: e.target.value,
                            })
                        }
                    >
                        <option value="">Select receiver</option>
                        {accounts
                            .filter((acc) => acc.id !== ownerId) // optional: avoid selecting yourself
                            .map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name ?? acc.email}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Destination</label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={form.destination}
                        onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    >
                        <option value="">Select destination</option>
                        {addresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                                {addr.street} {addr.house_number}, {addr.city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Weight (kg) */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Weight</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={form.weight}
                            onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                        />
                        <span className="text-sm text-gray-600 w-10">kg</span>
                    </div>
                </div>

                {/* Type */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select
                        className="w-full border rounded-md p-2"
                        value={form.type}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                type: e.target.value as ParcelInsert['type'],
                            })
                        }
                    >
                        <option value="NORMAL">Normal</option>
                        <option value="FRAGILE">Fragile</option>
                        <option value="FOOD">Food</option>
                    </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                    <Textarea
                        placeholder="E.g. Small book, keys, ..."
                        value={form.description ?? ''}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? 'Creating…' : 'Create Parcel'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
