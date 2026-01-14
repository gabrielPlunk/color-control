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
    { id: '160', name: '160', targetContrastWhite: 1.08 },
    { id: '150', name: '150', targetContrastWhite: 1.24 },
    { id: '140', name: '140', targetContrastWhite: 1.48 },
    { id: '130', name: '130', targetContrastWhite: 1.76 },
    { id: '120', name: '120', targetContrastWhite: 2.12 },
    { id: '110', name: '110', targetContrastWhite: 2.56 },
    { id: '100', name: '100', targetContrastWhite: 3.08 },
    { id: '90', name: '90', targetContrastWhite: 3.80 },
    { id: '80', name: '80', targetContrastWhite: 4.72 },
    { id: '70', name: '70', targetContrastWhite: 5.72 },
    { id: '60', name: '60', targetContrastWhite: 6.92 },
    { id: '50', name: '50', targetContrastWhite: 8.36 },
    { id: '40', name: '40', targetContrastWhite: 10.16 },
    { id: '30', name: '30', targetContrastWhite: 12.08 },
    { id: '20', name: '20', targetContrastWhite: 14.44 },
    { id: '10', name: '10', targetContrastWhite: 16.44 },
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
        range: { min: 0.01, max: 0.2 },
        curveType: 'exponential',
        direction: 'ease-out',
    },
    hue: {
        range: { min: 0, max: 0 }, // 0 = no hue shift by default
        curveType: 'linear',
        direction: 'ease-in-out',
    },
};

