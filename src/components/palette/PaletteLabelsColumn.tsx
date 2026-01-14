import React, { useState, useRef } from 'react';
import chroma from 'chroma-js';
import clsx from 'clsx';
import { useColorStore } from '../../store/useColorStore';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { ColorPickerPopover } from '../ColorPickerPopover';

export const PaletteLabelsColumn: React.FC = () => {
    const { scaleSteps, updateScaleStep, removeScaleStep, addScaleStep, addBaseColor, baseColors, setScaleSteps } = useColorStore();

    // Add color state
    const [placeholderHex, setPlaceholderHex] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Drag state
    const [draggedId, setDraggedId] = useState<string | null>(null);

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

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const draggedIndex = scaleSteps.findIndex(s => s.id === draggedId);
        const targetIndex = scaleSteps.findIndex(s => s.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newSteps = [...scaleSteps];
        const [removed] = newSteps.splice(draggedIndex, 1);
        newSteps.splice(targetIndex, 0, removed);
        setScaleSteps(newSteps);
        setDraggedId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    return (
        <div className="flex flex-col bg-neutral-950 z-20 sticky left-0">
            {/* Add Color Trigger - Matches PaletteHeaderCell structure */}
            {baseColors.length < 40 && (
                <div className="relative mb-2">
                    <div className="h-[96px] flex flex-col gap-2 px-3">
                        <div
                            ref={triggerRef}
                            className={clsx(
                                "flex-1 rounded-xl border border-neutral-700 hover:border-neutral-500 cursor-pointer flex items-center justify-center transition-all ring-1 ring-white/5",
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
                            className="text-xs font-mono text-neutral-400 uppercase bg-neutral-900/50 px-2 py-1 rounded text-center w-full focus:outline-none focus:ring-1 focus:ring-neutral-600 border border-transparent focus:border-neutral-600"
                            placeholder="HEX"
                            value={placeholderHex}
                            onChange={(e) => setPlaceholderHex(e.target.value)}
                            onKeyDown={handlePlaceholderKeyDown}
                        />
                    </div>

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
                <div
                    key={step.id}
                    className={clsx(
                        "h-12 flex items-center gap-2 px-3 group",
                        draggedId === step.id && "opacity-50"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, step.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, step.id)}
                    onDragEnd={handleDragEnd}
                >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} />
                    </div>

                    {/* Editable Step Name */}
                    <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateScaleStep(step.id, { name: e.target.value })}
                        className="w-10 text-xs font-bold text-neutral-400 bg-transparent text-right focus:outline-none focus:text-neutral-200 transition-colors"
                        title="Step name (click to edit)"
                    />

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
                        className="w-14 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1.5 text-xs text-neutral-300 font-mono text-center focus:outline-none focus:border-neutral-500 transition-colors"
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
                <div className="h-12 flex items-center px-3">
                    <button
                        onClick={addScaleStep}
                        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 px-3 py-2 rounded-md transition-colors ml-3"
                        title="Add new step"
                    >
                        <Plus size={14} />
                        <span>Add Step</span>
                    </button>
                </div>
            )}
        </div>
    );
};
