import React, { useState } from 'react';
import { UserMenu } from './UserMenu';
import type { User } from '@supabase/supabase-js';
import { Save } from 'lucide-react';
import { SavePaletteModal } from './SavePaletteModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showSave, setShowSave] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-blue-500/30">
            <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-linear-to-br from-blue-500 to-purple-500" />
                        <span className="font-bold text-lg tracking-tight">Color Control</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <button
                                onClick={() => setShowSave(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white transition-colors font-medium"
                            >
                                <Save size={16} />
                                Save Palette
                            </button>
                        )}
                        <UserMenu onUserChange={setUser} />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>

            {showSave && user && (
                <SavePaletteModal
                    user={user}
                    onClose={() => setShowSave(false)}
                />
            )}
        </div>
    );
};
