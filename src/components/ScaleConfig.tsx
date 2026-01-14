import React from 'react';
import { useColorStore } from '../store/useColorStore';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ScaleStep } from '../types';

interface SortableStepProps {
    step: ScaleStep;
    updateScaleStep: (id: string, updates: Partial<ScaleStep>) => void;
    removeScaleStep: (id: string) => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, updateScaleStep, removeScaleStep }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 group ${isDragging ? 'bg-neutral-800/50 rounded shadow-lg' : ''}`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-600 hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                title="Drag to reorder"
            >
                <GripVertical size={12} />
            </button>

            {/* Name */}
            <input
                className="bg-neutral-800/50 rounded px-2 py-1.5 text-xs font-mono text-neutral-300 w-20 focus:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all border border-transparent focus:border-neutral-600"
                value={step.name}
                onChange={(e) => updateScaleStep(step.id, { name: e.target.value })}
                placeholder="Name"
            />

            {/* Contrast Input */}
            <div className="flex-1">
                <input
                    type="number"
                    step="0.1"
                    className="bg-neutral-800/30 w-full text-center text-xs font-mono py-1.5 rounded border border-neutral-800 focus:outline-none focus:border-neutral-600 text-neutral-300"
                    placeholder="—"
                    value={step.targetContrastWhite || ''}
                    onChange={(e) => updateScaleStep(step.id, { targetContrastWhite: e.target.value ? parseFloat(e.target.value) : null })}
                    title="Target Contrast vs White"
                />
            </div>

            {/* Remove */}
            <button
                onClick={() => removeScaleStep(step.id)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove Step"
            >
                <Trash2 size={12} />
            </button>
        </div>
    );
};

export const ScaleConfig: React.FC = () => {
    const { scaleSteps, updateScaleStep, addScaleStep, removeScaleStep, setScaleSteps } = useColorStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = scaleSteps.findIndex((s) => s.id === active.id);
            const newIndex = scaleSteps.findIndex((s) => s.id === over.id);
            const newSteps = arrayMove(scaleSteps, oldIndex, newIndex);
            setScaleSteps(newSteps);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Steps ({scaleSteps.length}/20)</h2>
            </div>

            <div className="space-y-2">
                <div className="flex gap-2 px-1">
                    <div className="w-6"></div> {/* Spacer for drag handle */}
                    <div className="w-20 text-[10px] font-bold text-neutral-600 uppercase">Name</div>
                    <div className="flex-1 text-[10px] font-bold text-neutral-600 uppercase text-center">Contrast (W)</div>
                    <div className="w-6"></div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={scaleSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {scaleSteps.map((step) => (
                            <SortableStep
                                key={step.id}
                                step={step}
                                updateScaleStep={updateScaleStep}
                                removeScaleStep={removeScaleStep}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {scaleSteps.length < 20 && (
                <button
                    onClick={addScaleStep}
                    className="w-full py-2 border border-dashed border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/30 rounded-lg text-neutral-500 hover:text-neutral-300 text-xs font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={12} />
                    Add Step
                </button>
            )}
        </div>
    );
};
