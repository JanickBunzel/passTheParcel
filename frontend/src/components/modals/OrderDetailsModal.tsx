import { X, MapPin, Leaf, QrCode, Package, Clock, User, Euro } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import type { OrderWithParcel } from '@/lib/types';

type Props = {
    open: boolean;
    order: OrderWithParcel | null;
    onClose: () => void;
    onTakeOrder?: (order: OrderWithParcel) => void;

    /** add this */
    currentUserId: string | null;

    formatAddress: (address: any | null | undefined) => string;
    formatReceiver: (parcel: any, receiver: any | null | undefined) => string;
    formatDeadline?: (deadline: any) => string;
};

export default function OrderDetailsModal({
    open,
    order,
    onClose,
    onTakeOrder,
    currentUserId,
    formatAddress,
    formatReceiver,
    formatDeadline,
}: Props) {
    if (!open || !order) return null;

    const parcel = (order as any).parcelData ?? (order as any).parcel ?? null;

    const deadlineText =
        (order as any).deadline != null
            ? formatDeadline
                ? formatDeadline((order as any).deadline)
                : String((order as any).deadline)
            : (order as any).deadlineMs != null && formatDeadline
            ? formatDeadline((order as any).deadlineMs)
            : '—';

    const ownerId = order.owner ?? null;
    const isFinished = order.finished != null;

    const isUnclaimed = ownerId == null;
    const isMine = ownerId != null && currentUserId != null && ownerId === currentUserId;
    const isOther = ownerId != null && currentUserId != null && ownerId !== currentUserId;

    // QR is only shown if:
    // - order is not finished AND (unclaimed OR taken by me)
    const showQr = !isFinished && (isUnclaimed || isMine);

    // CTA/button only when unclaimed
    const showTakeButton = isUnclaimed && !isFinished;

    // Status text rules
    let statusLine: string | null = null;

    if (isFinished) {
        statusLine = isMine ? 'Order completed by you' : 'Order completed by another user';
    } else if (isMine) {
        statusLine = 'Order taken by you';
    } else if (isOther) {
        statusLine = 'Order taken by another user';
    } else {
        statusLine = null; // unclaimed -> no status line, show button instead
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-lg max-h-screen flex flex-col overflow-hidden relative">
                {/* Header: fixed at top */}
                <div
                    className="flex items-center justify-between p-4 border-b shrink-0 bg-white sticky top-0 z-20"
                    style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                >
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Order details</h2>
                    </div>
                    <button onClick={onClose} aria-label="Close">
                        <X />
                    </button>
                </div>

                {/* Scrollable content area, safe for mobile, with enough bottom padding for footer */}
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 sm:pb-8 space-y-4">
                    {/* Status banner (if applicable) */}
                    {statusLine && (
                        <div className="rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-700">{statusLine}</div>
                    )}

                    {/* QR placeholder (only if allowed) */}
                    {showQr && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                                <QrCode className="h-4 w-4" />
                                Pickup / handover QR
                            </div>

                            <div className="w-full aspect-square max-h-50 mx-auto rounded-xl border-2 border-dashed flex items-center justify-center text-gray-500">
                                <img
                                    src="PickupQrCode.png"
                                    alt="PickupQrCode"
                                    className="size-full object-contain opacity-70"
                                />
                            </div>
                        </div>
                    )}

                    {/* Key info */}
                    <div className="space-y-2 text-sm text-gray-800">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                                <div>
                                    <span className="font-medium">From:</span>{' '}
                                    {formatAddress((order as any).fromAddress)}
                                </div>
                                <div>
                                    <span className="font-medium">To:</span> {formatAddress((order as any).toAddress)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                                <span className="font-medium">Receiver:</span>{' '}
                                {formatReceiver(parcel, (order as any).receiver)}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                                <span className="font-medium">Deadline:</span> {deadlineText}
                            </div>
                        </div>

                        {parcel?.description && (
                            <div className="pt-2">
                                <div className="font-medium">Description</div>
                                <div className="text-gray-600">{parcel.description}</div>
                            </div>
                        )}
                    </div>

                    {/* Metrics */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-gray-500">Weight</div>
                                    <div className="font-semibold">{parcel?.weight ?? '—'} g</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Distance</div>
                                    <div className="font-semibold">{(order as any).distanceKm ?? '—'} km</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 flex items-center gap-1">
                                        <Leaf className="h-4 w-4" /> CO₂ saved
                                    </div>
                                    <div className="font-semibold">{(order as any).co2 ?? '—'} g</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 flex items-center gap-1">
                                        <Euro className="h-4 w-4" /> Reward
                                    </div>
                                    <div className="font-semibold">€{Number((order as any).price ?? 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* When taken by you (and not finished), show a non-action info row instead of button */}
                    {!showTakeButton && !isFinished && isMine && (
                        <div className="text-sm text-gray-600 text-center">You have already taken this order.</div>
                    )}
                </div>

                {/* Footer: fixed at bottom, always accessible, safe-area aware */}
                <div className="fixed left-0 right-0 bottom-0 z-30 w-full max-w-lg mx-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+80px)] pt-2 bg-gradient-to-t from-white via-white/90 to-white/0 sm:static sm:bg-none sm:p-0">
                    {showTakeButton && (
                        <Button className="w-full h-12 text-base" onClick={() => onTakeOrder?.(order)}>
                            Take order
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
