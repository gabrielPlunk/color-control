import chroma from 'chroma-js';

const getContrastManual = (y1: number, y2: number) => {
    const l1 = Math.max(y1, y2);
    const l2 = Math.min(y1, y2);
    return (l1 + 0.05) / (l2 + 0.05);
};

const hex = '#ff0000';
const white = '#ffffff';

const c_chroma = chroma.contrast(hex, white);
const y_hex = chroma(hex).luminance();
const y_white = chroma(white).luminance();
const c_manual = getContrastManual(y_hex, y_white);

console.log(`Chroma: ${c_chroma}`);
console.log(`Manual: ${c_manual}`);
console.log(`Match? ${Math.abs(c_chroma - c_manual) < 0.0001}`);
