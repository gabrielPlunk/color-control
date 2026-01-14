import React from 'react';
import chroma from 'chroma-js';
import clsx from 'clsx';
import type { PalettestepResult } from '../../types';

interface PaletteStepCellProps {
    step: PalettestepResult;
    isClosest: boolean;
}

export const PaletteStepCell: React.FC<PaletteStepCellProps> = ({ step, isClosest }) => {
    const contrastWhite = chroma.contrast(step.hex, '#ffffff');
    const contrastBlack = chroma.contrast(step.hex, '#000000');
    const textColor = contrastWhite > 4.5 ? '#ffffff' : '#000000';

    const handleCopy = () => {
        navigator.clipboard.writeText(step.hex);
    };

    return (
        <div
            className={clsx(
                "h-12 flex items-center justify-center px-3 cursor-pointer transition-all group relative",
                isClosest && "z-10"
            )}
            style={{ backgroundColor: step.hex, color: textColor }}
            onClick={handleCopy}
            title={`Copy ${step.hex}`}
        >
            {isClosest && (
                <div className="absolute left-0 w-1 h-full bg-white/50" />
            )}

            <span className="text-[10px] font-mono uppercase group-hover:opacity-0 transition-opacity z-10">
                {step.hex}
            </span>

            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px] z-20">
                <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-[10px] font-bold shadow-black/50 drop-shadow-md text-white">
                        W {contrastWhite.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold shadow-black/50 drop-shadow-md text-white">
                        B {contrastBlack.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};
