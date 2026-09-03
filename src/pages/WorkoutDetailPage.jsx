import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import LikeButton from '../components/feed/LikeButton';
import RepostButton from '../components/feed/RepostButton';
import CommentSection from '../components/feed/CommentSection';
import ImageLightbox from '../components/ui/ImageLightbox';
import EditWorkoutModal from '../components/feed/EditWorkoutModal';
import WorkoutRouteMap from '../components/workout/WorkoutRouteMap';
import PremiumBadge from '../components/ui/PremiumBadge';
import { useConfirm } from '../hooks/useConfirm';
import { SkeletonBox, SkeletonAvatar, SkeletonCommentRow } from '../components/ui/Skeleton';
import { workoutApi } from '../api/workoutApi';
import { useAuth } from '../context/AuthContext';

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
if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
return `${Math.floor(diff / 86400)}g önce`;
}

function WorkoutDetailPage() {
const { id } = useParams();
const navigate = useNavigate();
const { user: currentUser } = useAuth();
const { confirm, ConfirmDialogElement } = useConfirm();

const [workout, setWorkout] = useState(null);
const [loading, setLoading] = useState(true);
const [deleting, setDeleting] = useState(false);
const [lightboxOpen, setLightboxOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);

const loadWorkout = async () => {
setLoading(true);
try {
const res = await workoutApi.getById(id);
setWorkout(res.data);
} catch {
toast.error('Antrenman bulunamadı.');
} finally {
setLoading(false);
}
};

useEffect(() => {
loadWorkout();
}, [id]);

const handleDelete = async () => {
const ok = await confirm({ title: 'Antrenmanı Sil', message: 'Bu antrenmanı silmek istediğine emin misin? Bu işlem geri alınamaz.' });
if (!ok) return;

setDeleting(true);
try {
await workoutApi.delete(id);
toast.success('Antrenman silindi.');
navigate(-1);
} catch {
toast.error('Silinemedi.');
setDeleting(false);
}
};

if (loading) {
return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3 z-10 flex items-center gap-3">
<div className="w-5 h-5" />
<SkeletonBox className="h-4 w-24" />
</div>
<div className="px-4 py-4 space-y-4">
<div className="flex items-center gap-3">
<SkeletonAvatar className="w-11 h-11" />
<div className="space-y-2">
<SkeletonBox className="h-3.5 w-28" />
<SkeletonBox className="h-3 w-16" />
</div>
</div>
<SkeletonBox className="h-3.5 w-full" />
<SkeletonBox className="h-3.5 w-2/3" />
<SkeletonBox className="h-24 w-full rounded-2xl" />
<SkeletonBox className="h-72 w-full rounded-2xl" />
<div className="space-y-3 pt-4">
<SkeletonCommentRow />
<SkeletonCommentRow />
</div>
</div>
</PageLayout>
);
}

if (!workout) {
return (
<PageLayout>
<div className="flex items-center justify-center h-64">
<p className="text-slate-500">Antrenman bulunamadı.</p>
</div>
</PageLayout>
);
}

const typeInfo = TYPE_LABELS[workout.type] || TYPE_LABELS[5];
const isOwner = currentUser?.userId === workout.userId;

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3 z-10 flex items-center gap-3">
<button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
</svg>
</button>
<h1 className="text-lg font-bold text-white">Antrenman</h1>
</div>

<div className="px-4 py-4">
<div className="flex items-start justify-between">
<div
onClick={() => navigate(`/profile/${workout.userId}`)}
className="flex items-center gap-3 cursor-pointer"
>
<div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden">
{workout.userProfilePhotoUrl ? (
<img src={workout.userProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
workout.username?.[0]?.toUpperCase()
)}
</div>
<div>
<p className="text-white font-semibold hover:underline flex items-center gap-1.5">
{workout.username}
{workout.userIsPremium && <PremiumBadge className="w-3.5 h-3.5" />}
</p>
<p className="text-slate-500 text-xs">{timeAgo(workout.createdAt)}</p>
</div>
</div>

<div className="flex items-center gap-2">
<span className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full">
{typeInfo.emoji} {typeInfo.label}
</span>
{isOwner && (
<>
<button
onClick={() => setEditOpen(true)}
className="text-slate-500 hover:text-emerald-400 transition p-1.5 hover:bg-slate-900 rounded-full"
title="Düzenle"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
</svg>
</button>
<button
onClick={handleDelete}
disabled={deleting}
className="text-slate-500 hover:text-red-400 transition p-1.5 hover:bg-slate-900 rounded-full"
title="Sil"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
</svg>
</button>
</>
)}
</div>
</div>

{workout.description && (
<p className="text-slate-200 mt-4 whitespace-pre-wrap leading-relaxed">{workout.description}</p>
)}

{(workout.distance || workout.duration || workout.weightKg || workout.reps || workout.sets || workout.distanceMeters || workout.focusArea || workout.customStat) && (
<div className="flex flex-wrap gap-6 mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
{workout.distance != null && (
<div>
<p className="text-2xl font-bold text-white">{workout.distance}</p>
<p className="text-xs text-slate-500">km</p>
</div>
)}
{workout.distanceMeters != null && (
<div>
<p className="text-2xl font-bold text-white">{workout.distanceMeters}</p>
<p className="text-xs text-slate-500">m</p>
</div>
)}
{workout.duration && (
<div>
<p className="text-2xl font-bold text-white">{workout.duration.slice(0, 5)}</p>
<p className="text-xs text-slate-500">süre</p>
</div>
)}
{workout.weightKg != null && (
<div>
<p className="text-2xl font-bold text-white">{workout.weightKg}</p>
<p className="text-xs text-slate-500">kg</p>
</div>
)}
{workout.reps != null && (
<div>
<p className="text-2xl font-bold text-white">{workout.reps}</p>
<p className="text-xs text-slate-500">tekrar</p>
</div>
)}
{workout.sets != null && (
<div>
<p className="text-2xl font-bold text-white">{workout.sets}</p>
<p className="text-xs text-slate-500">set</p>
</div>
)}
{workout.focusArea && (
<div>
<p className="text-2xl font-bold text-white">{workout.focusArea}</p>
<p className="text-xs text-slate-500">odak alanı</p>
</div>
)}
{workout.customStat && (
<div>
<p className="text-lg font-bold text-white">{workout.customStat}</p>
</div>
)}
</div>
)}

{workout.photoUrl && (
<img
src={workout.photoUrl}
alt=""
onClick={() => setLightboxOpen(true)}
className="w-full rounded-2xl mt-4 border border-slate-800 max-h-[500px] object-cover cursor-zoom-in"
/>
)}

{workout.videoUrl && (
<video
src={workout.videoUrl}
controls
className="w-full rounded-2xl mt-4 border border-slate-800 max-h-[500px] bg-black"
/>
)}

{workout.route && workout.route.length > 0 && (
<WorkoutRouteMap route={workout.route} />
)}

<div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/80">
<LikeButton
workoutId={workout.id}
initialLiked={workout.isLikedByCurrentUser}
initialCount={workout.likeCount}
/>
<div className="flex items-center gap-1.5 text-slate-400">
<svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
</svg>
<span className="text-sm">{workout.commentCount}</span>
</div>
<RepostButton workoutId={workout.id} />
</div>

<CommentSection
workoutId={workout.id}
isOpen={true}
onCommentAdded={() => setWorkout((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }))}
/>
</div>

{workout.photoUrl && (
<ImageLightbox
imageUrl={workout.photoUrl}
isOpen={lightboxOpen}
onClose={() => setLightboxOpen(false)}
/>
)}

{editOpen && (
<EditWorkoutModal
workout={workout}
isOpen={editOpen}
onClose={() => setEditOpen(false)}
onUpdated={(updated) => { setWorkout(updated); setEditOpen(false); }}
/>
)}

{ConfirmDialogElement}
</PageLayout>
);
}

export default WorkoutDetailPage;
