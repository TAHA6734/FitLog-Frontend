import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { messageApi } from '../../api/messageApi';

function formatTime(seconds) {
const m = Math.floor(seconds / 60);
const s = Math.floor(seconds % 60);
return `${m}:${s.toString().padStart(2, '0')}`;
}

function VoiceRecorder({ receiverId, replyToMessageId, onSent, onRecordingStateChange }) {
const [recording, setRecording] = useState(false);
const [elapsed, setElapsed] = useState(0);
const [sending, setSending] = useState(false);

const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);
const timerRef = useRef(null);
const cancelledRef = useRef(false);

const updateRecording = (value) => {
setRecording(value);
onRecordingStateChange?.(value);
};

const startRecording = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
cancelledRef.current = false;

const mimeType = MediaRecorder.isTypeSupported('audio/webm')
? 'audio/webm'
: 'audio/mp4';

const recorder = new MediaRecorder(stream, { mimeType });
chunksRef.current = [];

recorder.ondataavailable = (e) => {
if (e.data.size > 0) chunksRef.current.push(e.data);
};

recorder.onstop = async () => {
stream.getTracks().forEach((track) => track.stop());
clearInterval(timerRef.current);

if (cancelledRef.current || chunksRef.current.length === 0) {
setElapsed(0);
return;
}

const blob = new Blob(chunksRef.current, { type: mimeType });
setSending(true);
try {
await messageApi.sendVoice(receiverId, blob, replyToMessageId || null);
onSent?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Sesli mesaj gönderilemedi.');
} finally {
setSending(false);
setElapsed(0);
}
};

mediaRecorderRef.current = recorder;
recorder.start();
updateRecording(true);
setElapsed(0);

timerRef.current = setInterval(() => {
setElapsed((prev) => prev + 1);
}, 1000);
} catch {
toast.error('Mikrofona erişilemedi. Tarayıcı izinlerini kontrol et.');
}
};

const stopAndSend = () => {
cancelledRef.current = false;
mediaRecorderRef.current?.stop();
updateRecording(false);
};

const cancelRecording = () => {
cancelledRef.current = true;
mediaRecorderRef.current?.stop();
updateRecording(false);
setElapsed(0);
};

if (sending) {
return (
<div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 rounded-full flex-1">
<div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
<span className="text-xs text-slate-400">Gönderiliyor...</span>
</div>
);
}

if (recording) {
return (
<div className="flex items-center gap-3 px-3 py-2 bg-slate-900 rounded-full flex-1">
<span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
<span className="text-sm text-white font-medium tabular-nums shrink-0">{formatTime(elapsed)}</span>
<span className="text-xs text-slate-500 flex-1">Kaydediliyor...</span>
<button
onClick={cancelRecording}
className="text-slate-500 hover:text-red-400 transition p-1 shrink-0"
title="İptal et"
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<button
onClick={stopAndSend}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-2 transition shrink-0"
title="Gönder"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
</svg>
</button>
</div>
);
}

return (
<button
type="button"
onClick={startRecording}
className="text-slate-400 hover:text-emerald-400 transition p-2.5 shrink-0"
title="Sesli mesaj kaydet"
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
</svg>
</button>
);
}

export default VoiceRecorder;





