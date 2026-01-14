import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password
                });
                if (error) throw error;
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {(!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) && (
                    <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg text-sm mb-4 border border-yellow-500/20">
                        <strong>Configuration Missing:</strong> Supabase keys not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-white border border-neutral-700 focus:border-blue-500 focus:outline-none transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-white border border-neutral-700 focus:border-blue-500 focus:outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-colors"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-neutral-900 text-neutral-500">Or continue with</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={async () => {
                        setLoading(true);
                        const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: window.location.origin
                            }
                        });
                        if (error) {
                            setError(error.message);
                            setLoading(false);
                        }
                        // Note: OAuth will redirect, so no need to stop loading or close modal explicitly on success
                    }}
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center gap-2 rounded-lg py-2 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Sign in with Google
                </button>

                <div className="mt-6 text-center text-sm text-neutral-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="text-blue-400 hover:underline"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
