import React, { useEffect, useRef, useState } from 'react';
import { useColorStore } from '../store/useColorStore';
import { curveTypeLabels, getCurvePoints, type CurveType } from '../utils/curveUtils';
import { Info } from 'lucide-react';

const curveTypes: CurveType[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

export const CurvePresets: React.FC = () => {
    const {
        curveType,
        contrastRange,
        setCurveType,
        setContrastRange,
        applyContrastCurve
    } = useColorStore();

    const [showTooltip, setShowTooltip] = useState(false);

    // Track if this is the first render
    const isFirstRender = useRef(true);

    // Auto-apply curve when settings change
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        applyContrastCurve();
    }, [curveType, contrastRange.min, contrastRange.max, applyContrastCurve]);

    const handleCurveTypeChange = (type: CurveType) => {
        setCurveType(type);
    };

    const handleRangeChange = (field: 'min' | 'max', value: number) => {
        setContrastRange({
            ...contrastRange,
            [field]: value
        });
    };

    const curvePoints = getCurvePoints(curveType, 20);

    return (
        <div className="space-y-3">
            {/* Header with title and info icon - like Chroma */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Contrast Curve
                </span>
                <div className="relative">
                    <button
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="p-1 rounded hover:bg-neutral-700/50 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        <Info size={12} />
                    </button>
                    {showTooltip && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-48 p-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl text-[10px] text-neutral-300 leading-relaxed">
                            Controls how contrast values are distributed across palette steps. Min/Max define the contrast range from lightest to darkest.
                        </div>
                    )}
                </div>
            </div>

            {/* Card container - like Chroma */}
            <div className="space-y-3 p-3 bg-neutral-800/50 rounded-lg">
                {/* Range Controls - like Chroma */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-neutral-500 w-8">Min</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="21"
                            value={contrastRange.min}
                            onChange={(e) => handleRangeChange('min', parseFloat(e.target.value) || 1)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] text-neutral-500 w-8">Max</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="21"
                            value={contrastRange.max}
                            onChange={(e) => handleRangeChange('max', parseFloat(e.target.value) || 21)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                        />
                    </div>
                </div>

                {/* Curve Type Selector - like Chroma dropdowns */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={curveType}
                        onChange={(e) => handleCurveTypeChange(e.target.value as CurveType)}
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                    >
                        {curveTypes.map(type => (
                            <option key={type} value={type}>{curveTypeLabels[type]}</option>
                        ))}
                    </select>
                    <div className="bg-neutral-900/50 border border-neutral-700/50 rounded px-2 py-1.5 text-xs text-neutral-500 text-center">
                        Contrast
                    </div>
                </div>

                {/* Mini Curve Preview - like Chroma */}
                <div className="h-10 bg-neutral-900 rounded overflow-hidden">
                    <svg
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                    >
                        <defs>
                            <linearGradient id="contrastGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
                            </linearGradient>
                        </defs>
                        {/* Fill */}
                        <path
                            d={`M 0 40 ${curvePoints.map(p => `L ${p.x * 100} ${40 - p.y * 36}`).join(' ')} L 100 40 Z`}
                            fill="url(#contrastGradient)"
                        />
                        {/* Line */}
                        <path
                            d={`M ${curvePoints.map(p => `${p.x * 100},${40 - p.y * 36}`).join(' L ')}`}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};


