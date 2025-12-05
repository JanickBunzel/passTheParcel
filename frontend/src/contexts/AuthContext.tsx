import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type AuthContext = {
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    login: (opts: { email: string; password: string }) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            setAuthLoading(true);
            const { data, error } = await supabase.auth.getSession();
            if (!isMounted) return;

            if (error) {
                console.error('Error getting session', error);
            } else {
                setSession(data.session);
                setUser(data.session?.user ?? null);
            }
            setAuthLoading(false);
        };

        void init();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!isMounted) return;

            setSession(newSession);
            setUser(newSession?.user ?? null);
        });

        return () => {
            isMounted = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    const login: AuthContext['login'] = async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Sign-in error', error);
            return { error: error.message };
        }

        return { error: null };
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) console.error('Sign-out error', error);
    };

    const contextValue: AuthContext = {
        user,
        session,
        authLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={contextValue} children={children} />;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
