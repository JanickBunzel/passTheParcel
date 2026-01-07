import { Input } from '@/components/shadcn/input';
import { cn } from '@/lib/utils';

type Props = {
    amountCents?: number;
    setAmountCents: (amountCents?: number) => void;
    placeholder?: string;
    disabled?: boolean;
    inputClassName?: string;
};

const EuroInput = ({ amountCents, setAmountCents, placeholder, disabled, inputClassName }: Props) => {
    return (
        <div className="flex items-center gap-2">
            <Input
                type="text"
                pattern="[0-9]*"
                step={1}
                placeholder={placeholder ?? 'Select amount'}
                className={cn('bg-accent cursor-text', !!amountCents && 'font-medium', inputClassName)}
                value={amountCents !== undefined ? String(Math.floor(amountCents / 100)) : ''}
                disabled={disabled}
                onChange={(e) => {
                    const value = e.target.value;
                    // Allow only whole numbers
                    if (value === '') {
                        setAmountCents(undefined);
                    } else if (/^\d+$/.test(value)) {
                        setAmountCents(Number(value) * 100);
                    }
                }}
            />
            <p className="shrink-0 text-sm">,00 €</p>
        </div>
    );
};

export default EuroInput;
