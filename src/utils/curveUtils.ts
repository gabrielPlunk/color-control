import type { AdvancedCurveType, EasingDirection, ChannelCurve } from '../types';

// Curve types for contrast distribution
export type CurveType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface ContrastRange {
    min: number;
    max: number;
}

// Easing functions: map t (0-1) to output (0-1)
export const easingFunctions: Record<CurveType, (t: number) => number> = {
    'linear': (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => 1 - Math.pow(1 - t, 2),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

// Advanced curve functions for OKLCH channels
export const advancedCurveFunctions: Record<AdvancedCurveType, (t: number) => number> = {
    'linear': (t) => t,
    'quadratic': (t) => t * t,
    'cubic': (t) => t * t * t,
    'sine': (t) => 1 - Math.cos((t * Math.PI) / 2),
    'exponential': (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
};

// Apply easing direction to a base curve function
const applyDirection = (
    baseFn: (t: number) => number,
    direction: EasingDirection
): ((t: number) => number) => {
    switch (direction) {
        case 'ease-in':
            return baseFn;
        case 'ease-out':
            return (t) => 1 - baseFn(1 - t);
        case 'ease-in-out':
            return (t) => t < 0.5
                ? baseFn(t * 2) / 2
                : 1 - baseFn((1 - t) * 2) / 2;
        default:
            return baseFn;
    }
};

// Interpolate a value based on channel curve settings
export const interpolateChannel = (
    t: number, // normalized position 0-1
    curve: ChannelCurve
): number => {
    const baseFn = advancedCurveFunctions[curve.curveType];
    const easedFn = applyDirection(baseFn, curve.direction);
    const easedT = easedFn(t);

    // Map to range
    return curve.range.min + (curve.range.max - curve.range.min) * easedT;
};

// Get curve points for visualization
export const getAdvancedCurvePoints = (
    curve: ChannelCurve,
    pointCount: number = 20
): { x: number; y: number }[] => {
    const baseFn = advancedCurveFunctions[curve.curveType];
    const easedFn = applyDirection(baseFn, curve.direction);
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= pointCount; i++) {
        const t = i / pointCount;
        const y = easedFn(t);
        points.push({ x: t, y });
    }

    return points;
};

// Labels for advanced curve types
export const advancedCurveTypeLabels: Record<AdvancedCurveType, string> = {
    'linear': 'Linear',
    'quadratic': 'Quadratic',
    'cubic': 'Cubic',
    'sine': 'Sine',
    'exponential': 'Exponential',
};

export const easingDirectionLabels: Record<EasingDirection, string> = {
    'ease-in': 'Ease In',
    'ease-out': 'Ease Out',
    'ease-in-out': 'Ease In-Out',
};

// Distribute contrast values across steps based on curve type
export const distributeContrasts = (
    stepCount: number,
    range: ContrastRange,
    curveType: CurveType
): number[] => {
    const easingFn = easingFunctions[curveType];
    const contrasts: number[] = [];

    for (let i = 0; i < stepCount; i++) {
        // Calculate normalized position (0 to 1)
        const t = stepCount > 1 ? i / (stepCount - 1) : 0;

        // Apply easing function
        const easedT = easingFn(t);

        // Map to contrast range (min to max)
        const contrast = range.min + (range.max - range.min) * easedT;

        // Round to 2 decimal places
        contrasts.push(Math.round(contrast * 100) / 100);
    }

    return contrasts;
};

// Curve preview data for contrast visualization
export const getCurvePoints = (curveType: CurveType, pointCount: number = 20): { x: number; y: number }[] => {
    const easingFn = easingFunctions[curveType];
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= pointCount; i++) {
        const t = i / pointCount;
        points.push({ x: t, y: easingFn(t) });
    }

    return points;
};

// Human-readable names for curve types
export const curveTypeLabels: Record<CurveType, string> = {
    'linear': 'Linear',
    'ease-in': 'Ease In',
    'ease-out': 'Ease Out',
    'ease-in-out': 'Ease In-Out',
};
