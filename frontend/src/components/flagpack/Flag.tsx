import { cn } from '@/lib/utils';
import './flag.css';

type Props = {
    countryCode: string;
    onClick?: () => void;
    size?: 's' | 'm' | 'l';
    gradient?: '' | 'top-down' | 'real-circular' | 'real-linear';
    hasBorder?: boolean;
    hasDropShadow?: boolean;
    hasBorderRadius?: boolean;
    className?: string;
};

const Flag = ({
    countryCode = 'GBR',
    onClick,
    size = 'm',
    gradient = 'real-linear',
    hasBorder = true,
    hasDropShadow = true,
    hasBorderRadius = true,
    className,
}: Props) => {
    const classes = [
        'flag',
        `size-${size}`,
        gradient,
        hasBorder ? 'border' : '',
        hasDropShadow ? 'drop-shadow' : '',
        hasBorderRadius ? 'border-radius' : '',
    ];

    return (
        <div className={cn(classes.filter(Boolean).join(' '), className)} onClick={onClick}>
            <img
                src={new URL(`../../assets/flags/${countryCode}.svg`, import.meta.url).href}
                alt={`Flag of ${countryCode}`}
                onError={(e) => {
                    // Hide the image if it fails to load
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
};

export default Flag;
