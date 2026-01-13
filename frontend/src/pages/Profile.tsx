import { Card } from '../components/shadcn/card';
import { Button } from '../components/shadcn/button';
import { Avatar, AvatarFallback } from '../components/shadcn/avatar';
import { Leaf, Package, Award, Euro, Lock, User } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { toast } from 'sonner';

const badges = [
    { name: 'First Delivery', icon: Package, unlocked: true },
    { name: 'Eco Hero', icon: Leaf, unlocked: true },
    { name: '10 Deliveries', icon: Award, unlocked: true },
    { name: 'CO₂ Saver', icon: Leaf, unlocked: false },
    { name: '50 Deliveries', icon: Package, unlocked: false },
    { name: 'Top Courier', icon: Award, unlocked: false },
];

const Profile = () => {
    const { account } = useAccount();

    const initials = account?.name
        ? account.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : null;

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="bg-linear-to-b from-primary/10 to-background px-6 pt-8 pb-6">
                <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 border-4 border-card shadow-lg">
                        <AvatarFallback className="text-2xl text-white bg-primary">
                            {initials ? initials : <User className="size-4" />}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm opacity-80 italic mt-1 text-primary">
                            Member since{' '}
                            {account?.created_at
                                ? new Date(account.created_at).toLocaleString('en-US', {
                                      month: 'short',
                                      year: 'numeric',
                                  })
                                : ''}
                        </p>
                        <h1 className="text-2xl font-bold text-foreground">{account?.name || 'User'}</h1>
                        <p className="text-sm text-muted-foreground">{account?.email}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-5 border-2 bg-linear-to-br from-primary/5 to-primary/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-3">
                                <Leaf className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">CO₂ Saved</p>
                            <p className="text-2xl font-bold text-primary">14.2 kg</p>
                        </div>
                    </Card>
                    <Card className="p-5 border-2 bg-linear-to-br from-accent/5 to-accent/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-3">
                                <Package className="w-6 h-6 text-accent" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Deliveries</p>
                            <p className="text-2xl font-bold text-accent">12</p>
                        </div>
                    </Card>
                    <Card className="p-5 border-2 bg-linear-to-br from-primary/5 to-accent/5">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Green Points</p>
                            <p className="text-2xl font-bold text-primary">390</p>
                        </div>
                    </Card>
                    <Card className="p-5 border-2 bg-linear-to-br from-accent/5 to-accent/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-3">
                                <Euro className="w-6 h-6 text-accent" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Earned</p>
                            <p className="text-2xl font-bold text-accent">€36.50</p>
                        </div>
                    </Card>
                </div>

                {/* Badges */}
                <Card className="p-5 border-2">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Your Badges
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {badges.map((badge, index) => (
                            <div
                                key={index}
                                className={`flex flex-col items-center text-center ${
                                    !badge.unlocked ? 'opacity-40' : ''
                                }`}
                            >
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${
                                        badge.unlocked
                                            ? 'bg-primary/20 shadow-md'
                                            : 'bg-muted border-2 border-dashed border-border'
                                    }`}
                                >
                                    {badge.unlocked ? (
                                        <badge.icon className="w-7 h-7 text-primary" />
                                    ) : (
                                        <Lock className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>
                                <p className="text-xs font-medium text-foreground leading-tight">{badge.name}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Payout */}
                <Card className="p-5 border-2 bg-linear-to-br from-accent/5 to-accent/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                            <p className="text-3xl font-bold text-foreground flex items-center gap-1">
                                <Euro className="w-6 h-6" />
                                36.50
                            </p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() =>
                            toast(
                                <div className="flex items-center gap-3">
                                    <Euro className="w-6 h-6 text-accent" />
                                    <div className="flex flex-col">
                                        <span>
                                            Sending <span className="font-bold">€36.50</span> to your bank account...
                                        </span>
                                        <span className="text-xs text-muted-foreground opacity-75">
                                            This may take a few minutes.
                                        </span>
                                    </div>
                                </div>,
                                { duration: 2000 }
                            )
                        }
                    >
                        Request Payout
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
