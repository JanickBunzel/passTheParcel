import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    isLoading?: boolean;
    children?: ReactNode;
    className?: string;
};

const LoadingSkeleton = ({ isLoading, children, className }: Props) => {
    if (!isLoading) return children;

    return (
        <span
            className={cn(
                'inline-block rounded-lg bg-accent border border-gray-300',
                'w-20 h-[1.2em] align-middle animate-pulse select-none',
                className
            )}
        />
    );
};

export default LoadingSkeleton;
