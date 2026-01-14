import React from 'react';
import chroma from 'chroma-js';
import type { PaletteResult, BaseColor } from '../../types';
import { findClosestStep } from '../../utils/colorUtils';
import { PaletteHeaderCell } from './PaletteHeaderCell';
import { PaletteStepCell } from './PaletteStepCell';

interface PaletteColumnProps {
    column: PaletteResult;
    baseColor: BaseColor;
}

export const PaletteColumn: React.FC<PaletteColumnProps> = ({ column, baseColor }) => {
    const baseLch = chroma(baseColor.hex).lch();
    const closestStepId = findClosestStep(baseLch, column.steps);

    return (
        <div className="flex flex-col w-32 shrink-0 group/column relative">
            <PaletteHeaderCell baseColor={baseColor} />

            {/* Steps Container */}
            <div className="flex flex-col rounded-xl overflow-hidden shadow-sm ring-1 ring-white/5 divide-y divide-black/10 bg-white relative">
                {column.steps.map((step) => (
                    <PaletteStepCell
                        key={step.stepId}
                        step={step}
                        isClosest={step.stepId === closestStepId}
                    />
                ))}
            </div>
        </div>
    );
};
