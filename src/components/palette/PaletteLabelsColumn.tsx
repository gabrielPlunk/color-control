import React from 'react';
import { useColorStore } from '../../store/useColorStore';

export const PaletteLabelsColumn: React.FC = () => {
    const { scaleSteps, updateScaleStep } = useColorStore();

    return (
        <div className="flex flex-col gap-0 pt-[104px] bg-neutral-950 z-20 pr-3">
            {scaleSteps.map((step) => (
                <div key={step.id} className="h-12 flex items-center gap-3 px-2">
                    {/* Step Name */}
                    <span className="text-xs font-bold text-neutral-400 w-8 text-right">{step.name}</span>

                    {/* Editable Contrast Input - styled like Chroma min/max */}
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
                        title="Target contrast vs white"
                        className="w-14 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 font-mono text-center focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                </div>
            ))}
        </div>
    );
};


