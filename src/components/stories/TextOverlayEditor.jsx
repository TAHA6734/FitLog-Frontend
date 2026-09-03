import { useRef } from 'react';

const FONT_OPTIONS = [
{ key: 'sans', label: 'Klasik', className: 'font-sans font-semibold' },
{ key: 'serif', label: 'Zarif', className: 'font-serif font-semibold' },
{ key: 'mono', label: 'Daktilo', className: 'font-mono font-semibold' },
{ key: 'impact', label: 'Kalın', className: 'font-sans font-black uppercase tracking-wide' },
];

export function getFontClassName(key) {
return FONT_OPTIONS.find((f) => f.key === key)?.className || FONT_OPTIONS[0].className;
}

export function TextOverlayLayer({ text, previewRef, onDragEnd, editable = true }) {
const draggingRef = useRef(false);

const handlePointerDown = (e) => {
if (!editable) return;
draggingRef.current = true;
e.stopPropagation();
};

const handlePointerMove = (e) => {
if (!draggingRef.current || !previewRef.current) return;
const rect = previewRef.current.getBoundingClientRect();
const clientX = e.touches ? e.touches[0].clientX : e.clientX;
const clientY = e.touches ? e.touches[0].clientY : e.clientY;
let xPct = ((clientX - rect.left) / rect.width) * 100;
let yPct = ((clientY - rect.top) / rect.height) * 100;
xPct = Math.min(95, Math.max(5, xPct));
yPct = Math.min(95, Math.max(5, yPct));
onDragEnd(xPct, yPct);
};

const handlePointerUp = () => {
draggingRef.current = false;
};

if (!text?.content) return null;

return (
<div
onMouseDown={handlePointerDown}
onMouseMove={handlePointerMove}
onMouseUp={handlePointerUp}
onMouseLeave={handlePointerUp}
onTouchStart={handlePointerDown}
onTouchMove={handlePointerMove}
onTouchEnd={handlePointerUp}
style={{
position: 'absolute',
left: `${text.xPercent}%`,
top: `${text.yPercent}%`,
transform: 'translate(-50%, -50%)',
color: text.color,
fontSize: `${text.fontSize}px`,
touchAction: 'none',
cursor: editable ? 'grab' : 'default',
textShadow: '0 1px 6px rgba(0,0,0,0.5)',
maxWidth: '85%',
textAlign: 'center',
wordBreak: 'break-word',
}}
className={getFontClassName(text.fontFamily)}
>
{text.content}
</div>
);
}

function TextOverlayEditor({ value, onChange, onClose }) {
const content = value?.content || '';

const update = (patch) => onChange({ ...value, ...patch });

return (
<div className="absolute inset-x-0 bottom-0 z-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 rounded-t-2xl p-4 space-y-3">
<div className="flex items-center justify-between">
<h3 className="text-white text-sm font-semibold">Yazı Ekle</h3>
<button onClick={onClose} className="text-slate-400 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<textarea
value={content}
onChange={(e) => update({ content: e.target.value })}
maxLength={100}
rows={2}
placeholder="Bir şeyler yaz..."
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
/>

<div>
<p className="text-xs text-slate-500 mb-1.5">Font</p>
<div className="flex gap-2">
{FONT_OPTIONS.map((f) => (
<button
key={f.key}
onClick={() => update({ fontFamily: f.key })}
className={`px-3 py-1.5 rounded-lg text-xs transition ${f.className} ${
value.fontFamily === f.key ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
}`}
>
{f.label}
</button>
))}
</div>
</div>

<div className="flex items-center gap-3">
<p className="text-xs text-slate-500 w-16 shrink-0">Boyut</p>
<input
type="range"
min={16}
max={56}
value={value.fontSize}
onChange={(e) => update({ fontSize: Number(e.target.value) })}
className="flex-1 accent-emerald-500"
/>
</div>

<div className="flex items-center gap-3">
<p className="text-xs text-slate-500 w-16 shrink-0">Renk</p>
<input
type="color"
value={value.color}
onChange={(e) => update({ color: e.target.value })}
className="w-10 h-8 rounded cursor-pointer bg-transparent border border-slate-700"
/>
<div className="flex gap-1.5">
{['#ffffff', '#10b981', '#fbbf24', '#f43f5e', '#3b82f6'].map((c) => (
<button
key={c}
onClick={() => update({ color: c })}
className="w-6 h-6 rounded-full border border-slate-700"
style={{ backgroundColor: c }}
/>
))}
</div>
</div>

<p className="text-[10px] text-slate-600">Yazıyı önizlemede sürükleyerek konumunu değiştirebilirsin.</p>
</div>
);
}

export default TextOverlayEditor;






