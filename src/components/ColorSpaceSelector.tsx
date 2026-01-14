import React from 'react';
import { useColorStore, type ColorSpaceMode } from '../store/useColorStore';

const options: { value: ColorSpaceMode; label: string }[] = [
    { value: 'lch', label: 'LCh' },
    { value: 'oklch', label: 'OKLCh' },
];

export const ColorSpaceSelector: React.FC = () => {
    const { colorSpace, setColorSpace } = useColorStore();

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Color Space</h3>
            <div className="flex bg-neutral-800/50 rounded-lg p-0.5 gap-0.5">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setColorSpace(option.value)}
                        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${colorSpace === option.value
                                ? 'bg-neutral-700 text-white shadow-sm'
                                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-neutral-600 leading-relaxed">
                {colorSpace === 'oklch'
                    ? 'OKLCH: Perceptually uniform, no hue shift'
                    : 'LCh: Classic CIE Lab-based color space'
                }
            </p>
        </div>
    );
};
