import React from 'react';
import { useColorStore } from '../../store/useColorStore';
import { Trash2, Plus } from 'lucide-react';

export const PaletteLabelsColumn: React.FC = () => {
    const { scaleSteps, updateScaleStep, removeScaleStep, addScaleStep } = useColorStore();

    return (
        <div className="flex flex-col pt-[104px] bg-neutral-950 z-20">
            {/* Step Rows */}
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
                        title="Target contrast vs white"
                        className="w-12 bg-neutral-800 border border-neutral-700 rounded px-1 py-1.5 text-xs text-neutral-300 font-mono text-center focus:outline-none focus:border-neutral-500 transition-colors"
                    />

                    {/* Delete button (visible on hover) */}
                    {scaleSteps.length > 2 && (
                        <button
                            onClick={() => removeScaleStep(step.id)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Remove step"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            ))}

            {/* Add Step Button */}
            {scaleSteps.length < 20 && (
                <div className="h-12 flex items-center px-2">
                    <button
                        onClick={addScaleStep}
                        className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
                        title="Add new step"
                    >
                        <Plus size={12} />
                        <span>Add Step</span>
                    </button>
                </div>
            )}
        </div>
    );
};



