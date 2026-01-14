import { useState, useEffect } from 'react';
import { PaletteGrid } from './components/PaletteGrid';
import { ExportPanel } from './components/ExportPanel';
import { ScaleConfig } from './components/ScaleConfig';
import { ColorSpaceSelector } from './components/ColorSpaceSelector';
import { CurvePresets } from './components/CurvePresets';
import { OklchAdvancedSettings } from './components/OklchAdvancedSettings';
import { UserMenu } from './components/UserMenu';
import { SavePaletteModal } from './components/SavePaletteModal';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Save } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-blue-500/30">
      <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-500 to-purple-500" />
          <h1 className="font-bold text-lg tracking-tight">Color Control</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white transition-colors font-medium cursor-pointer"
            >
              <Save size={14} />
              Save Palette
            </button>
          )}
          <UserMenu onUserChange={setUser} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Controls */}
        <aside className="w-72 border-r border-neutral-800 bg-neutral-900/30 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 space-y-6">
            <section>
              <ColorSpaceSelector />
            </section>

            {/* OKLCH Advanced Settings (only visible when OKLCH selected) */}
            <OklchAdvancedSettings />

            <div className="w-full h-px bg-neutral-800" />

            <section>
              <CurvePresets />
            </section>

            <div className="w-full h-px bg-neutral-800" />

            <section>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Scale Settings</h3>
              <ScaleConfig />
            </section>

            <div className="w-full h-px bg-neutral-800" />

            <section>
              <ExportPanel />
            </section>
          </div>
        </aside>

        {/* Main Content - Preview */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 relative">
          <div className="min-h-full p-8">
            <PaletteGrid />
          </div>
        </main>
      </div>

      {showSaveModal && user && (
        <SavePaletteModal
          user={user}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}

export default App;
