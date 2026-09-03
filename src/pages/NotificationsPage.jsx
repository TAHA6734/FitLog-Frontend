import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import { useNotifications } from '../context/NotificationContext';
import { followApi } from '../api/userApi';
import { notificationApi } from '../api/notificationApi';

function timeAgo(dateString) {
const diff = (Date.now() - new Date(dateString)) / 1000;
if (diff < 60) return 'az önce';
if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
return `${Math.floor(diff / 86400)}g önce`;
}

const TYPE_BADGES = {
like: { emoji: '❤️', bg: 'bg-rose-500' },
comment: { emoji: '💬', bg: 'bg-blue-500' },
follow: { emoji: '👤', bg: 'bg-emerald-500' },
follow_request: { emoji: '🔔', bg: 'bg-amber-500' },
mention: { emoji: '📢', bg: 'bg-purple-500' },
message: { emoji: '✉️', bg: 'bg-sky-500' },
achievement: { emoji: '🏆', bg: 'bg-gradient-to-br from-amber-400 to-red-500' },
};

function NotificationAvatar({ notification }) {
const badge = TYPE_BADGES[notification.type] || { emoji: '🔔', bg: 'bg-slate-600' };
const hasPhoto = notification.relatedUserProfilePhotoUrl;

return (
<div className="relative shrink-0">
{notification.relatedUserId ? (
<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden border border-slate-800">
{hasPhoto ? (
<img src={notification.relatedUserProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
notification.relatedUsername?.[0]?.toUpperCase() || '?'
)}
</div>
) : (
<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-lg sm:text-xl">
🏆
</div>
)}
<div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${badge.bg} flex items-center justify-center text-[8px] sm:text-[10px] border-2 border-slate-950 shadow-md`}>
{badge.emoji}
</div>
</div>
);
}

function NotificationsPage() {
const { notifications, markAllAsRead, refreshNotifications } = useNotifications() || {};
const [handledIds, setHandledIds] = useState(new Set());
const [selectMode, setSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState(new Set());
const [deleting, setDeleting] = useState(false);
const navigate = useNavigate();
const prevLengthRef = useRef(0);

useEffect(() => {
const currentLength = notifications?.length || 0;
if (currentLength !== prevLengthRef.current) {
markAllAsRead?.();
prevLengthRef.current = currentLength;
}
}, [notifications, markAllAsRead]);

const isClickable = (n) => Boolean(n.workoutId) || (n.type === 'message' && n.relatedUserId);

const toggleSelect = (id) => {
setSelectedIds((prev) => {
const next = new Set(prev);
if (next.has(id)) next.delete(id);
else next.add(id);
return next;
});
};

const handleContentClick = (n) => {
if (selectMode) {
toggleSelect(n.id);
return;
}
if (n.type === 'message' && n.relatedUserId) {
navigate('/chat', { state: { openUserId: n.relatedUserId } });
return;
}
if (n.workoutId) {
navigate(`/workout/${n.workoutId}`);
}
};

const handleUserClick = (e, n) => {
e.stopPropagation();
if (n.relatedUserId) {
navigate(`/profile/${n.relatedUserId}`);
}
};

const handleAccept = async (e, n) => {
e.stopPropagation();
try {
await followApi.acceptRequest(n.relatedUserId);
setHandledIds((prev) => new Set(prev).add(n.id));
toast.success('Takip isteği kabul edildi.');
} catch {
toast.error('Bir hata oluştu.');
}
};

const handleReject = async (e, n) => {
e.stopPropagation();
try {
await followApi.rejectRequest(n.relatedUserId);
setHandledIds((prev) => new Set(prev).add(n.id));
toast.success('Takip isteği reddedildi.');
} catch {
toast.error('Bir hata oluştu.');
}
};

const handleToggleSelectMode = () => {
setSelectMode((v) => !v);
setSelectedIds(new Set());
};

const handleSelectAll = () => {
setSelectedIds(new Set((notifications || []).map((n) => n.id)));
};

const handleDeleteOne = async (e, id) => {
e.stopPropagation();
try {
await notificationApi.delete(id);
await refreshNotifications?.();
} catch {
toast.error('Silinemedi.');
}
};

const handleDeleteSelected = async () => {
if (selectedIds.size === 0) return;
setDeleting(true);
try {
await notificationApi.deleteBatch(Array.from(selectedIds));
toast.success('Seçili bildirimler silindi.');
setSelectedIds(new Set());
setSelectMode(false);
await refreshNotifications?.();
} catch {
toast.error('Silinemedi.');
} finally {
setDeleting(false);
}
};

const handleDeleteAll = async () => {
if (!notifications || notifications.length === 0) return;
if (!window.confirm('Tüm bildirimleri silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
setDeleting(true);
try {
await notificationApi.deleteAll();
toast.success('Tüm bildirimler silindi.');
setSelectedIds(new Set());
setSelectMode(false);
await refreshNotifications?.();
} catch {
toast.error('Silinemedi.');
} finally {
setDeleting(false);
}
};

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
<div className="flex items-center justify-between gap-2">
<h1 className="text-lg font-bold text-white flex items-center gap-1.5 shrink-0">
<span className="text-emerald-400">🔔</span>
<span className="hidden xs:inline">Bildirimler</span>
</h1>
<div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
{notifications && notifications.length > 0 && !selectMode && (
<>
<button
onClick={handleToggleSelectMode}
className="text-xs text-slate-400 hover:text-white font-medium transition whitespace-nowrap"
>
Seç
</button>
<button
onClick={handleDeleteAll}
disabled={deleting}
className="text-xs text-red-400 hover:text-red-300 font-medium transition disabled:opacity-50 whitespace-nowrap"
>
Temizle
</button>
</>
)}
{selectMode && (
<>
<button
onClick={handleSelectAll}
className="text-xs text-slate-400 hover:text-white font-medium transition whitespace-nowrap"
>
Tümü
</button>
<button
onClick={handleDeleteSelected}
disabled={deleting || selectedIds.size === 0}
className="text-xs text-red-400 hover:text-red-300 font-medium transition disabled:opacity-30 whitespace-nowrap"
>
Sil ({selectedIds.size})
</button>
<button
onClick={handleToggleSelectMode}
className="text-xs text-slate-400 hover:text-white font-medium transition whitespace-nowrap"
>
İptal
</button>
</>
)}
</div>
</div>
</div>

{!notifications || notifications.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 px-6 text-center">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 flex items-center justify-center mb-4">
<span className="text-3xl">🔔</span>
</div>
<p className="text-slate-300 font-semibold">Henüz bildirim yok</p>
<p className="text-slate-500 text-sm mt-1">Beğeniler, yorumlar ve takipler burada görünecek.</p>
</div>
) : (
<div>
{notifications.map((n, i) => {
const isFollowRequest = n.type === 'follow_request';
const isHandled = handledIds.has(n.id) || n.isHandled;
const isSelected = selectedIds.has(n.id);
const extraCount = n.type === 'message' && n.messageGroupCount > 1 ? n.messageGroupCount - 1 : 0;

return (
<div
key={n.id || i}
onClick={() => handleContentClick(n)}
className={`px-3 sm:px-4 py-3 sm:py-3.5 flex items-start gap-2.5 sm:gap-3 border-b border-slate-800/60 transition-colors ${
isClickable(n) || selectMode ? 'cursor-pointer hover:bg-slate-900/50' : ''
} ${!n.isRead ? 'bg-emerald-500/[0.04]' : ''} ${isSelected ? 'bg-slate-900' : ''}`}
>
{selectMode && (
<div className="shrink-0 pt-3 sm:pt-3.5">
<input
type="checkbox"
checked={isSelected}
onChange={() => toggleSelect(n.id)}
onClick={(e) => e.stopPropagation()}
className="w-4 h-4 accent-emerald-500"
/>
</div>
)}

<NotificationAvatar notification={n} />

<div className="flex-1 min-w-0 pt-0.5">
<div className="flex items-start gap-2">
<p className="text-xs sm:text-sm leading-snug text-slate-200 flex-1">
{n.relatedUsername && (
<span
onClick={(e) => handleUserClick(e, n)}
className="font-semibold text-white hover:underline"
>
{n.relatedUsername}{' '}
</span>
)}
{n.relatedUsername ? n.message.replace(n.relatedUsername, '').trim() : n.message}
</p>
{extraCount > 0 && (
<span className="text-[10px] bg-slate-800 text-slate-400 rounded-full px-2 py-0.5 font-semibold shrink-0">
+{extraCount}
</span>
)}
{!n.isRead && !isFollowRequest && (
<span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1.5" />
)}
</div>

<p className="text-[11px] sm:text-xs text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>

{isFollowRequest && !isHandled && (
<div className="flex gap-2 mt-2.5">
<button
onClick={(e) => handleAccept(e, n)}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-full px-3 sm:px-3.5 py-1.5 transition"
>
Onayla
</button>
<button
onClick={(e) => handleReject(e, n)}
className="border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium rounded-full px-3 sm:px-3.5 py-1.5 transition"
>
Reddet
</button>
</div>
)}
{isFollowRequest && isHandled && (
<p className="text-xs text-slate-500 mt-1.5 italic">İşlem tamamlandı.</p>
)}
</div>

{!selectMode && (
<button
onClick={(e) => handleDeleteOne(e, n.id)}
className="text-slate-600 hover:text-red-400 transition p-1 shrink-0"
title="Sil"
>
<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
)}
</div>
);
})}
</div>
)}
</PageLayout>
);
}

export default NotificationsPage;
