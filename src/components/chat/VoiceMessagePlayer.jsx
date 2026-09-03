import { useState, useRef, useEffect } from 'react';

function formatTime(seconds) {
if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
const m = Math.floor(seconds / 60);
const s = Math.floor(seconds % 60);
return `${m}:${s.toString().padStart(2, '0')}`;
}

function VoiceMessagePlayer({ src, isMine }) {
const audioRef = useRef(null);
const [playing, setPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);

useEffect(() => {
const audio = audioRef.current;
if (!audio) return;

const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
const handleLoadedMetadata = () => setDuration(audio.duration);
const handleEnded = () => { setPlaying(false); setCurrentTime(0); };

audio.addEventListener('timeupdate', handleTimeUpdate);
audio.addEventListener('loadedmetadata', handleLoadedMetadata);
audio.addEventListener('ended', handleEnded);

return () => {
audio.removeEventListener('timeupdate', handleTimeUpdate);
audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
audio.removeEventListener('ended', handleEnded);
};
}, []);

const togglePlay = (e) => {
e.stopPropagation();
const audio = audioRef.current;
if (!audio) return;
if (audio.paused) {
audio.play();
setPlaying(true);
} else {
audio.pause();
setPlaying(false);
}
};

const handleSeek = (e) => {
e.stopPropagation();
const audio = audioRef.current;
if (!audio || !duration) return;
const rect = e.currentTarget.getBoundingClientRect();
const ratio = (e.clientX - rect.left) / rect.width;
audio.currentTime = ratio * duration;
setCurrentTime(ratio * duration);
};

const progressPercent = duration ? (currentTime / duration) * 100 : 0;
const iconColor = isMine ? 'text-slate-950' : 'text-emerald-400';
const trackBg = isMine ? 'bg-slate-950/20' : 'bg-slate-700';
const trackFill = isMine ? 'bg-slate-950' : 'bg-emerald-400';

return (
<div className="flex items-center gap-2.5 min-w-[180px] py-1">
<audio ref={audioRef} src={src} preload="metadata" />

<button onClick={togglePlay} className={`shrink-0 ${iconColor}`}>
{playing ? (
<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
</svg>
) : (
<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
<path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
</svg>
)}
</button>

<div className="flex-1 min-w-0">
<div
onClick={handleSeek}
className={`w-full h-1.5 rounded-full cursor-pointer ${trackBg}`}
>
<div
className={`h-full rounded-full ${trackFill}`}
style={{ width: `${progressPercent}%` }}
/>
</div>
<span className={`text-[10px] mt-1 block ${isMine ? 'text-slate-950/70' : 'text-slate-400'}`}>
{formatTime(playing || currentTime > 0 ? currentTime : duration)}
</span>
</div>
</div>
);
}

export default VoiceMessagePlayer;


