import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { storyApi } from '../../api/storyApi';
import CameraCaptureModal from './CameraCaptureModal';
import TextOverlayEditor, { TextOverlayLayer } from './TextOverlayEditor';
import MusicPicker from './MusicPicker';

const DURATION_OPTIONS = [5, 10, 15];

function CreateStoryModal({ isOpen, onClose, onCreated }) {
const [file, setFile] = useState(null);
const [preview, setPreview] = useState(null);
const [mediaType, setMediaType] = useState(null);
const [duration, setDuration] = useState(5);
const [loading, setLoading] = useState(false);

const [cameraOpen, setCameraOpen] = useState(false);
const [textEditorOpen, setTextEditorOpen] = useState(false);
const [musicPickerOpen, setMusicPickerOpen] = useState(false);

const [textOverlay, setTextOverlay] = useState({ content: '', fontFamily: 'sans', fontSize: 28, color: '#ffffff', xPercent: 50, yPercent: 50 });
const [music, setMusic] = useState(null);

const previewRef = useRef(null);

const handleFileChange = (e) => {
const selected = e.target.files[0];
if (!selected) return;
applyFile(selected);
};

const applyFile = (selected) => {
const isVideo = selected.type.startsWith('video/');
if (isVideo) {
const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
if (!allowedVideoTypes.includes(selected.type)) {
toast.error('Sadece mp4, mov veya webm formatları desteklenir.');
return;
}
if (selected.size > 50 * 1024 * 1024) {
toast.error('Video boyutu 50MB\'ı geçemez.');
return;
}
} else {
if (selected.size > 10 * 1024 * 1024) {
toast.error('Fotoğraf boyutu 10MB\'ı geçemez.');
return;
}
}

setFile(selected);
setMediaType(isVideo ? 'video' : 'image');
setPreview(URL.createObjectURL(selected));
};

const handleCameraCapture = (capturedFile, capturedType) => {
setCameraOpen(false);
setFile(capturedFile);
setMediaType(capturedType);
setPreview(URL.createObjectURL(capturedFile));
};

const handleReset = () => {
setFile(null);
setPreview(null);
setMediaType(null);
setDuration(5);
setTextOverlay({ content: '', fontFamily: 'sans', fontSize: 28, color: '#ffffff', xPercent: 50, yPercent: 50 });
setMusic(null);
};

const handleClose = () => {
handleReset();
onClose();
};

const handleTextDrag = (xPercent, yPercent) => {
setTextOverlay((prev) => ({ ...prev, xPercent, yPercent }));
};

const handleSubmit = async () => {
if (!file) return;
setLoading(true);
try {
const formData = new FormData();
formData.append('Media', file);
if (mediaType === 'image') formData.append('DurationSeconds', duration);

if (textOverlay.content.trim()) {
formData.append('TextContent', textOverlay.content.trim());
formData.append('TextFontFamily', textOverlay.fontFamily);
formData.append('TextFontSize', textOverlay.fontSize);
formData.append('TextColor', textOverlay.color);
formData.append('TextPositionXPercent', textOverlay.xPercent);
formData.append('TextPositionYPercent', textOverlay.yPercent);
}


if (music) {
const safeStart = Number.isFinite(music.startSeconds) ? Math.max(0, music.startSeconds) : 0;
formData.append('Music', music.file);
formData.append('MusicStartSeconds', safeStart);
}




await storyApi.create(formData);
toast.success('Hikayen paylaşıldı! ✨');
handleReset();
onCreated?.();
onClose();
} catch (err) {
toast.error(err.response?.data?.message || 'Hikaye paylaşılamadı.');
} finally {
setLoading(false);
}
};

return (
<>
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
onClick={handleClose}
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
>
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
<h2 className="text-white font-semibold">Hikaye Paylaş</h2>
<button onClick={handleClose} className="text-slate-500 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="p-5">
{!preview ? (
<div className="grid grid-cols-2 gap-3">
<button
onClick={() => setCameraOpen(true)}
className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-slate-700 rounded-xl hover:border-emerald-500/50 transition text-slate-400"
>
<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.132.174C3.196 7.57 2.25 8.657 2.25 9.93V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.93c0-1.273-.946-2.36-2.204-2.526a48.108 48.108 0 00-1.132-.174 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
</svg>
<span className="text-xs">Kameradan Çek</span>
</button>
<label className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-slate-600 transition text-slate-400">
<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
<span className="text-xs">Cihazdan Seç</span>
<input type="file" accept="image/*,video/mp4,video/quicktime,video/webm" onChange={handleFileChange} className="hidden" />
</label>
</div>
) : (
<>
<div
ref={previewRef}
className="relative w-full aspect-[9/16] max-h-[420px] mx-auto rounded-xl overflow-hidden bg-black"
>
{mediaType === 'video' ? (
<video src={preview} className="w-full h-full object-contain" autoPlay loop muted playsInline />
) : (
<img src={preview} alt="" className="w-full h-full object-contain" />
)}

<TextOverlayLayer text={textOverlay} previewRef={previewRef} onDragEnd={handleTextDrag} />

<button
onClick={handleReset}
className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition z-10"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>

{textEditorOpen && (
<TextOverlayEditor
value={textOverlay}
onChange={setTextOverlay}
onClose={() => setTextEditorOpen(false)}
/>
)}

{musicPickerOpen && (
<MusicPicker
value={music}
onChange={setMusic}
onClose={() => setMusicPickerOpen(false)}
storyDurationSeconds={mediaType === 'image' ? duration : 15}
/>
)}




</div>

<div className="flex items-center gap-2 mt-3">
<button
onClick={() => setTextEditorOpen(true)}
className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-full py-2 transition"
>
<span className="font-bold">Aa</span> Yazı
</button>
<button
onClick={() => setMusicPickerOpen(true)}
className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-full py-2 transition ${
music ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
}`}
>
🎵 Müzik
</button>
</div>

{mediaType === 'image' && (
<div className="flex items-center gap-2 mt-3">
<span className="text-xs text-slate-500 shrink-0">Süre:</span>
{DURATION_OPTIONS.map((d) => (
<button
key={d}
onClick={() => setDuration(d)}
className={`px-3 py-1 rounded-full text-xs font-medium transition ${
duration === d ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
}`}
>
{d}sn
</button>
))}
</div>
)}

<button
onClick={handleSubmit}
disabled={loading}
className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg py-2.5 transition"
>
{loading ? 'Paylaşılıyor...' : 'Hikayeni Paylaş'}
</button>
</>
)}
</div>
</motion.div>
</>
)}
</AnimatePresence>

<CameraCaptureModal
isOpen={cameraOpen}
onClose={() => setCameraOpen(false)}
onCapture={handleCameraCapture}
/>
</>
);
}

export default CreateStoryModal;



