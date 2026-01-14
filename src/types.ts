export interface BaseColor {
    id: string;
    hex: string;
    name: string;
    locked: boolean;
    useOpacity?: boolean;
}

export interface ScaleStep {
    id: string; // e.g., '100', '200' or uuid
    name: string;
    targetContrastWhite: number | null; // e.g., 4.5. null if ignored.
}

export interface PaletteResult {
    baseColorId: string;
    steps: PalettestepResult[];
}

export interface PalettestepResult {
    stepId: string;
    hex: string;
    lch: [number, number, number];
    contrastWhite: number;
    contrastBlack: number;
    isBaseParams?: boolean; // if this is the original base color (closest match)
}

export const DEFAULT_SCALES: ScaleStep[] = [
    { id: '50', name: '50', targetContrastWhite: null },
    { id: '100', name: '100', targetContrastWhite: null },
    { id: '200', name: '200', targetContrastWhite: null },
    { id: '300', name: '300', targetContrastWhite: null },
    { id: '400', name: '400', targetContrastWhite: null },
    { id: '500', name: '500', targetContrastWhite: null },
    { id: '600', name: '600', targetContrastWhite: null },
    { id: '700', name: '700', targetContrastWhite: null },
    { id: '800', name: '800', targetContrastWhite: null },
    { id: '900', name: '900', targetContrastWhite: null },
];

// Advanced OKLCH curve types
export type AdvancedCurveType = 'linear' | 'quadratic' | 'cubic' | 'sine' | 'exponential';
export type EasingDirection = 'ease-in' | 'ease-out' | 'ease-in-out';

export interface ChannelCurve {
    range: { min: number; max: number };
    curveType: AdvancedCurveType;
    direction: EasingDirection;
}

export interface OklchSettings {
    chroma: ChannelCurve;
    hue: ChannelCurve;
}

export const DEFAULT_OKLCH_SETTINGS: OklchSettings = {
    chroma: {
        range: { min: 0.05, max: 0.15 },
        curveType: 'linear',
        direction: 'ease-out',
    },
    hue: {
        range: { min: 0, max: 0 }, // 0 = no hue shift by default
        curveType: 'linear',
        direction: 'ease-in-out',
    },
};
