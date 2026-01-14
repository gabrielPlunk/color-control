import React from 'react';
import { useColorStore } from '../store/useColorStore';
import type { AdvancedCurveType, EasingDirection, ChannelCurve } from '../types';
import { advancedCurveTypeLabels, easingDirectionLabels, getAdvancedCurvePoints } from '../utils/curveUtils';

const curveTypes: AdvancedCurveType[] = ['linear', 'quadratic', 'cubic', 'sine', 'exponential'];
const easingDirections: EasingDirection[] = ['ease-in', 'ease-out', 'ease-in-out'];

interface ChannelCurveEditorProps {
    label: string;
    curve: ChannelCurve;
    onChange: (curve: ChannelCurve) => void;
    rangeUnit?: string;
    rangeStep?: number;
    rangeMin?: number;
    rangeMax?: number;
}

const ChannelCurveEditor: React.FC<ChannelCurveEditorProps> = ({
    label,
    curve,
    onChange,
    rangeUnit = '',
    rangeStep = 0.01,
    rangeMin = 0,
    rangeMax = 1,
}) => {
    const curvePoints = getAdvancedCurvePoints(curve, 20);

    return (
        <div className="space-y-3 p-3 bg-neutral-800/50 rounded-lg">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {label}
                </span>
            </div>

            {/* Range Controls */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] text-neutral-500 w-8">Min</label>
                    <input
                        type="number"
                        value={curve.range.min}
                        onChange={(e) => onChange({
                            ...curve,
                            range: { ...curve.range, min: parseFloat(e.target.value) || 0 }
                        })}
                        step={rangeStep}
                        min={rangeMin}
                        max={rangeMax}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                    />
                    <span className="text-[10px] text-neutral-500 w-4">{rangeUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-[10px] text-neutral-500 w-8">Max</label>
                    <input
                        type="number"
                        value={curve.range.max}
                        onChange={(e) => onChange({
                            ...curve,
                            range: { ...curve.range, max: parseFloat(e.target.value) || 0 }
                        })}
                        step={rangeStep}
                        min={rangeMin}
                        max={rangeMax}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                    />
                    <span className="text-[10px] text-neutral-500 w-4">{rangeUnit}</span>
                </div>
            </div>

            {/* Curve Type & Direction */}
            <div className="grid grid-cols-2 gap-2">
                <select
                    value={curve.curveType}
                    onChange={(e) => onChange({ ...curve, curveType: e.target.value as AdvancedCurveType })}
                    className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                >
                    {curveTypes.map(type => (
                        <option key={type} value={type}>{advancedCurveTypeLabels[type]}</option>
                    ))}
                </select>
                <select
                    value={curve.direction}
                    onChange={(e) => onChange({ ...curve, direction: e.target.value as EasingDirection })}
                    className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-500"
                >
                    {easingDirections.map(dir => (
                        <option key={dir} value={dir}>{easingDirectionLabels[dir]}</option>
                    ))}
                </select>
            </div>

            {/* Mini Curve Preview */}
            <div className="h-10 bg-neutral-900 rounded overflow-hidden">
                <svg
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient id={`gradient-${label}`} x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
                        </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                        d={`M 0 40 ${curvePoints.map(p => `L ${p.x * 100} ${40 - p.y * 36}`).join(' ')} L 100 40 Z`}
                        fill={`url(#gradient-${label})`}
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
    );
};

export const OklchAdvancedSettings: React.FC = () => {
    const { colorSpace, oklchSettings, setOklchChromaCurve, setOklchHueCurve } = useColorStore();

    // Only show when OKLCH is selected
    if (colorSpace !== 'oklch') {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                OKLCH Curves
            </div>

            <ChannelCurveEditor
                label="Chroma"
                curve={oklchSettings.chroma}
                onChange={setOklchChromaCurve}
                rangeStep={0.01}
                rangeMin={0}
                rangeMax={0.4}
            />

            <ChannelCurveEditor
                label="Hue Shift"
                curve={oklchSettings.hue}
                onChange={setOklchHueCurve}
                rangeUnit="°"
                rangeStep={1}
                rangeMin={-180}
                rangeMax={180}
            />
        </div>
    );
};
