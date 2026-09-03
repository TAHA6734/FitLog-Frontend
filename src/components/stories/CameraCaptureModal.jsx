import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MAX_VIDEO_SECONDS = 15;

function CameraCaptureModal({ isOpen, onClose, onCapture }) {
const [mode, setMode] = useState('photo');
const [streamReady, setStreamReady] = useState(false);
const [recording, setRecording] = useState(false);
const [elapsed, setElapsed] = useState(0);

const videoRef = useRef(null);
const streamRef = useRef(null);
const canvasRef = useRef(null);
const recorderRef = useRef(null);
const chunksRef = useRef([]);
const timerRef = useRef(null);

useEffect(() => {
if (!isOpen) return;

let cancelled = false;

(async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: 'user' },
audio: mode === 'video',
});
if (cancelled) {
stream.getTracks().forEach((t) => t.stop());
return;
}
streamRef.current = stream;
if (videoRef.current) {
videoRef.current.srcObject = stream;
}
setStreamReady(true);
} catch {
toast.error('Kameraya erişilemedi. Tarayıcı izinlerini kontrol et.');
onClose();
}
})();

return () => {
cancelled = true;
streamRef.current?.getTracks().forEach((t) => t.stop());
streamRef.current = null;
setStreamReady(false);
clearInterval(timerRef.current);
};
}, [isOpen, mode, onClose]);

const capturePhoto = () => {
const video = videoRef.current;
const canvas = canvasRef.current;
if (!video || !canvas) return;

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

canvas.toBlob((blob) => {
if (!blob) return;
const file = new File([blob], `story-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
onCapture(file, 'image');
}, 'image/jpeg', 0.92);
};

const startRecording = () => {
const stream = streamRef.current;
if (!stream) return;

const mimeType = MediaRecorder.isTypeSupported('video/webm')
? 'video/webm'
: 'video/mp4';

const recorder = new MediaRecorder(stream, { mimeType });
chunksRef.current = [];

recorder.ondataavailable = (e) => {
if (e.data.size > 0) chunksRef.current.push(e.data);
};

recorder.onstop = () => {
const blob = new Blob(chunksRef.current, { type: mimeType });
const ext = mimeType === 'video/webm' ? 'webm' : 'mp4';
const file = new File([blob], `story-video-${Date.now()}.${ext}`, { type: mimeType });
onCapture(file, 'video');
};

recorderRef.current = recorder;
recorder.start();
setRecording(true);
setElapsed(0);

timerRef.current = setInterval(() => {
setElapsed((prev) => {
const next = prev + 1;
if (next >= MAX_VIDEO_SECONDS) {
stopRecording();
}
return next;
});
}, 1000);
};

const stopRecording = () => {
clearInterval(timerRef.current);
recorderRef.current?.stop();
setRecording(false);
};

const handleClose = () => {
if (recording) stopRecording();
onClose();
};

return (
<AnimatePresence>
{isOpen && (
<motion.div
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
className="fixed inset-0 z-[80] bg-black flex items-center justify-center"
>
<div className="relative w-full h-full sm:w-[420px] sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-black">
<video
ref={videoRef}
autoPlay
playsInline
muted
className="w-full h-full object-cover scale-x-[-1]"
/>
<canvas ref={canvasRef} className="hidden" />

<button
onClick={handleClose}
className="absolute top-4 left-4 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>

{!recording && (
<div className="absolute top-4 right-4 z-10 flex bg-black/40 rounded-full p-1 text-xs">
<button
onClick={() => setMode('photo')}
className={`px-3 py-1.5 rounded-full font-medium transition ${mode === 'photo' ? 'bg-white text-slate-950' : 'text-white'}`}
>
Fotoğraf
</button>
<button
onClick={() => setMode('video')}
className={`px-3 py-1.5 rounded-full font-medium transition ${mode === 'video' ? 'bg-white text-slate-950' : 'text-white'}`}
>
Video
</button>
</div>
)}

{recording && (
<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5">
<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
<span className="text-white text-sm font-medium tabular-nums">
0:{elapsed.toString().padStart(2, '0')} / 0:{MAX_VIDEO_SECONDS}
</span>
</div>
)}

<div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-10">
{mode === 'photo' ? (
<button
onClick={capturePhoto}
disabled={!streamReady}
className="w-16 h-16 rounded-full bg-white border-4 border-white/30 disabled:opacity-40 active:scale-95 transition"
/>
) : (
<button
onClick={recording ? stopRecording : startRecording}
disabled={!streamReady}
className="relative w-16 h-16 rounded-full border-4 border-white/60 disabled:opacity-40 flex items-center justify-center active:scale-95 transition"
>
<span className={`transition-all rounded-full bg-red-500 ${recording ? 'w-6 h-6 rounded-md' : 'w-12 h-12'}`} />
</button>
)}
</div>
</div>
</motion.div>
)}
</AnimatePresence>
);
}

export default CameraCaptureModal;





