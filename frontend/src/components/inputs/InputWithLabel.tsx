import { cn } from '@/lib/utils';

type Props = {
    label: string;
    required?: boolean;
    input: React.ReactNode;
    className?: string;
};

const InputWithLabel = ({ label, required = true, input, className }: Props) => {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <p className="flex items-center gap-1 font-normal text-muted-foreground text-sm leading-none">
                {label}
                {required && <span className="text-destructive">*</span>}
            </p>
            {input}
        </div>
    );
};

export default InputWithLabel;
