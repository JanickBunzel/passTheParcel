import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2, SquareArrowOutUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/card';
import { Button } from '@/shadcn/button';
import { Label } from '@/shadcn/label';
import { Input } from '@/shadcn/input';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
    const { login, user, authLoading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // If auth isnt loading and there is an active user session, redirect to dashboard
        if (!authLoading && user) {
            void router.navigate({ to: '/' });
        }
    }, [user, authLoading, router]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError('');

        const { error } = await login({ email, password });

        if (error) {
            setError(error);
        } else {
            void router.navigate({ to: '/' });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col gap-10 items-center pt-[20vh]">
            {import.meta.env.DEV && (
                <Button
                    variant="outline"
                    className="fixed bottom-4 left-4"
                    onClick={() => {
                        setEmail('testuser@example.com');
                        setPassword('Test1234!');
                    }}
                >
                    TestUser1 <SquareArrowOutUpRight />
                </Button>
            )}

            <h1 className="mb-8 uppercase text-primary text-4xl font-bold">PassTheParcel</h1>
            <Card className="w-96 shadow-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                required
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    required
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="size-7 opacity-50 absolute right-1 top-1 bottom-1"
                                    title={showPassword ? 'Hide Password' : 'Show Password'}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </Button>
                            </div>
                        </div>

                        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

                        <Button type="submit" className="w-full font-bold" disabled={authLoading || isSubmitting}>
                            {authLoading ? (
                                <>
                                    <span>Logging in...</span>
                                    <Loader2 className="animate-spin" />
                                </>
                            ) : (
                                <span>Submit</span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
