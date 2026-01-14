import React from 'react';
import { useColorStore } from '../store/useColorStore';
import { PaletteLabelsColumn } from './palette/PaletteLabelsColumn';
import { PaletteColumn } from './palette/PaletteColumn';
import { AddColorColumn } from './palette/AddColorColumn';

export const PaletteGrid: React.FC = () => {
    const { palette, baseColors } = useColorStore();

    return (
        <div className="flex gap-0 pb-12 min-w-max">
            {/* 1. Add Color Button */}
            {baseColors.length < 40 && (
                <AddColorColumn />
            )}

            {/* 2. Labels Column with inline contrast inputs */}
            <PaletteLabelsColumn />

            {/* 3. Existing Palette Columns */}
            {palette.map((column) => {
                const baseColor = baseColors.find(b => b.id === column.baseColorId);
                if (!baseColor) return null;

                return (
                    <PaletteColumn
                        key={column.baseColorId}
                        column={column}
                        baseColor={baseColor}
                    />
                );
            })}
        </div>
    );
};

