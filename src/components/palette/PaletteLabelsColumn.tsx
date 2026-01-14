import React, { useState, useRef } from 'react';
import chroma from 'chroma-js';
import clsx from 'clsx';
import { useColorStore } from '../../store/useColorStore';
import { Trash2, Plus } from 'lucide-react';
import { ColorPickerPopover } from '../ColorPickerPopover';

export const PaletteLabelsColumn: React.FC = () => {
    const { scaleSteps, updateScaleStep, removeScaleStep, addScaleStep, addBaseColor, baseColors } = useColorStore();

    // Add color state
    const [placeholderHex, setPlaceholderHex] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleAddColor = (hex: string) => {
        const validHex = chroma.valid(hex) ? hex : '#3b82f6';
        addBaseColor(chroma(validHex).hex());
        setPlaceholderHex('');
        setShowPicker(false);
    };

    const handlePlaceholderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && chroma.valid(placeholderHex)) {
            handleAddColor(placeholderHex);
        }
    };

    return (
        <div className="flex flex-col bg-neutral-950 z-20 sticky left-0">
            {/* Add Color Trigger - Now in the header area */}
            {baseColors.length < 40 && (
                <div className="h-[104px] flex flex-col items-center justify-center gap-2 px-2">
                    <div
                        ref={triggerRef}
                        className={clsx(
                            "h-14 w-full max-w-[80px] rounded-lg border border-neutral-700 hover:border-neutral-500 cursor-pointer flex items-center justify-center transition-all",
                            chroma.valid(placeholderHex) ? "" : "bg-neutral-900/50"
                        )}
                        style={{ backgroundColor: chroma.valid(placeholderHex) ? placeholderHex : undefined }}
                        onClick={() => setShowPicker(true)}
                    >
                        <Plus size={20} className={clsx(
                            "transition-colors",
                            chroma.valid(placeholderHex) ? "text-white/70" : "text-neutral-500"
                        )} />
                    </div>
                    <input
                        className="text-xs font-mono text-neutral-500 uppercase bg-transparent px-2 py-1 text-center w-full max-w-[80px] focus:outline-none placeholder-neutral-600"
                        placeholder="HEX"
                        value={placeholderHex}
                        onChange={(e) => setPlaceholderHex(e.target.value)}
                        onKeyDown={handlePlaceholderKeyDown}
                    />

                    {/* Picker */}
                    {showPicker && triggerRef.current && (
                        <ColorPickerPopover
                            color={chroma.valid(placeholderHex) ? placeholderHex : '#3b82f6'}
                            onChange={setPlaceholderHex}
                            onClose={() => setShowPicker(false)}
                            referenceElement={triggerRef.current}
                            actionLabel="Add"
                            onAction={() => handleAddColor(chroma.valid(placeholderHex) ? placeholderHex : '#3b82f6')}
                        />
                    )}
                </div>
            )}

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




