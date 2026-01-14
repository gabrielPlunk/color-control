import React from 'react';
import type { ScaleStep } from '../../types';

interface PaletteLabelsColumnProps {
    steps: ScaleStep[];
}

export const PaletteLabelsColumn: React.FC<PaletteLabelsColumnProps> = ({ steps }) => {
    return (
        <div className="flex flex-col gap-0 pt-[104px] sticky left-0 bg-neutral-950 z-20 pr-4 border-r border-neutral-800/50">
            {steps.map((step) => (
                <div key={step.id} className="h-12 flex flex-col justify-center px-2 text-right">
                    <span className="text-xs font-bold text-neutral-400">{step.name}</span>
                    <div className="text-[10px] text-neutral-600 font-mono flex flex-col items-end leading-tight opacity-50">
                        {step.targetContrastWhite && <span>{step.targetContrastWhite}:1</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};
