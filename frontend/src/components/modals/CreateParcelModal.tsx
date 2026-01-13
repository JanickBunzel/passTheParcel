import { useEffect, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";
import type { Database } from "@/lib/database.types";

/* ---------- types ---------- */
type ParcelInsert = Database["public"]["Tables"]["parcels"]["Insert"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

type Props = {
    open: boolean;
    onClose: () => void;
    ownerId: string;
    ownerAddress: string | null;
};

export default function CreateParcelModal({
                                              open,
                                              onClose,
                                              ownerId,
                                              ownerAddress,
                                          }: Props) {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<AccountRow[]>([]);
    const [addresses, setAddresses] = useState<AddressRow[]>([]);

    const [fromAddress, setFromAddress] = useState<string>(
        ownerAddress ?? ""
    );

    const [form, setForm] = useState<ParcelInsert>({
        destination: "",
        weight: 1,
        description: "",
        type: "NORMAL",
        owner: ownerId,
        sender: ownerId,
        receiver: null,
    });

    /* ---------- load accounts & addresses ---------- */
    useEffect(() => {
        if (!open) return;

        const loadData = async () => {
            const [{ data: acc }, { data: addr }] = await Promise.all([
                supabase.from("accounts").select("id, name, email"),
                supabase.from("addresses").select("*"),
            ]);

            if (acc) setAccounts(acc);
            if (addr) setAddresses(addr);
        };

        loadData();
    }, [open]);

    if (!open) return null;

    /* ---------- submit ---------- */
    const submit = async () => {
        if (!form.destination || !fromAddress) {
            alert("Please select from and destination addresses");
            return;
        }

        setLoading(true);

        /* 1️⃣ create parcel */
        const { data: parcel, error: parcelError } = await supabase
            .from("parcels")
            .insert(form)
            .select()
            .single();

        if (parcelError || !parcel) {
            console.error(parcelError);
            setLoading(false);
            return;
        }

        /* 2️⃣ create initial order */
        const order: OrderInsert = {
            parcel: parcel.id,
            from: fromAddress,
            to: form.destination,
            owner: null,
            next: null,
            started: null,
            finished: null,
        };

        const { error: orderError } = await supabase
            .from("orders")
            .insert(order);

        setLoading(false);

        if (orderError) {
            console.error(orderError);
            alert("Parcel created but order creation failed");
            return;
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Create Parcel</h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* From address */}
                <select
                    className="w-full border rounded-md p-2"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                >
                    <option value="">From address</option>
                    {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                            {addr.street} {addr.house_number},{" "}
                            {addr.city}
                        </option>
                    ))}
                </select>

                {/* Receiver */}
                <select
                    className="w-full border rounded-md p-2"
                    value={form.receiver ?? ""}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            receiver: e.target.value || null,
                        })
                    }
                >
                    <option value="">Receiver (optional)</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name ?? acc.email}
                        </option>
                    ))}
                </select>

                {/* Destination */}
                <select
                    className="w-full border rounded-md p-2"
                    value={form.destination}
                    onChange={(e) =>
                        setForm({ ...form, destination: e.target.value })
                    }
                >
                    <option value="">Destination</option>
                    {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                            {addr.street} {addr.house_number},{" "}
                            {addr.city}
                        </option>
                    ))}
                </select>

                {/* Weight */}
                <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    placeholder="Weight (kg)"
                    value={form.weight}
                    onChange={(e) =>
                        setForm({ ...form, weight: Number(e.target.value) })
                    }
                />

                {/* Type */}
                <select
                    className="w-full border rounded-md p-2"
                    value={form.type}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            type: e.target.value as ParcelInsert["type"],
                        })
                    }
                >
                    <option value="NORMAL">Normal</option>
                    <option value="FRAGILE">Fragile</option>
                    <option value="FOOD">Food</option>
                </select>

                {/* Description */}
                <Textarea
                    placeholder="Description (optional)"
                    value={form.description ?? ""}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? "Creating…" : "Create Parcel"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
