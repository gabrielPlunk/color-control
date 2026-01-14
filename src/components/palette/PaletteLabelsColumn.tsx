import React from 'react';
import { useColorStore } from '../../store/useColorStore';

export const PaletteLabelsColumn: React.FC = () => {
    const { scaleSteps, updateScaleStep } = useColorStore();

    return (
        <div className="flex flex-col gap-0 pt-[104px] sticky left-0 bg-neutral-950 z-20 pr-2 border-r border-neutral-800/50">
            {scaleSteps.map((step) => (
                <div key={step.id} className="h-12 flex items-center gap-2 px-2 group">
                    {/* Step Name */}
                    <span className="text-xs font-bold text-neutral-400 w-8 text-right">{step.name}</span>

                    {/* Editable Contrast Input */}
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="21"
                        value={step.targetContrastWhite || ''}
                        onChange={(e) => updateScaleStep(step.id, {
                            targetContrastWhite: e.target.value ? parseFloat(e.target.value) : null
                        })}
                        placeholder="—"
                        title="Target contrast vs white (click to edit)"
                        className="w-12 bg-transparent hover:bg-neutral-800/50 focus:bg-neutral-800 border border-transparent hover:border-neutral-700 focus:border-neutral-600 rounded px-1 py-0.5 text-[10px] text-neutral-500 focus:text-neutral-300 font-mono text-center transition-all focus:outline-none"
                    />
                </div>
            ))}
        </div>
    );
};

