import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2, SquareArrowOutUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { isDev, SHOW_TEST_USER_LOGINS } from '@/lib/env';
import { router } from '@/lib/router';

type TestUserLogin = {
    label: string;
    email: string;
    password: string;
};
const TEST_USERS: TestUserLogin[] = [
    { label: 'Alice Example', email: 'alice@example.com', password: '123' },
    { label: 'Bob Example', email: 'bob@example.com', password: '123' },
    { label: 'Carla Example', email: 'carla@example.com', password: '123' },
];

const Login = () => {
    const { user, login, authLoading } = useAuth();
    const { account, accountLoading } = useAccount();

    useEffect(() => {
        // If auth isnt loading and there is an active session, redirect to index
        if (!authLoading && user && !accountLoading && account) {
            void router.navigate({ to: '/' });
        }
    }, [user, authLoading, account, accountLoading]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setError('');

        login({ email, password }).then(({ error }) => {
            if (error) setError(error);
        });
    };

    const loginLoading = authLoading || accountLoading;

    return (
        <div className="h-screen flex flex-col gap-10 items-center justify-center px-4 sm:px-0 pb-24">
            {(isDev || SHOW_TEST_USER_LOGINS) && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap">
                    {TEST_USERS.map((user) => (
                        <Button
                            key={user.label}
                            variant="outline"
                            onClick={() => {
                                setEmail(user.email);
                                setPassword(user.password);
                            }}
                        >
                            {user.label} <SquareArrowOutUpRight />
                        </Button>
                    ))}
                </div>
            )}

            <h1 className="mb-8 uppercase text-primary text-center text-4xl font-bold">Pass The Parcel</h1>

            <Card className="sm:w-96 shadow-md py-6 px-0 gap-2 rounded-xl">
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
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </Button>
                            </div>
                        </div>

                        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

                        <Button type="submit" className="w-full font-bold" disabled={loginLoading}>
                            {loginLoading ? (
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
};

export default Login;
