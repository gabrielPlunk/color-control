import { create } from 'zustand';
import type { BaseColor, ScaleStep, PaletteResult, OklchSettings, ChannelCurve } from '../types';
import { DEFAULT_SCALES, DEFAULT_OKLCH_SETTINGS } from '../types';
import { generatePalette } from '../utils/colorUtils';
import { distributeContrasts, type CurveType, type ContrastRange } from '../utils/curveUtils';

export type ColorSpaceMode = 'lch' | 'oklch';

interface ColorState {
    baseColors: BaseColor[];
    scaleSteps: ScaleStep[];
    palette: PaletteResult[];
    colorSpace: ColorSpaceMode;
    curveType: CurveType;
    contrastRange: ContrastRange;
    oklchSettings: OklchSettings;

    addBaseColor: (hex: string) => void;
    removeBaseColor: (id: string) => void;
    updateBaseColor: (id: string, hex: string) => void;
    toggleBaseOpacity: (id: string) => void;

    addScaleStep: () => void;
    removeScaleStep: (id: string) => void;
    updateScaleStep: (id: string, updates: Partial<ScaleStep>) => void;
    resetScales: () => void;
    setScaleSteps: (steps: ScaleStep[]) => void;
    setColorSpace: (mode: ColorSpaceMode) => void;

    setCurveType: (type: CurveType) => void;
    setContrastRange: (range: ContrastRange) => void;
    applyContrastCurve: () => void;

    setBaseColors: (colors: BaseColor[]) => void;

    // OKLCH Advanced Settings
    setOklchChromaCurve: (curve: ChannelCurve) => void;
    setOklchHueCurve: (curve: ChannelCurve) => void;
}

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substring(2, 9);

export const useColorStore = create<ColorState>((set) => ({
    baseColors: [],
    scaleSteps: DEFAULT_SCALES,
    palette: [],
    colorSpace: 'lch',
    curveType: 'linear',
    contrastRange: { min: 1.1, max: 15 },
    oklchSettings: DEFAULT_OKLCH_SETTINGS,

    addBaseColor: (hex) => {
        const newColor: BaseColor = {
            id: generateId(),
            hex,
            name: 'New Color',
            locked: false,
            useOpacity: false,
        };

        set((state) => {
            const newBaseColors = [...state.baseColors, newColor];
            return {
                baseColors: newBaseColors,
                palette: generatePalette(newBaseColors, state.scaleSteps, state.colorSpace, state.oklchSettings),
            };
        });
    },

    removeBaseColor: (id) => {
        set((state) => {
            const newBaseColors = state.baseColors.filter((c) => c.id !== id);
            return {
                baseColors: newBaseColors,
                palette: generatePalette(newBaseColors, state.scaleSteps, state.colorSpace, state.oklchSettings),
            };
        });
    },

    updateBaseColor: (id, hex) => {
        set((state) => {
            const newBaseColors = state.baseColors.map((c) =>
                c.id === id ? { ...c, hex } : c
            );
            return {
                baseColors: newBaseColors,
                palette: generatePalette(newBaseColors, state.scaleSteps, state.colorSpace, state.oklchSettings),
            };
        });
    },

    toggleBaseOpacity: (id) => {
        set((state) => {
            const newBaseColors = state.baseColors.map((c) =>
                c.id === id ? { ...c, useOpacity: !c.useOpacity } : c
            );
            return {
                baseColors: newBaseColors,
                palette: generatePalette(newBaseColors, state.scaleSteps, state.colorSpace, state.oklchSettings),
            };
        });
    },

    addScaleStep: () => {
        set((state) => {
            // Find next logic name? e.g. interpolate or just append "New".
            // Simple: just append.
            if (state.scaleSteps.length >= 20) return state; // Limit to 20 as requested

            const newStep: ScaleStep = {
                id: generateId(),
                name: 'New',
                targetContrastWhite: null
            };
            const newScales = [...state.scaleSteps, newStep];
            return {
                scaleSteps: newScales,
                palette: generatePalette(state.baseColors, newScales, state.colorSpace, state.oklchSettings),
            };
        });
    },

    removeScaleStep: (id) => {
        set((state) => {
            if (state.scaleSteps.length <= 1) return state; // Prevent empty
            const newScales = state.scaleSteps.filter(s => s.id !== id);
            return {
                scaleSteps: newScales,
                palette: generatePalette(state.baseColors, newScales, state.colorSpace, state.oklchSettings),
            };
        });
    },

    updateScaleStep: (id, updates) => {
        set((state) => {
            const newScales = state.scaleSteps.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            );
            return {
                scaleSteps: newScales,
                palette: generatePalette(state.baseColors, newScales, state.colorSpace, state.oklchSettings),
            };
        });
    },

    resetScales: () => {
        set((state) => ({
            scaleSteps: DEFAULT_SCALES,
            palette: generatePalette(state.baseColors, DEFAULT_SCALES, state.colorSpace, state.oklchSettings)
        }));
    },

    setScaleSteps: (steps) => {
        set((state) => ({
            scaleSteps: steps,
            palette: generatePalette(state.baseColors, steps, state.colorSpace, state.oklchSettings)
        }));
    },

    setBaseColors: (colors) => {
        set((state) => ({
            baseColors: colors,
            palette: generatePalette(colors, state.scaleSteps, state.colorSpace, state.oklchSettings)
        }));
    },

    setColorSpace: (mode) => {
        set((state) => ({
            colorSpace: mode,
            palette: generatePalette(state.baseColors, state.scaleSteps, mode, state.oklchSettings)
        }));
    },

    setCurveType: (type) => {
        set({ curveType: type });
    },

    setContrastRange: (range) => {
        set({ contrastRange: range });
    },

    applyContrastCurve: () => {
        set((state) => {
            const contrasts = distributeContrasts(
                state.scaleSteps.length,
                state.contrastRange,
                state.curveType
            );

            const newSteps = state.scaleSteps.map((step, index) => ({
                ...step,
                targetContrastWhite: contrasts[index]
            }));

            return {
                scaleSteps: newSteps,
                palette: generatePalette(state.baseColors, newSteps, state.colorSpace, state.oklchSettings)
            };
        });
    },

    setOklchChromaCurve: (curve) => {
        set((state) => {
            const newSettings = { ...state.oklchSettings, chroma: curve };
            return {
                oklchSettings: newSettings,
                palette: generatePalette(state.baseColors, state.scaleSteps, state.colorSpace, newSettings)
            };
        });
    },

    setOklchHueCurve: (curve) => {
        set((state) => {
            const newSettings = { ...state.oklchSettings, hue: curve };
            return {
                oklchSettings: newSettings,
                palette: generatePalette(state.baseColors, state.scaleSteps, state.colorSpace, newSettings)
            };
        });
    },
}));
