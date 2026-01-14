import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useColorStore } from '../store/useColorStore';
import chroma from 'chroma-js';
import { ColorPickerPopover } from './ColorPickerPopover';

export const ColorInput: React.FC = () => {
    const { baseColors, addBaseColor, removeBaseColor, updateBaseColor } = useColorStore();

    // Manage which color is currently being edited (by ID). 'NEW' for the add button.
    const [activePickerId, setActivePickerId] = useState<string | null>(null);
    const [activeAnchor, setActiveAnchor] = useState<HTMLElement | null>(null);

    // For the "Add New" specific state
    const [newColorHex, setNewColorHex] = useState(''); // Default neutral (empty)

    const closePicker = () => {
        setActivePickerId(null);
        setActiveAnchor(null);
    };

    const handleAdd = () => {
        if (chroma.valid(newColorHex)) {
            addBaseColor(chroma(newColorHex).hex());
            setNewColorHex(''); // Reset to neutral
            closePicker();
        }
    };

    // Toggle logic for opening/closing pickers
    const handleToggle = (id: string, event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();

        if (activePickerId === id) {
            closePicker();
        } else {
            setActivePickerId(id);
            setActiveAnchor(event.currentTarget);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Base Colors</h2>
                <span className="text-xs text-neutral-600">{baseColors.length}/40</span>
            </div>

            <div className="space-y-2">
                {baseColors.map((color) => (
                    <div
                        key={color.id}
                        className="group relative flex items-center gap-2 bg-neutral-800/50 p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                        {/* Color Swatch - Click to Edit */}
                        <div
                            className="w-8 h-8 rounded shadow-inner shrink-0 cursor-pointer relative ring-1 ring-inset ring-white/5"
                            style={{ backgroundColor: color.hex }}
                            onClick={(e) => handleToggle(color.id, e)}
                        >
                            {/* Show Picker if active */}
                            {activePickerId === color.id && activeAnchor && (
                                <ColorPickerPopover
                                    color={color.hex}
                                    onChange={(newHex) => updateBaseColor(color.id, newHex)}
                                    onClose={closePicker}
                                    referenceElement={activeAnchor}
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <input
                                className="w-full bg-transparent text-xs font-mono uppercase focus:outline-none text-neutral-300"
                                value={color.hex}
                                onChange={(e) => {
                                    if (chroma.valid(e.target.value)) {
                                        updateBaseColor(color.id, chroma(e.target.value).hex());
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={() => removeBaseColor(color.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400 transition-all"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {baseColors.length < 40 && (
                    <div className="relative flex items-center gap-2 bg-neutral-800/30 p-1.5 rounded-lg border border-dashed border-neutral-800 hover:border-neutral-700 transition-colors">
                        <button
                            onClick={(e) => handleToggle('NEW', e)}
                            className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors relative shrink-0 ring-1 ring-inset ring-white/5"
                            style={{ backgroundColor: chroma.valid(newColorHex) ? newColorHex : undefined }}
                        >
                            <Plus size={14} className={chroma.valid(newColorHex) ? "text-white/50" : "text-neutral-500"} />

                            {/* Picker for New Color */}
                            {activePickerId === 'NEW' && activeAnchor && (
                                <ColorPickerPopover
                                    color={chroma.valid(newColorHex) ? newColorHex : '#3b82f6'}
                                    onChange={setNewColorHex}
                                    onClose={closePicker}
                                    referenceElement={activeAnchor}

                                    // Custom Action for "Add"
                                    actionLabel="Add"
                                    onAction={handleAdd}
                                />
                            )}
                        </button>

                        <input
                            className="w-full bg-transparent text-xs placeholder-neutral-600 focus:outline-none min-w-0 font-mono uppercase"
                            placeholder="ADD HEX"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAdd();
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        {chroma.valid(newColorHex) && (
                            <button
                                onClick={handleAdd}
                                className="p-1 hover:bg-neutral-800 rounded text-blue-500 transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        )}

                    </div>
                )}
            </div>

        </div>
    );
};
