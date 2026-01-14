import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useColorStore } from '../store/useColorStore';
import { X } from 'lucide-react';

interface SavePaletteModalProps {
    onClose: () => void;
    user: any;
}

export const SavePaletteModal: React.FC<SavePaletteModalProps> = ({ onClose, user }) => {
    const { baseColors, scaleSteps } = useColorStore();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = {
                baseColors,
                scaleSteps,
            };

            const { error: dbError } = await supabase
                .from('palettes')
                .insert([
                    { user_id: user.id, name, data }
                ]);

            if (dbError) throw dbError;

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Error saving palette');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return createPortal(
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl">
                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Saved!</h3>
                    <p className="text-neutral-400">Your palette has been saved successfully.</p>
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6">Save Palette</h2>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Palette Name</label>
                        <input
                            type="text"
                            required
                            placeholder="My Awesome Palette"
                            className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-white border border-neutral-700 focus:border-blue-500 focus:outline-none transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Palette'}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};
