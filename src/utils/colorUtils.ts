import chroma from 'chroma-js';
import type { BaseColor, ScaleStep, PalettestepResult, PaletteResult, OklchSettings } from '../types';
import type { ColorSpaceMode } from '../store/useColorStore';
import { interpolateChannel } from './curveUtils';

// Convert hex to LCh
export const hexToLch = (hex: string): [number, number, number] => {
    return chroma(hex).lch();
};

// Convert hex to OKLCH
export const hexToOklch = (hex: string): [number, number, number] => {
    return chroma(hex).oklch();
};

// Calculate contrast (WCAG 2.0)
export const getContrast = (c1: string, c2: string): number => {
    return chroma.contrast(c1, c2);
};

// Find closest shade in a generated scale to the original base color
// We use simple Euclidean distance in LCh space or just Lightness difference if Hue/Chroma are locked
export const findClosestStep = (originalLch: [number, number, number], steps: PalettestepResult[]): string => {
    let minDist = Infinity;
    let closestId = '';

    steps.forEach(step => {
        // Delta E 76 (Euclidean distance in LAB/LCh) is acceptable for this simple check
        // dE = sqrt((L1-L2)^2 + (a1-a2)^2 + (b1-b2)^2)
        // chroma.deltaE(c1, c2)
        const dist = chroma.deltaE(chroma.lch(...originalLch), chroma.lch(...step.lch));
        if (dist < minDist) {
            minDist = dist;
            closestId = step.stepId;
        }
    });

    return closestId;
};

// Generate a single color for a target contrast
// This is the core algorithm.
// Strategy:
// 1. Keep Hue and Chroma from base color.
// 2. Find Lightness that satisfies the contrast target with white or black.
// 3. Since we might have TWO targets (white and black) or just one, or none (interpolate).
//    - If targets defined: Binary search L to find specific contrast.
//    - If no targets: Interpolate lightness linearly across the scale? Or use pre-defined default lightnesses?
//    For Color Control, the prompt implies "contrastes alvo por gradação (ex: 1.08:1...)".
//    If a step has NO target contrast, we probably should interpolate or default to a standard curve.
//    BUT, if we have targets, we prioritize them.
//    Ideally, if only SOME steps have targets, others interpolate between them.
//    For MVP, let's assume we either have targets or we assume a linear Lightness spread if not specified? 
//    Actually, accessiblepalette.com usually interpolates Lightness curve (0 to 100) or uses specific steps (L=95, L=90...).
//    The prompt says "target contrast ... for editable names".
//    Let's implement a solver that takes desired contrast and finds the L.

// Helper to find alpha that produces target contrast over white
// Y_mixed = Y_base * alpha + Y_white * (1 - alpha)
// We need Y_mixed that gives contrast C with Y_white (1).
// Contrast = (Y_white + 0.05) / (Y_mixed + 0.05) (assuming white is lighter)
// Y_mixed + 0.05 = (Y_white + 0.05) / C
// Y_mixed = ((1 + 0.05) / C) - 0.05
const findAlphaForContrast = (baseHex: string, targetRatio: number): number => {
    // White background luminance is 1.
    const baseLuminance = chroma(baseHex).luminance();

    // Check if base color itself is lighter than white (impossible usually) or if contrast target is impossible even at 100% opacity
    // Contrast of solid base vs white:
    const solidContrast = chroma.contrast(baseHex, '#ffffff');
    if (solidContrast < targetRatio) {
        // Even solid color doesn't have enough contrast. 
        // Transparency only LOWERS contrast against white (since it makes it lighter/whiter).
        // So we return 1 (solid) as best effort.
        return 1;
    }

    // Target Luminance for the mixed color
    // Ratio = (1.05) / (Y_mixed + 0.05)
    // Y_mixed + 0.05 = 1.05 / Ratio
    const targetY = (1.05 / targetRatio) - 0.05;

    // Y_mixed = Y_base * A + Y_bg * (1 - A)
    // targetY = Y_base * A + 1 * (1 - A)
    // targetY = Y_base * A + 1 - A
    // targetY - 1 = A * (Y_base - 1)
    // A = (targetY - 1) / (Y_base - 1)

    let alpha = (targetY - 1) / (baseLuminance - 1);

    // Clamp alpha
    return Math.max(0, Math.min(1, alpha));
};

// Default OKLCH settings for fallback
const defaultOklchSettings: OklchSettings = {
    chroma: { range: { min: 0.05, max: 0.15 }, curveType: 'linear', direction: 'ease-out' },
    hue: { range: { min: 0, max: 0 }, curveType: 'linear', direction: 'ease-in-out' },
};

export const generatePalette = (
    baseColors: BaseColor[],
    scaleSteps: ScaleStep[],
    colorSpace: ColorSpaceMode = 'lch',
    oklchSettings: OklchSettings = defaultOklchSettings
): PaletteResult[] => {
    return baseColors.map(base => {
        const useOpacity = base.useOpacity;
        const alpha = chroma(base.hex).alpha(); // Existing alpha if manually set

        // Get base color values
        const [, c_base, h_base] = colorSpace === 'oklch'
            ? chroma(base.hex).oklch()
            : chroma(base.hex).lch();

        const stepsResult: PalettestepResult[] = scaleSteps.map((step, stepIndex) => {
            let finalHex = '#000000';
            let satisfied = false;

            // Calculate normalized position for this step (0 to 1)
            const t = scaleSteps.length > 1 ? stepIndex / (scaleSteps.length - 1) : 0;

            // Determine Chroma and Hue for this step
            let step_c = c_base;
            let step_h = h_base;

            if (colorSpace === 'oklch') {
                // Apply chroma curve: interpolate between range.min and range.max
                // The curve modifies the base chroma by a factor
                const chromaFactor = interpolateChannel(t, oklchSettings.chroma);
                step_c = chromaFactor; // Use the curve value directly as OKLCH C (0-0.4 range)

                // Apply hue shift: add the interpolated value to base hue
                const hueShift = interpolateChannel(t, oklchSettings.hue);
                step_h = (h_base + hueShift) % 360;
                if (step_h < 0) step_h += 360;
            }

            if (useOpacity) {
                // Opacity generation logic
                let calculatedAlpha = 1;

                if (step.targetContrastWhite) {
                    calculatedAlpha = findAlphaForContrast(base.hex, step.targetContrastWhite);
                    satisfied = true;
                }

                if (!satisfied) {
                    // Linear interpolation of Alpha
                    calculatedAlpha = 0.1 + (t * 0.9);
                }

                // Create the color
                finalHex = chroma(base.hex).alpha(calculatedAlpha).hex();

            } else {
                // Standard LCh/OKLCH logic with advanced curves

                // Try satisfying White target if present
                if (step.targetContrastWhite) {
                    finalHex = findColorForContrast('#ffffff', step.targetContrastWhite, step_h, step_c, colorSpace, alpha);
                    satisfied = true;
                }

                if (!satisfied) {
                    const targetL = colorSpace === 'oklch'
                        ? 0.95 - (t * 0.85)
                        : 95 - (t * 85);

                    finalHex = colorSpace === 'oklch'
                        ? chroma.oklch(targetL, step_c, step_h).alpha(alpha).hex()
                        : chroma.lch(targetL, step_c, step_h).alpha(alpha).hex();
                }
            }

            const [L, c, h] = chroma(finalHex).lch();

            return {
                stepId: step.id,
                hex: finalHex,
                lch: [L, c, h],
                contrastWhite: chroma.contrast(finalHex, '#ffffff'),
                contrastBlack: chroma.contrast(finalHex, '#000000'),
            };
        });

        return {
            baseColorId: base.id,
            steps: stepsResult
        };
    });
};


const findColorForContrast = (bgHex: string, targetRatio: number, fixedH: number, fixedC: number, colorSpace: ColorSpaceMode = 'lch', alpha: number = 1): string => {
    const isBgLight = chroma(bgHex).get('lch.l') > 50;

    // Use binary search for both LCh and OKLCH when alpha is present, 
    // or if OKLCH is selected (as per previous logic).
    // Alpha transparency requires iterative verification against bg buffer anyway.

    if (colorSpace === 'oklch') {
        return findColorBinarySearch(bgHex, targetRatio, fixedH, fixedC, isBgLight, alpha, 'oklch');
    }

    // For LCh with alpha < 1, or just consistent logic, we can also use binary search.
    // The previous analytic solution doesn't account for alpha blending.
    if (alpha < 0.999) {
        return findColorBinarySearch(bgHex, targetRatio, fixedH, fixedC, isBgLight, alpha, 'lch');
    }

    const bgLuminance = chroma(bgHex).luminance();
    // For LCh solid colors, use analytic solution
    return findLchColorForContrast(bgHex, targetRatio, fixedH, fixedC, isBgLight, bgLuminance);
};

// Generic Binary Search for finding Lightness (L) that satisfies contrast
// Supports both OKLCH (L: 0-1) and LCh (L: 0-100)
const findColorBinarySearch = (
    bgHex: string,
    targetRatio: number,
    fixedH: number,
    fixedC: number,
    isBgLight: boolean,
    alpha: number,
    mode: ColorSpaceMode
): string => {
    // Determine ranges based on mode
    let low = 0;
    let high = mode === 'oklch' ? 1 : 100;
    let bestHex = isBgLight ? '#000000' : '#ffffff';

    // For transparency, the best hex fallback should also include alpha
    if (alpha < 1) {
        bestHex = chroma(bestHex).alpha(alpha).hex();
    }

    const createColor = (l: number, c: number, h: number): chroma.Color => {
        return mode === 'oklch'
            ? chroma.oklch(l, c, h).alpha(alpha)
            : chroma.lch(l, c, h).alpha(alpha);
    };

    // Binary search for the correct L value
    for (let i = 0; i < 20; i++) {
        const midL = (low + high) / 2;

        // Try to create color, reducing chroma if clipped
        let candidate = createColor(midL, fixedC, fixedH);
        let testC = fixedC;

        // Gamut fitting: reduce chroma until in gamut
        // Note: For transparent colors, clipping might check the underlying RGB values before alpha?
        // chroma.clipped() checks if strictly in RGB gamut. 
        while (candidate.clipped() && testC > 0.001) {
            testC *= 0.9;
            candidate = createColor(midL, testC, fixedH);
        }

        // Calculate contrast of the transparent color over the background
        // chroma.contrast handles transparency by blending over white? 
        // No, chroma.contrast(c1, c2) usually blends c1 over c2 if c1 has alpha?
        // Actually chroma.contrast might not support alpha blending automatically against specific bg in all versions.
        // It typically computes luminance of the color itself.
        // To be accurate, we should blend candidate over bgHex correctly.

        // Manual overlap: Result = Alpha * Foreground + (1 - Alpha) * Background
        // However, chroma.mix(bgHex, candidate_rgb, alpha) is basically it.
        // But let's trust chroma's internal handling or do a mix ourselves.
        const blended = chroma.mix(bgHex, candidate, alpha, 'rgb');
        const currentContrast = chroma.contrast(blended, bgHex);

        // Check if this is closer to target
        if (Math.abs(currentContrast - targetRatio) < Math.abs(chroma.contrast(chroma.mix(bgHex, bestHex, alpha, 'rgb'), bgHex) - targetRatio)) {
            bestHex = candidate.hex();
        }

        // Adjust search range
        // If background is light:
        // - To increase contrast, we need darker color (Lower L).
        // - If current contrast < target, we need MORE contrast -> Lower L.
        // - If current contrast > target, we need LESS contrast -> Higher L.

        // Logic check:
        // Light BG (White). Target 4.5.
        // Current candidate is mid-grey (Contrast 2.0). Too low. Need darker.
        // So we search in low..midL.

        if (isBgLight) {
            if (currentContrast < targetRatio) {
                high = midL; // Need darker (lower L)
            } else {
                low = midL;  // Too dark, need lighter
            }
        } else {
            // Dark BG (Black). Target 4.5.
            // Current candidate is mid-grey (Contrast 2.0). Too low. Need lighter.
            if (currentContrast < targetRatio) {
                low = midL;  // Need lighter (higher L)
            } else {
                high = midL; // Too light, need darker
            }
        }
    }

    return bestHex;
};

// Analytic solution for LCh
const findLchColorForContrast = (
    _bgHex: string,
    targetRatio: number,
    fixedH: number,
    fixedC: number,
    isBgLight: boolean,
    bgLuminance: number
): string => {
    // Calculate target luminance from contrast ratio
    let targetY: number;

    if (isBgLight) {
        targetY = ((bgLuminance + 0.05) / targetRatio) - 0.05;
    } else {
        targetY = (targetRatio * (bgLuminance + 0.05)) - 0.05;
    }

    // Check if target Y is valid
    if (targetY < 0 || targetY > 1) {
        return isBgLight ? '#000000' : '#ffffff';
    }

    // Convert Y to L* (CIE Lab formula)
    let targetL: number;
    if (targetY <= 0.008856) {
        targetL = targetY * 903.3;
    } else {
        targetL = Math.pow(targetY, 1 / 3) * 116 - 16;
    }

    // Construct LCh color
    let candidate = chroma.lch(targetL, fixedC, fixedH);

    // Gamut fitting
    if (candidate.clipped()) {
        let low = 0;
        let high = fixedC;
        let bestC = 0;

        for (let i = 0; i < 10; i++) {
            const midC = (low + high) / 2;
            const tryCol = chroma.lch(targetL, midC, fixedH);
            if (!tryCol.clipped()) {
                bestC = midC;
                low = midC;
            } else {
                high = midC;
            }
        }
        candidate = chroma.lch(targetL, bestC, fixedH);
    }

    return candidate.hex();
};
