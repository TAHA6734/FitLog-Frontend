import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const MAX_REASONABLE_DURATION = 3600;

function formatTime(seconds) {
if (!Number.isFinite(seconds)) return '0:00';
const m = Math.floor(seconds / 60);
const s = Math.floor(seconds % 60);
return `${m}:${s.toString().padStart(2, '0')}`;
}

function MusicPicker({ value, onChange, onClose, storyDurationSeconds }) {
const [file, setFile] = useState(value?.file || null);
const [audioDuration, setAudioDuration] = useState(0);
const [startSeconds, setStartSeconds] = useState(
Number.isFinite(value?.startSeconds) ? Math.floor(value.startSeconds) : 0
);
const [playing, setPlaying] = useState(false);
const [decoding, setDecoding] = useState(false);
const [elapsed, setElapsed] = useState(0);

const audioContextRef = useRef(null);
const audioBufferRef = useRef(null);
const sourceNodeRef = useRef(null);
const playbackStartCtxTimeRef = useRef(0);
const elapsedIntervalRef = useRef(null);

const maxStartInt = Math.max(0, Math.floor(audioDuration) - 1);
const clipEndSeconds = Math.min(audioDuration || 0, startSeconds + storyDurationSeconds);

const decodeFile = async (selectedFile) => {
setDecoding(true);
try {
if (!audioContextRef.current) {
audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
}
const arrayBuffer = await selectedFile.arrayBuffer();
const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

if (!Number.isFinite(audioBuffer.duration) || audioBuffer.duration <= 0 || audioBuffer.duration > MAX_REASONABLE_DURATION) {
toast.error('Bu ses dosyası bozuk veya desteklenmiyor gibi görünüyor. Farklı bir mp3 dene.');
setFile(null);
setDecoding(false);
return;
}

audioBufferRef.current = audioBuffer;
setAudioDuration(audioBuffer.duration);
setStartSeconds((prev) => Math.min(prev, Math.max(0, Math.floor(audioBuffer.duration) - 1)));
} catch {
toast.error('Bu ses dosyası çözümlenemedi. Farklı bir mp3 dene.');
setFile(null);
} finally {
setDecoding(false);
}
};

const handleFileChange = (e) => {
const selected = e.target.files[0];
if (!selected) return;
if (!selected.type.startsWith('audio/')) {
toast.error('Lütfen bir ses dosyası (mp3) seç.');
return;
}
if (selected.size > 15 * 1024 * 1024) {
toast.error('Müzik dosyası boyutu 15MB\'ı geçemez.');
return;
}

setFile(selected);
setStartSeconds(0);
setAudioDuration(0);
decodeFile(selected);
};

const stopPlayback = () => {
clearInterval(elapsedIntervalRef.current);
try {
sourceNodeRef.current?.stop();
} catch {
// zaten durmuşsa hata verir, sorun değil
}
sourceNodeRef.current = null;
setPlaying(false);
setElapsed(0);
};

const handlePreview = () => {
if (playing) {
stopPlayback();
return;
}

const ctx = audioContextRef.current;
const buffer = audioBufferRef.current;
if (!ctx || !buffer) {
toast.error('Ses henüz hazır değil, bekle.');
return;
}

if (ctx.state === 'suspended') {
ctx.resume();
}

const safeStart = Math.max(0, Math.min(startSeconds, Math.floor(buffer.duration) - 1));

const source = ctx.createBufferSource();
source.buffer = buffer;
source.connect(ctx.destination);
source.start(0, safeStart);
source.onended = () => {
setPlaying(false);
clearInterval(elapsedIntervalRef.current);
setElapsed(0);
};

sourceNodeRef.current = source;
playbackStartCtxTimeRef.current = ctx.currentTime;
setPlaying(true);
setElapsed(0);

elapsedIntervalRef.current = setInterval(() => {
const now = ctx.currentTime - playbackStartCtxTimeRef.current;
setElapsed(now);
}, 100);
};

useEffect(() => {
return () => {
stopPlayback();
audioContextRef.current?.close();
};
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const handleSliderChange = (e) => {
if (playing) stopPlayback();
const parsed = parseInt(e.target.value, 10);
const safe = Number.isInteger(parsed) ? Math.max(0, Math.min(parsed, maxStartInt)) : 0;
setStartSeconds(safe);
};

const handleConfirm = () => {
if (!file) {
toast.error('Bir müzik dosyası seç.');
return;
}
stopPlayback();
onChange({ file, startSeconds });
onClose();
};

const handleRemove = () => {
stopPlayback();
onChange(null);
onClose();
};

const clipWidthSeconds = Math.max(0, clipEndSeconds - startSeconds);

return (
<div className="absolute inset-x-0 bottom-0 z-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 rounded-t-2xl p-4 space-y-3">
<div className="flex items-center justify-between">
<h3 className="text-white text-sm font-semibold">Arka Plan Müziği</h3>
<button onClick={onClose} className="text-slate-400 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

{!file ? (
<label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition text-slate-500">
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6a3 3 0 013-3h6l3 3v9a3 3 0 01-3 3h-1.5m-9-6H6a3 3 0 00-3 3v3a3 3 0 003 3h1.5a3 3 0 003-3V9m6 0v6" />
</svg>
<span className="text-xs">MP3 dosyası seç</span>
<input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
</label>
) : (
<>
<p className="text-xs text-slate-400 truncate">🎵 {file.name}</p>

{decoding ? (
<p className="text-xs text-slate-500 text-center py-3">Ses dosyası işleniyor...</p>
) : (
<>
<div>
<div className="flex items-center justify-between mb-1.5">
<p className="text-xs text-slate-500">Başlangıç noktası</p>
<p className="text-xs tabular-nums text-emerald-400 font-medium">
{playing ? formatTime(elapsed) : formatTime(startSeconds)} / {formatTime(audioDuration)}
</p>
</div>

<input
type="range"
min={0}
max={maxStartInt}
step={1}
value={Math.min(startSeconds, maxStartInt)}
onChange={handleSliderChange}
className="w-full accent-emerald-500"
/>

<p className="text-[10px] text-slate-600 mt-1.5">
Paylaşılacak bölüm: {formatTime(startSeconds)} — {formatTime(clipEndSeconds)} ({clipWidthSeconds.toFixed(0)}sn, {storyDurationSeconds}sn hikaye süresine göre)
</p>
</div>

<div className="flex gap-2">
<button
onClick={handlePreview}
className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg py-2 transition"
>
{playing ? '⏸ Durdur' : '▶ Önizle'}
</button>
<button
onClick={handleRemove}
className="flex-1 bg-slate-800 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg py-2 transition"
>
Kaldır
</button>
<button
onClick={handleConfirm}
className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg py-2 transition"
>
Onayla
</button>
</div>
</>
)}
</>
)}
</div>
);
}

export default MusicPicker;





