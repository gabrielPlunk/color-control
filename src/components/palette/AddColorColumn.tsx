import React, { useState, useRef } from 'react';
import chroma from 'chroma-js';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { ColorPickerPopover } from '../ColorPickerPopover';
import { useColorStore } from '../../store/useColorStore';

export const AddColorColumn: React.FC = () => {
    const { addBaseColor } = useColorStore();
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

    const openPicker = () => {
        setShowPicker(true);
    };

    return (
        <div className="flex flex-col shrink-0">
            {/* Add Color Button - Styled per mockup */}
            <div className="h-[104px] flex flex-col gap-2 px-2">
                <div
                    ref={triggerRef}
                    className={clsx(
                        "h-14 w-24 rounded-lg border border-neutral-700 hover:border-neutral-500 cursor-pointer flex items-center justify-center transition-all",
                        chroma.valid(placeholderHex) ? "" : "bg-neutral-900/50"
                    )}
                    style={{ backgroundColor: chroma.valid(placeholderHex) ? placeholderHex : undefined }}
                    onClick={openPicker}
                >
                    <Plus size={20} className={clsx(
                        "transition-colors",
                        chroma.valid(placeholderHex) ? "text-white/70" : "text-neutral-500"
                    )} />
                </div>
                <input
                    className="text-xs font-mono text-neutral-500 uppercase bg-transparent px-2 py-1 text-center w-24 focus:outline-none placeholder-neutral-600"
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
    );
};



