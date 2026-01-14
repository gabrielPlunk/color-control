import React, { useEffect, useRef } from 'react';
import { useColorStore } from '../store/useColorStore';
import { curveTypeLabels, getCurvePoints, type CurveType } from '../utils/curveUtils';

const curveTypes: CurveType[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

// Curve Preview Component - Styled like Chroma curves
const CurvePreview: React.FC<{
    curveType: CurveType;
    contrastRange: { min: number; max: number };
}> = ({ curveType, contrastRange }) => {
    const curvePoints = getCurvePoints(curveType, 20);

    return (
        <div className="space-y-3 p-3 bg-neutral-800/50 rounded-lg">
            {/* Mini Curve Preview - Like Chroma */}
            <div className="h-16 bg-neutral-900 rounded overflow-hidden">
                <svg
                    viewBox="0 0 100 64"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient id="contrastGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
                            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
                        </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                        d={`M 0 64 ${curvePoints.map(p => `L ${p.x * 100} ${64 - p.y * 56}`).join(' ')} L 100 64 Z`}
                        fill="url(#contrastGradient)"
                    />
                    {/* Line */}
                    <path
                        d={`M ${curvePoints.map(p => `${p.x * 100},${64 - p.y * 56}`).join(' L ')}`}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                    />
                </svg>
            </div>

            {/* Range Labels */}
            <div className="flex justify-between">
                <span className="text-[10px] font-mono text-neutral-500">{contrastRange.min.toFixed(1)}</span>
                <span className="text-[10px] font-mono text-neutral-500">{contrastRange.max.toFixed(1)}</span>
            </div>
        </div>
    );
};

export const CurvePresets: React.FC = () => {
    const {
        curveType,
        contrastRange,
        scaleSteps,
        setCurveType,
        setContrastRange,
        applyContrastCurve
    } = useColorStore();

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

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Contrast Curve</h3>

            {/* Curve Preview */}
            <CurvePreview
                curveType={curveType}
                contrastRange={contrastRange}
            />

            {/* Curve Type Selector */}
            <div className="grid grid-cols-4 gap-1">
                {curveTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => handleCurveTypeChange(type)}
                        className={`py-1.5 px-1 text-[10px] font-medium rounded transition-all ${curveType === type
                            ? 'bg-violet-600/80 text-white shadow-sm'
                            : 'bg-neutral-800/50 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                    >
                        {curveTypeLabels[type].replace(' ', '\n')}
                    </button>
                ))}
            </div>

            {/* Contrast Range - Styled like Chroma inputs */}
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

            <p className="text-[10px] text-neutral-600 leading-relaxed text-center">
                {scaleSteps.length} steps • Updates in real-time
            </p>
        </div>
    );
};

