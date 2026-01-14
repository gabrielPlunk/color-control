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
        <div className="flex flex-col w-20 shrink-0 mr-4">
            {/* Add Color Button */}
            <div className="h-[96px] flex flex-col gap-2 mb-2">
                <div
                    ref={triggerRef}
                    className={clsx(
                        "flex-1 rounded-xl shadow-lg relative cursor-pointer ring-1 ring-dashed ring-neutral-700 hover:ring-neutral-500 flex items-center justify-center transition-all",
                        chroma.valid(placeholderHex) ? "" : "bg-neutral-900/50"
                    )}
                    style={{ backgroundColor: chroma.valid(placeholderHex) ? placeholderHex : undefined }}
                    onClick={openPicker}
                >
                    <Plus size={24} className={clsx(
                        "transition-colors",
                        chroma.valid(placeholderHex) ? "text-white/50" : "text-neutral-600"
                    )} />
                </div>
                <div className="text-center">
                    <input
                        className="text-xs font-mono text-neutral-500 uppercase bg-neutral-900/50 px-2 py-1 rounded text-center w-full focus:outline-none focus:ring-1 focus:ring-neutral-600 border border-transparent focus:border-neutral-600 placeholder-neutral-600"
                        placeholder="HEX"
                        value={placeholderHex}
                        onChange={(e) => setPlaceholderHex(e.target.value)}
                        onKeyDown={handlePlaceholderKeyDown}
                    />
                </div>
            </div>

            {/* Picker rendered outside the trigger */}
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


