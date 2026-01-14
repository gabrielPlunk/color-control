import React, { useState } from 'react';
import { Check, FileJson, Figma } from 'lucide-react';
import { useColorStore } from '../store/useColorStore';

export const ExportPanel: React.FC = () => {
    const { palette } = useColorStore();
    const [copied, setCopied] = useState<string | null>(null);

    const generateJson = () => {
        const obj: Record<string, Record<string, string>> = {};

        palette.forEach(row => {
            // const base = baseColors.find(b => b.id === row.baseColorId);
            // Use base color name or hex as key. 
            const name = `color-${row.baseColorId.substring(0, 4)}`;

            obj[name] = {};
            row.steps.forEach(step => {
                obj[name][step.stepId] = step.hex;
            });
        });
        return JSON.stringify(obj, null, 2);
    };

    const generateFigma = () => {
        // Figma tokens format (Tokens Studio or just variables JSON)
        return generateJson();
    };

    const handleCopy = (type: 'json' | 'figma') => {
        const text = type === 'json' ? generateJson() : generateFigma();
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Export</h2>
            <div className="space-y-2">
                <button
                    onClick={() => handleCopy('json')}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs text-neutral-300 transition-all border border-transparent hover:border-neutral-600 group"
                >
                    <div className={`p-1.5 rounded-md ${copied === 'json' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-900 text-neutral-400 group-hover:text-white transition-colors'}`}>
                        {copied === 'json' ? <Check size={14} /> : <FileJson size={14} />}
                    </div>
                    <span className="font-medium">Copy JSON</span>
                </button>

                <button
                    onClick={() => handleCopy('figma')}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs text-neutral-300 transition-all border border-transparent hover:border-neutral-600 group"
                >
                    <div className={`p-1.5 rounded-md ${copied === 'figma' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-900 text-neutral-400 group-hover:text-white transition-colors'}`}>
                        {copied === 'figma' ? <Check size={14} /> : <Figma size={14} />}
                    </div>
                    <span className="font-medium">Export for Figma</span>
                </button>
            </div>
        </div>
    );
};
