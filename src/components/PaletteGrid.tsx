import React from 'react';
import { useColorStore } from '../store/useColorStore';
import { PaletteLabelsColumn } from './palette/PaletteLabelsColumn';
import { PaletteColumn } from './palette/PaletteColumn';

export const PaletteGrid: React.FC = () => {
    const { palette, baseColors } = useColorStore();

    return (
        <div className="flex gap-0 min-w-max">
            {/* Labels Column with add color trigger and inline contrast inputs */}
            <PaletteLabelsColumn />

            {/* Palette Columns */}
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


