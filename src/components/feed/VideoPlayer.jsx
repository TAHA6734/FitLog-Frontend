import { useState, useRef, useEffect } from 'react';

function formatTime(seconds) {
if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
const m = Math.floor(seconds / 60);
const s = Math.floor(seconds % 60);
return `${m}:${s.toString().padStart(2, '0')}`;
}

function VideoPlayer({ src }) {
const videoRef = useRef(null);
const containerRef = useRef(null);
const hideTimeoutRef = useRef(null);

const [playing, setPlaying] = useState(false);
const [muted, setMuted] = useState(true);
const [volume, setVolume] = useState(1);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [showControls, setShowControls] = useState(true);
const [isFullscreen, setIsFullscreen] = useState(false);

const togglePlay = (e) => {
e?.stopPropagation();
const video = videoRef.current;
if (!video) return;
if (video.paused) {
video.play();
setPlaying(true);
} else {
video.pause();
setPlaying(false);
}
};

const toggleMute = (e) => {
e.stopPropagation();
const video = videoRef.current;
if (!video) return;
const newMuted = !video.muted;
video.muted = newMuted;
setMuted(newMuted);
if (!newMuted && volume === 0) {
video.volume = 1;
setVolume(1);
}
};

const handleVolumeChange = (e) => {
e.stopPropagation();
const video = videoRef.current;
if (!video) return;
const value = parseFloat(e.target.value) / 100;
video.volume = value;
video.muted = value === 0;
setVolume(value);
setMuted(value === 0);
};

const handleTimeUpdate = () => {
const video = videoRef.current;
if (!video) return;
setCurrentTime(video.currentTime);
};

const handleLoadedMetadata = () => {
const video = videoRef.current;
if (!video) return;
setDuration(video.duration);
};

const handleSeek = (e) => {
e.stopPropagation();
const video = videoRef.current;
if (!video || !duration) return;
const rect = e.currentTarget.getBoundingClientRect();
const ratio = (e.clientX - rect.left) / rect.width;
video.currentTime = ratio * duration;
setCurrentTime(ratio * duration);
};

const toggleFullscreen = (e) => {
e.stopPropagation();
const container = containerRef.current;
if (!container) return;
if (!document.fullscreenElement) {
container.requestFullscreen?.();
} else {
document.exitFullscreen?.();
}
};

useEffect(() => {
const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
document.addEventListener('fullscreenchange', handleFsChange);
return () => document.removeEventListener('fullscreenchange', handleFsChange);
}, []);

const handleMouseMove = () => {
setShowControls(true);
clearTimeout(hideTimeoutRef.current);
if (playing) {
hideTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
}
};

useEffect(() => {
return () => clearTimeout(hideTimeoutRef.current);
}, []);

const progressPercent = duration ? (currentTime / duration) * 100 : 0;
const volumePercent = muted ? 0 : volume * 100;

return (
<div
ref={containerRef}
onClick={(e) => e.stopPropagation()}
onMouseMove={handleMouseMove}
onMouseLeave={() => playing && setShowControls(false)}
className={`relative overflow-hidden bg-black flex items-center justify-center ${
isFullscreen ? 'w-screen h-screen' : 'w-full mt-3 rounded-xl border border-slate-800'
}`}
>
<video
ref={videoRef}
src={src}
muted={muted}
playsInline
onClick={togglePlay}
onTimeUpdate={handleTimeUpdate}
onLoadedMetadata={handleLoadedMetadata}
onEnded={() => setPlaying(false)}
onContextMenu={(e) => e.preventDefault()}
className={`cursor-pointer object-contain ${
isFullscreen ? 'w-full h-full' : 'w-full max-h-96'
}`}
/>

{!playing && (
<button
onClick={togglePlay}
className="absolute inset-0 flex items-center justify-center bg-black/25 group/play"
>
<div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover/play:scale-110 group-hover/play:bg-white/15">
<PlayIcon className="w-7 h-7 text-white ml-1" />
</div>
</button>
)}

<div
className={`absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
}`}
>
<div
onClick={handleSeek}
className="w-full h-1 bg-white/25 rounded-full cursor-pointer mb-2.5"
>
<div
className="h-full bg-emerald-400 rounded-full"
style={{ width: `${progressPercent}%` }}
/>
</div>

<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors shrink-0">
{playing ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
</button>

<div className="flex items-center gap-1.5 group/volume">
<button onClick={toggleMute} className="text-white hover:text-emerald-400 transition-colors shrink-0">
{muted || volume === 0 ? <MuteIcon className="w-5 h-5" /> : <VolumeIcon className="w-5 h-5" />}
</button>
<input
type="range"
min="0"
max="100"
value={volumePercent}
onChange={handleVolumeChange}
onClick={(e) => e.stopPropagation()}
className="w-0 group-hover/volume:w-16 opacity-0 group-hover/volume:opacity-100 transition-all duration-200 accent-emerald-400 h-1 cursor-pointer"
/>
</div>

<span className="text-white text-xs tabular-nums">
{formatTime(currentTime)} / {formatTime(duration)}
</span>
</div>

<button onClick={toggleFullscreen} className="text-white hover:text-emerald-400 transition-colors shrink-0">
{isFullscreen ? <FullscreenExitIcon className="w-5 h-5" /> : <FullscreenIcon className="w-5 h-5" />}
</button>
</div>
</div>
</div>
);
}

function PlayIcon(props) {
return (
<svg {...props} fill="currentColor" viewBox="0 0 24 24">
<path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
</svg>
);
}
function PauseIcon(props) {
return (
<svg {...props} fill="currentColor" viewBox="0 0 24 24">
<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
</svg>
);
}
function VolumeIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.71-1.59-1.59v-4.32c0-.88.71-1.59 1.59-1.59h2.24z" />
</svg>
);
}
function MuteIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.71-1.59-1.59v-4.32c0-.88.71-1.59 1.59-1.59h2.24z" />
</svg>
);
}
function FullscreenIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
</svg>
);
}
function FullscreenExitIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9V4.5M15 9h4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
</svg>
);
}

export default VideoPlayer;
