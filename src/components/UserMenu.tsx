import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { UserCircle, LogOut } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const UserMenu: React.FC<{ onUserChange: (user: User | null) => void }> = ({ onUserChange }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            onUserChange(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            onUserChange(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [onUserChange]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <>
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400 hidden md:inline">{user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-red-400 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAuth(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-white transition-colors"
                    >
                        <UserCircle size={16} />
                        <span>Login / Sign Up</span>
                    </button>
                )}
            </div>

            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onSuccess={() => setShowAuth(false)}
                />
            )}
        </>
    );
};
