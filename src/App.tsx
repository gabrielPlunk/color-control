import { useEffect } from 'react';
import { PaletteGrid } from './components/PaletteGrid';
import { ScaleConfig } from './components/ScaleConfig';
import { ColorSpaceSelector } from './components/ColorSpaceSelector';
import { CurvePresets } from './components/CurvePresets';
import { OklchAdvancedSettings } from './components/OklchAdvancedSettings';
import { Download } from 'lucide-react';
import { useColorStore } from './store/useColorStore';

// LocalStorage key
const STORAGE_KEY = 'color-control-state';

function App() {
  const { baseColors, scaleSteps, colorSpace, oklchSettings, palette, setBaseColors, setScaleSteps, setColorSpace } = useColorStore();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.baseColors?.length) setBaseColors(data.baseColors);
        if (data.scaleSteps?.length) setScaleSteps(data.scaleSteps);
        if (data.colorSpace) setColorSpace(data.colorSpace);
      } catch (e) {
        console.warn('Failed to load saved palette:', e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    const data = { baseColors, scaleSteps, colorSpace, oklchSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [baseColors, scaleSteps, colorSpace, oklchSettings]);

  // Export JSON function
  const handleExport = () => {
    const exportData: Record<string, Record<string, string>> = {};

    palette.forEach(row => {
      const baseColor = baseColors.find(c => c.id === row.baseColorId);
      const name = baseColor?.name || `color-${row.baseColorId.substring(0, 4)}`;

      exportData[name] = {};
      row.steps.forEach(step => {
        exportData[name][step.stepId] = step.hex;
      });
    });

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-500 to-purple-500" />
          <h1 className="font-bold text-lg tracking-tight">Color Control</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={palette.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors font-medium cursor-pointer"
        >
          <Download size={16} />
          Export JSON
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Curve & Color Space Settings */}
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
          </div>
        </aside>

        {/* Main Content - Palette + Scale Settings Side by Side */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 relative">
          <div className="min-h-full p-8 flex gap-6">
            {/* Palette Grid */}
            <div className="flex-1">
              <PaletteGrid />
            </div>

            {/* Scale Settings - Right of Palette */}
            <div className="w-64 shrink-0">
              <div className="sticky top-4 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Scale Settings</h3>
                <ScaleConfig />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

