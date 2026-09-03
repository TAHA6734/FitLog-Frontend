import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { storyApi } from '../../api/storyApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import StoryViewersModal from './StoryViewersModal';
import { TextOverlayLayer } from './TextOverlayEditor';

function timeAgo(dateString) {
const diff = (Date.now() - new Date(dateString)) / 1000;
if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
return `${Math.floor(diff / 3600)}sa`;
}

function StoryViewer({ groups, startGroupIndex, onClose, onViewOwnStory }) {
const [groupIndex, setGroupIndex] = useState(startGroupIndex);
const [storyIndex, setStoryIndex] = useState(0);
const [progress, setProgress] = useState(0);
const [paused, setPaused] = useState(false);
const [viewersOpen, setViewersOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

const { user } = useAuth();
const { confirm, ConfirmDialogElement } = useConfirm();
const navigate = useNavigate();
const intervalRef = useRef(null);
const videoRef = useRef(null);
const previewRef = useRef(null);
const pausedAtRef = useRef(0);

const audioCtxRef = useRef(null);
const audioSourceRef = useRef(null);

const group = groups[groupIndex];
const story = group?.stories[storyIndex];
const isOwn = group?.isOwn;
const durationMs = (story?.durationSeconds || 5) * 1000;

const goNextStory = useCallback(() => {
if (!group) return;
if (storyIndex < group.stories.length - 1) {
setStoryIndex((i) => i + 1);
} else if (groupIndex < groups.length - 1) {
setGroupIndex((i) => i + 1);
setStoryIndex(0);
} else {
onClose();
}
}, [group, storyIndex, groupIndex, groups.length, onClose]);

const goPrevStory = useCallback(() => {
if (storyIndex > 0) {
setStoryIndex((i) => i - 1);
} else if (groupIndex > 0) {
const prevGroup = groups[groupIndex - 1];
setGroupIndex((i) => i - 1);
setStoryIndex(prevGroup.stories.length - 1);
}
}, [storyIndex, groupIndex, groups]);

const handleDeleteStory = async () => {
if (!story) return;
const ok = await confirm({ title: 'Hikayeyi Sil', message: 'Bu hikayeyi silmek istediğine emin misin?' });
if (!ok) return;
setDeleting(true);
try {
await storyApi.delete(story.id);
toast.success('Hikaye silindi.');
goNextStory();
} catch {
toast.error('Hikaye silinemedi.');
} finally {
setDeleting(false);
}
};

useEffect(() => {
if (!story) return;
setProgress(0);
pausedAtRef.current = 0;

if (story.userId !== user?.userId) {
storyApi.markViewed(story.id).catch(() => {});
} else {
onViewOwnStory?.(story.id);
}
}, [story, user, onViewOwnStory]);

useEffect(() => {
try { audioSourceRef.current?.stop(); } catch { /* zaten durmuşsa hata verir, sorun değil */ }
audioSourceRef.current = null;
if (audioCtxRef.current) {
audioCtxRef.current.close().catch(() => {});
audioCtxRef.current = null;
}

if (!story?.musicUrl) return;

let cancelled = false;

(async () => {
try {
const ctx = new (window.AudioContext || window.webkitAudioContext)();
audioCtxRef.current = ctx;

if (ctx.state === 'suspended') {
await ctx.resume();
}

const res = await fetch(story.musicUrl);
if (!res.ok) {
throw new Error(`Müzik dosyası indirilemedi (HTTP ${res.status})`);
}
const arrayBuffer = await res.arrayBuffer();
if (cancelled) return;

const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
if (cancelled) return;

const source = ctx.createBufferSource();
source.buffer = audioBuffer;
source.connect(ctx.destination);

const rawStart = Number.isFinite(story.musicStartSeconds) ? story.musicStartSeconds : 0;
const safeStart = Math.max(0, Math.min(rawStart, Math.max(0, audioBuffer.duration - 1)));
source.start(0, safeStart);
audioSourceRef.current = source;

if (paused) {
await ctx.suspend();
} else {
await ctx.resume();
}
} catch (err) {
console.error('Hikaye müziği çalınamadı:', err);
}
})();

return () => {
cancelled = true;
};
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [story?.id, story?.musicUrl, story?.musicStartSeconds]);

useEffect(() => {
const ctx = audioCtxRef.current;
if (!ctx) return;
if (paused) {
ctx.suspend().catch(() => {});
} else {
ctx.resume().catch(() => {});
}
}, [paused]);

useEffect(() => {
return () => {
try { audioSourceRef.current?.stop(); } catch { /* sorun değil */ }
audioCtxRef.current?.close().catch(() => {});
};
}, []);

useEffect(() => {
if (!story || paused || story.mediaType === 'video') return;

const startedAt = Date.now() - pausedAtRef.current;

intervalRef.current = setInterval(() => {
const elapsed = Date.now() - startedAt;
const pct = Math.min(100, (elapsed / durationMs) * 100);
setProgress(pct);
if (pct >= 100) {
clearInterval(intervalRef.current);
goNextStory();
}
}, 50);

return () => clearInterval(intervalRef.current);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [story, paused, groupIndex, storyIndex, durationMs]);

useEffect(() => {
if (story?.mediaType !== 'video') return;
const video = videoRef.current;
if (!video) return;
if (paused) video.pause();
else video.play().catch(() => {});
}, [paused, story]);

const handleVideoTimeUpdate = () => {
const video = videoRef.current;
if (!video || !video.duration) return;
setProgress((video.currentTime / video.duration) * 100);
};

const handlePress = () => {
setPaused(true);
pausedAtRef.current = (progress / 100) * durationMs;
clearInterval(intervalRef.current);
};

const handleRelease = () => setPaused(false);

useEffect(() => {
const handleKey = (e) => {
if (e.key === 'Escape') onClose();
if (e.key === 'ArrowRight') goNextStory();
if (e.key === 'ArrowLeft') goPrevStory();
if (e.key === ' ' || e.code === 'Space') {
e.preventDefault();
setPaused((prev) => {
const next = !prev;
if (next) {
pausedAtRef.current = (progress / 100) * durationMs;
}
return next;
});
}
};
document.addEventListener('keydown', handleKey);
return () => document.removeEventListener('keydown', handleKey);
}, [onClose, goNextStory, goPrevStory, progress, durationMs]);

if (!group || !story) return null;

return (
<div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
<div ref={previewRef} className="relative w-full h-full sm:w-[420px] sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-slate-950">
<div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
{group.stories.map((s, i) => (
<div key={s.id} className="flex-1 h-0.5 bg-white/25 rounded-full overflow-hidden">
<div
className="h-full bg-white rounded-full"
style={{ width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%' }}
/>
</div>
))}
</div>

<div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between">
<div
onClick={() => navigate(`/profile/${group.userId}`)}
className="flex items-center gap-2 cursor-pointer"
>
<div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-white text-xs font-semibold overflow-hidden border border-white/30">
{group.profilePhotoUrl ? (
<img src={group.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
group.username?.[0]?.toUpperCase()
)}
</div>
<span className="text-white text-sm font-medium drop-shadow">{group.username}</span>
<span className="text-white/60 text-xs">{timeAgo(story.createdAt)}</span>
{story.musicUrl && <span className="text-white/60 text-xs">🎵</span>}
</div>
<button onClick={onClose} className="text-white/80 hover:text-white p-1">
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div
className="absolute inset-0 flex z-10"
onMouseDown={handlePress}
onMouseUp={handleRelease}
onTouchStart={handlePress}
onTouchEnd={handleRelease}
>
<div className="w-1/3 h-full" onClick={goPrevStory} />
<div className="w-2/3 h-full" onClick={goNextStory} />
</div>

<div className="w-full h-full flex items-center justify-center">
{story.mediaType === 'video' ? (
<video
ref={videoRef}
src={story.mediaUrl}
autoPlay
playsInline
muted={!!story.musicUrl}
onTimeUpdate={handleVideoTimeUpdate}
onEnded={goNextStory}
className="max-w-full max-h-full"
/>
) : (
<img src={story.mediaUrl} alt="" className="max-w-full max-h-full object-contain" />
)}
</div>

{story.textContent && (
<TextOverlayLayer
text={{
content: story.textContent,
fontFamily: story.textFontFamily,
fontSize: story.textFontSize,
color: story.textColor,
xPercent: story.textPositionXPercent,
yPercent: story.textPositionYPercent,
}}
previewRef={previewRef}
onDragEnd={() => {}}
editable={false}
/>
)}

{isOwn && (
<div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
<button
onClick={() => setViewersOpen(true)}
className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white text-xs font-medium px-3.5 py-2 rounded-full transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
{story.viewCount} görüntülenme
</button>
<button
onClick={handleDeleteStory}
disabled={deleting}
className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2 rounded-full transition disabled:opacity-50"
title="Hikayeyi sil"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
</svg>
</button>
</div>
)}
</div>

{viewersOpen && (
<StoryViewersModal
storyId={story.id}
isOpen={viewersOpen}
onClose={() => setViewersOpen(false)}
/>
)}
{ConfirmDialogElement}
</div>
);
}

export default StoryViewer;
