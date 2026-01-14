import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';
import { X } from 'lucide-react';

interface ColorPickerPopoverProps {
    color: string;
    onChange: (color: string) => void;
    onClose: () => void;
    referenceElement: HTMLElement;
    actionLabel?: string;
    onAction?: () => void;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
    color,
    onChange,
    onClose,
    referenceElement,
    actionLabel = 'Apply',
    onAction,
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    const { x, y, strategy, refs } = useFloating({
        placement: 'bottom-start',
        middleware: [offset(8), flip(), shift({ padding: 10 })],
        whileElementsMounted: autoUpdate,
    });

    // Set reference element on mount and when it changes
    useEffect(() => {
        refs.setReference(referenceElement);
    }, [referenceElement, refs]);

    // Handle click outside and escape key
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Check if click is outside popover AND outside reference element
            if (
                popoverRef.current &&
                !popoverRef.current.contains(target) &&
                !referenceElement.contains(target)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Use capture phase for more reliable detection
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, referenceElement]);

    const handleAction = () => {
        if (onAction) onAction();
        onClose();
    };

    return createPortal(
        <div
            ref={(node) => {
                popoverRef.current = node;
                refs.setFloating(node);
            }}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 9999,
            }}
            className="flex flex-col bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3"
        >
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Pick Color
                </span>
                <button
                    onClick={onClose}
                    className="text-neutral-500 hover:text-neutral-300 p-1 rounded-md hover:bg-neutral-800 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="custom-picker mb-3">
                <HexColorPicker color={color} onChange={onChange} />
            </div>

            {onAction && (
                <button
                    onClick={handleAction}
                    className="w-full bg-white text-black text-xs font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors shadow-sm"
                >
                    {actionLabel}
                </button>
            )}
        </div>,
        document.body
    );
};
