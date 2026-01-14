import React, { useState } from 'react';
import chroma from 'chroma-js';
import { X } from 'lucide-react';
import type { BaseColor } from '../../types';
import { useColorStore } from '../../store/useColorStore';
import { ColorPickerPopover } from '../ColorPickerPopover';

interface PaletteHeaderCellProps {
    baseColor: BaseColor;
}

export const PaletteHeaderCell: React.FC<PaletteHeaderCellProps> = ({ baseColor }) => {
    const { removeBaseColor, updateBaseColor } = useColorStore();
    const [showPicker, setShowPicker] = useState(false);
    const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (chroma.valid(e.target.value)) {
            updateBaseColor(baseColor.id, chroma(e.target.value).hex());
        }
    };

    const handleSwatchClick = (e: React.MouseEvent<HTMLElement>) => {
        setPickerAnchor(e.currentTarget);
        setShowPicker(true);
    };

    return (
        <div className="relative group/header mb-2">
            <button
                onClick={() => removeBaseColor(baseColor.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-800 hover:bg-red-500 rounded-full flex items-center justify-center text-neutral-400 hover:text-white opacity-0 group-hover/header:opacity-100 transition-all z-30 shadow-lg"
                title="Remove color"
            >
                <X size={10} />
            </button>

            <div className="h-[96px] flex flex-col gap-2">
                <div
                    className="flex-1 rounded-xl shadow-lg relative group cursor-pointer ring-1 ring-white/5 transition-all hover:ring-white/20"
                    style={{ backgroundColor: baseColor.hex }}
                    onClick={handleSwatchClick}
                />
                <div className="text-center">
                    <input
                        className="text-xs font-mono text-neutral-400 uppercase bg-neutral-900/50 px-2 py-1 rounded text-center w-full focus:outline-none focus:ring-1 focus:ring-neutral-600 border border-transparent focus:border-neutral-600"
                        defaultValue={baseColor.hex}
                        onBlur={(e) => handleHexChange(e)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur();
                            }
                        }}
                    />
                </div>
            </div>

            {showPicker && pickerAnchor && (
                <ColorPickerPopover
                    color={baseColor.hex}
                    onChange={(hex) => updateBaseColor(baseColor.id, hex)}
                    onClose={() => setShowPicker(false)}
                    referenceElement={pickerAnchor}
                    actionLabel="Done"
                />
            )}
        </div>
    );
};
