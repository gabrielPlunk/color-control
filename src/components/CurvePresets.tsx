import React, { useEffect, useRef } from 'react';
import { useColorStore } from '../store/useColorStore';
import { curveTypeLabels, getCurvePoints, type CurveType } from '../utils/curveUtils';

const curveTypes: CurveType[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

// Enhanced SVG Curve Preview Component - Similar to Supa Palette
const CurvePreview: React.FC<{
    curveType: CurveType;
    contrastRange: { min: number; max: number };
}> = ({ curveType, contrastRange }) => {
    const curvePoints = getCurvePoints(curveType, 50);



    // SVG dimensions - no horizontal padding for edge-to-edge
    // SVG dimensions 
    const width = 200;
    const height = 70;
    // Padding logic: The SVG itself will be edge-to-edge within its container,
    // but the container will have padding.
    const padding = { top: 0, right: 0, bottom: 0, left: 0 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Transform points to SVG coordinates
    const toSvgX = (x: number) => padding.left + x * plotWidth;
    const toSvgY = (y: number) => padding.top + (1 - y) * plotHeight;

    // Create curve path
    const curvePath = curvePoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
        .join(' ');

    // Create fill area path - extends to bottom corners
    const fillPath = curvePath +
        ` L ${toSvgX(1)} ${height} L ${toSvgX(0)} ${height} Z`;

    return (
        <div className="relative group">
            <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-lg p-4">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-20 overflow-visible"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Gradient for the filled area */}
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                        </linearGradient>

                        {/* Gradient for the curve line */}
                        <linearGradient id="curveLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>

                        {/* Glow filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                        <line
                            key={`h-${v}`}
                            x1={toSvgX(0)}
                            y1={toSvgY(v)}
                            x2={toSvgX(1)}
                            y2={toSvgY(v)}
                            stroke="#333"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                    ))}
                    {[0, 0.5, 1].map((v) => (
                        <line
                            key={`v-${v}`}
                            x1={toSvgX(v)}
                            y1={toSvgY(0)}
                            x2={toSvgX(v)}
                            y2={toSvgY(1)}
                            stroke="#333"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Filled area under curve */}
                    <path
                        d={fillPath}
                        fill="url(#areaGradient)"
                    />

                    {/* Main curve line */}
                    <path
                        d={curvePath}
                        fill="none"
                        stroke="url(#curveLineGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#glow)"
                    />


                </svg>

                {/* Labels Positioned Below Curve */}
                <div className="flex justify-between mt-2 pt-2 border-t border-neutral-800/50">
                    <span className="text-[10px] font-mono text-neutral-500">{contrastRange.min.toFixed(1)}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{contrastRange.max.toFixed(1)}</span>
                </div>
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
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Contrast Curve</h3>

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
                            ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-sm'
                            : 'bg-neutral-800/50 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                            }`}
                    >
                        {curveTypeLabels[type].replace(' ', '\n')}
                    </button>
                ))}
            </div>

            {/* Contrast Range */}
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">Min Contrast</label>
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="21"
                        value={contrastRange.min}
                        onChange={(e) => handleRangeChange('min', parseFloat(e.target.value) || 1)}
                        className="w-full bg-neutral-800/50 rounded px-2 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border border-neutral-800 focus:border-indigo-500/50"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] text-neutral-500 uppercase block mb-1">Max Contrast</label>
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="21"
                        value={contrastRange.max}
                        onChange={(e) => handleRangeChange('max', parseFloat(e.target.value) || 21)}
                        className="w-full bg-neutral-800/50 rounded px-2 py-1.5 text-xs font-mono text-neutral-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-neutral-800 focus:border-purple-500/50"
                    />
                </div>
            </div>

            <p className="text-[10px] text-neutral-600 leading-relaxed text-center">
                {scaleSteps.length} steps • Updates in real-time
            </p>
        </div>
    );
};
