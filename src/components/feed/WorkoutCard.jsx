import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import RepostButton from './RepostButton';
import ImageLightbox from '../ui/ImageLightbox';
import VideoPlayer from './VideoPlayer';
import EditWorkoutModal from './EditWorkoutModal';
import PremiumBadge from '../ui/PremiumBadge';
import { savedWorkoutApi } from '../../api/savedWorkoutApi';
import { workoutApi } from '../../api/workoutApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';

const TYPE_LABELS = {
0: { label: 'Koşu', emoji: '🏃' },
1: { label: 'Ağırlık', emoji: '🏋️' },
2: { label: 'Yüzme', emoji: '🏊' },
3: { label: 'Bisiklet', emoji: '🚴' },
4: { label: 'Yoga', emoji: '🧘' },
5: { label: 'Diğer', emoji: '⚡' },
};

function timeAgo(dateString) {
const diff = (Date.now() - new Date(dateString)) / 1000;
if (diff < 60) return 'az önce';
if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
return `${Math.floor(diff / 86400)}g`;
}

function WorkoutCard({ workout }) {
const [data, setData] = useState(workout);
const [commentsOpen, setCommentsOpen] = useState(false);
const [lightboxOpen, setLightboxOpen] = useState(false);
const [isSaved, setIsSaved] = useState(data.isSavedByCurrentUser || false);
const [saving, setSaving] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [isDeleted, setIsDeleted] = useState(false);

const navigate = useNavigate();
const { user: currentUser } = useAuth();
const { confirm, ConfirmDialogElement } = useConfirm();
const typeInfo = TYPE_LABELS[data.type] || TYPE_LABELS[5];
const isOwner = currentUser?.userId === data.userId;

const handleSaveToggle = async (e) => {
e.stopPropagation();
if (saving) return;
setSaving(true);
const prevState = isSaved;
setIsSaved(!prevState);
try {
if (prevState) {
await savedWorkoutApi.unsave(data.id);
} else {
await savedWorkoutApi.save(data.id);
toast.success('Antrenman kaydedildi.');
}
} catch (err) {
setIsSaved(prevState);
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setSaving(false);
}
};

const handleDelete = async () => {
const ok = await confirm({ title: 'Antrenmanı Sil', message: 'Bu antrenmanı silmek istediğine emin misin? Bu işlem geri alınamaz.' });
if (!ok) return;
setDeleting(true);
try {
await workoutApi.delete(data.id);
toast.success('Antrenman silindi.');
setIsDeleted(true);
} catch (err) {
toast.error(err.response?.data?.message || 'Silinemedi.');
} finally {
setDeleting(false);
}
};

if (isDeleted) return null;

return (
<article
onClick={() => navigate(`/workout/${data.id}`)}
className="border-b border-slate-800 px-4 py-4 cursor-pointer hover:bg-slate-900/30 transition-colors"
>
<div className="flex gap-3">
<div
onClick={(e) => { e.stopPropagation(); navigate(`/profile/${data.userId}`); }}
className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm shrink-0 cursor-pointer overflow-hidden"
>
{data.userProfilePhotoUrl ? (
<img src={data.userProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
data.username?.[0]?.toUpperCase()
)}
</div>

<div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5 text-sm">
<span
onClick={(e) => { e.stopPropagation(); navigate(`/profile/${data.userId}`); }}
className="font-semibold text-white cursor-pointer hover:underline flex items-center gap-1"
>
{data.username}
{data.userIsPremium && <PremiumBadge className="w-3.5 h-3.5" />}
</span>
<span className="text-slate-600">·</span>
<span className="text-slate-500">{timeAgo(data.createdAt)}</span>

<div className="ml-auto flex items-center gap-2">
<span className="bg-slate-900 text-slate-300 text-xs px-2 py-0.5 rounded-full">
{typeInfo.emoji} {typeInfo.label}
</span>

{isOwner && (
<div className="relative">
<button
onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
className="text-slate-500 hover:text-white transition p-1 rounded-full hover:bg-slate-900"
>
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
</svg>
</button>

{menuOpen && (
<>
<div
onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
className="fixed inset-0 z-30"
/>
<div className="absolute right-0 top-8 z-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden w-36">
<button
onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setEditOpen(true); }}
className="w-full text-left px-3.5 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition"
>
Düzenle
</button>
<button
onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleDelete(); }}
disabled={deleting}
className="w-full text-left px-3.5 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition disabled:opacity-50"
>
{deleting ? 'Siliniyor...' : 'Sil'}
</button>
</div>
</>
)}
</div>
)}
</div>
</div>

{data.description && (
<p className="text-slate-200 text-sm mt-1.5 whitespace-pre-wrap">{data.description}</p>
)}

{(data.distance || data.duration || data.weightKg || data.reps || data.sets || data.distanceMeters || data.focusArea || data.customStat) && (
<div className="flex flex-wrap gap-4 mt-2.5 text-sm">
{data.distance != null && (
<div><span className="text-white font-semibold">{data.distance}</span><span className="text-slate-500"> km</span></div>
)}
{data.distanceMeters != null && (
<div><span className="text-white font-semibold">{data.distanceMeters}</span><span className="text-slate-500"> m</span></div>
)}
{data.duration && (
<div><span className="text-white font-semibold">{data.duration.slice(0, 5)}</span><span className="text-slate-500"> süre</span></div>
)}
{data.weightKg != null && (
<div><span className="text-white font-semibold">{data.weightKg}</span><span className="text-slate-500"> kg</span></div>
)}
{data.reps != null && (
<div><span className="text-white font-semibold">{data.reps}</span><span className="text-slate-500"> tekrar</span></div>
)}
{data.sets != null && (
<div><span className="text-white font-semibold">{data.sets}</span><span className="text-slate-500"> set</span></div>
)}
{data.focusArea && <div className="text-slate-300">{data.focusArea}</div>}
{data.customStat && <div className="text-slate-300">{data.customStat}</div>}
</div>
)}

{data.photoUrl && (
<img
src={data.photoUrl}
alt=""
onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
className="w-full rounded-xl mt-3 border border-slate-800 max-h-96 object-cover cursor-zoom-in"
/>
)}

{data.videoUrl && <VideoPlayer src={data.videoUrl} />}

<div className="flex items-center gap-6 mt-3">
<LikeButton
workoutId={data.id}
initialLiked={data.isLikedByCurrentUser}
initialCount={data.likeCount}
/>

<button
onClick={(e) => { e.stopPropagation(); setCommentsOpen((v) => !v); }}
className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
>
<svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
</svg>
<span className="text-sm">{data.commentCount}</span>
</button>

<RepostButton workoutId={data.id} />

<button
onClick={handleSaveToggle}
disabled={saving}
className={`ml-auto flex items-center transition-colors ${
isSaved ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
}`}
>
<svg className="w-[20px] h-[20px]" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
</svg>
</button>
</div>
</div>
</div>

<CommentSection workoutId={data.id} isOpen={commentsOpen} onCommentAdded={() => setData((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }))} />

{data.photoUrl && (
<ImageLightbox
imageUrl={data.photoUrl}
isOpen={lightboxOpen}
onClose={() => setLightboxOpen(false)}
/>
)}

{editOpen && (
<EditWorkoutModal
workout={data}
isOpen={editOpen}
onClose={() => setEditOpen(false)}
onUpdated={(updated) => { setData(updated); setEditOpen(false); }}
/>
)}

{ConfirmDialogElement}
</article>
);
}

export default WorkoutCard;
