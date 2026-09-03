import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import CreateEventModal from '../components/groups/CreateEventModal';
import EventLocationModal from '../components/groups/EventLocationModal';
import { groupApi } from '../api/groupApi';
import { eventApi } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { SkeletonBox, SkeletonUserRow } from '../components/ui/Skeleton';

function formatEventDate(dateString) {
const d = new Date(dateString);
const datePart = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
const timePart = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
return `${datePart}, ${timePart}`;
}

function GroupDetailPage() {
const { id } = useParams();
const navigate = useNavigate();
const { user } = useAuth();
const { confirm, ConfirmDialogElement } = useConfirm();

const [group, setGroup] = useState(null);
const [members, setMembers] = useState([]);
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [actionLoading, setActionLoading] = useState(false);
const [kickingUserId, setKickingUserId] = useState(null);
const [respondingEventId, setRespondingEventId] = useState(null);
const [deletingEventId, setDeletingEventId] = useState(null);
const [createEventOpen, setCreateEventOpen] = useState(false);
const [locationModalEvent, setLocationModalEvent] = useState(null);

const isMember = members.some((m) => m.userId === user?.userId);
const isOwner = group?.createdByUserId === user?.userId;
const currentMembership = members.find((m) => m.userId === user?.userId);
const isAdmin = currentMembership?.role === 'Admin';

const loadGroup = async () => {
setLoading(true);
try {
const [groupRes, membersRes] = await Promise.all([
groupApi.getById(id),
groupApi.getMembers(id),
]);
setGroup(groupRes.data);
setMembers(membersRes.data);
} catch (err) {
console.error('Grup/üye yüklenemedi:', err);
toast.error(err.response?.data?.message || 'Grup bulunamadı.');
setLoading(false);
return;
}

try {
const eventsRes = await eventApi.getByGroup(id);
setEvents(eventsRes.data);
} catch (err) {
console.error('Etkinlikler yüklenemedi:', err);
// Grup zaten yüklendi, sadece etkinlikler başarısız oldu - sessizce geç, sayfa yine de açılsın
} finally {
setLoading(false);
}
};

const loadEvents = async () => {
try {
const res = await eventApi.getByGroup(id);
setEvents(res.data);
} catch {
toast.error('Etkinlikler yüklenemedi.');
}
};

useEffect(() => {
loadGroup();
}, [id]);

const handleJoin = async () => {
setActionLoading(true);
try {
await groupApi.join(id);
toast.success('Gruba katıldın!');
loadGroup();
} catch (err) {
toast.error(err.response?.data?.message || 'Katılamadın.');
} finally {
setActionLoading(false);
}
};

const handleLeave = async () => {
setActionLoading(true);
try {
await groupApi.leave(id);
toast.success('Gruptan ayrıldın.');
loadGroup();
} catch (err) {
toast.error(err.response?.data?.message || 'Ayrılamadın.');
} finally {
setActionLoading(false);
}
};

const handleDelete = async () => {
const ok = await confirm({ title: 'Grubu Sil', message: 'Bu grubu silmek istediğine emin misin? Tüm üyeler ve içerikler kaybolacak.' });
if (!ok) return;

try {
await groupApi.delete(id);
toast.success('Grup silindi.');
navigate('/groups');
} catch {
toast.error('Silinemedi.');
}
};

const handleKick = async (targetUserId, targetUsername) => {
const ok = await confirm({ title: 'Üyeyi Çıkar', message: `${targetUsername} adlı üyeyi gruptan çıkarmak istediğine emin misin?` });
if (!ok) return;

setKickingUserId(targetUserId);
try {
await groupApi.kickMember(id, targetUserId);
toast.success('Üye gruptan çıkarıldı.');
setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
} catch (err) {
toast.error(err.response?.data?.message || 'Üye çıkarılamadı.');
} finally {
setKickingUserId(null);
}
};

const handleRespond = async (eventId, status) => {
setRespondingEventId(eventId);
try {
await eventApi.respond(id, eventId, status);
await loadEvents();
} catch (err) {
toast.error(err.response?.data?.message || 'Katılım durumu güncellenemedi.');
} finally {
setRespondingEventId(null);
}
};

const handleDeleteEvent = async (eventId, eventTitle) => {
const ok = await confirm({ title: 'Etkinliği Sil', message: `"${eventTitle}" etkinliğini silmek istediğine emin misin?` });
if (!ok) return;

setDeletingEventId(eventId);
try {
await eventApi.delete(id, eventId);
toast.success('Etkinlik silindi.');
setEvents((prev) => prev.filter((e) => e.id !== eventId));
} catch (err) {
toast.error(err.response?.data?.message || 'Etkinlik silinemedi.');
} finally {
setDeletingEventId(null);
}
};

if (loading) {
return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3 z-10 flex items-center gap-3">
<div className="w-5 h-5" />
<SkeletonBox className="h-4 w-24" />
</div>
<div className="p-6 space-y-5">
<div className="flex items-start gap-4">
<SkeletonBox className="w-16 h-16 rounded-2xl" />
<div className="flex-1 space-y-2">
<SkeletonBox className="h-5 w-40" />
<SkeletonBox className="h-3.5 w-56" />
<SkeletonBox className="h-3 w-32" />
</div>
</div>
<SkeletonBox className="h-9 w-32 rounded-full" />
<div className="space-y-2 pt-4">
<SkeletonUserRow />
<SkeletonUserRow />
<SkeletonUserRow />
</div>
</div>
</PageLayout>
);
}

if (!group) {
return (
<PageLayout>
<div className="flex items-center justify-center h-64">
<p className="text-slate-500">Grup bulunamadı.</p>
</div>
</PageLayout>
);
}

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-4 py-3 z-10 flex items-center gap-3">
<button onClick={() => navigate('/groups')} className="text-slate-400 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
</svg>
</button>
<h1 className="text-lg font-bold text-white truncate">{group.name}</h1>
</div>

<div className="relative h-28 bg-gradient-to-br from-blue-600/25 via-slate-900 to-slate-950 overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
</div>

<div className="p-6">
<div className="flex items-start gap-4 -mt-14 relative z-10">
<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/20 border-4 border-slate-950 flex items-center justify-center text-blue-300 font-bold text-2xl shrink-0 shadow-xl">
{group.name?.[0]?.toUpperCase()}
</div>
</div>

<div className="mt-4">
<h2 className="text-xl font-bold text-white">{group.name}</h2>
<p className="text-slate-400 text-sm mt-1">{group.description || 'Açıklama yok'}</p>
<p className="text-slate-500 text-xs mt-2 flex items-center gap-1.5">
<span>👥 {group.memberCount} üye</span>
<span>·</span>
<span>{group.createdByUsername} tarafından kuruldu</span>
</p>
</div>

<div className="flex gap-2 mt-5">
{isOwner ? (
<button
onClick={handleDelete}
className="border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium rounded-full px-4 py-2 transition"
>
Grubu Sil
</button>
) : isMember ? (
<button
onClick={handleLeave}
disabled={actionLoading}
className="border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 text-sm font-medium rounded-full px-4 py-2 transition disabled:opacity-50"
>
Gruptan Ayrıl
</button>
) : (
<button
onClick={handleJoin}
disabled={actionLoading}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded-full px-5 py-2 transition disabled:opacity-50 shadow-[0_0_16px_rgba(16,185,129,0.3)]"
>
Gruba Katıl
</button>
)}
</div>

{/* ETKİNLİKLER */}
<div className="mt-8">
<div className="flex items-center justify-between mb-3">
<h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
<span className="text-blue-400">📅</span> Etkinlikler ({events.length})
</h3>
{isAdmin && isMember && (
<button
onClick={() => setCreateEventOpen(true)}
className="text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-full px-3.5 py-1.5 transition"
>
+ Yeni Etkinlik
</button>
)}
</div>

{events.length === 0 ? (
<p className="text-slate-500 text-sm bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-4 text-center">
Henüz bir etkinlik oluşturulmadı.
</p>
) : (
<div className="space-y-2">
{events.map((ev) => {
const canDelete = isAdmin || ev.createdByUserId === user?.userId;
return (
<div
key={ev.id}
className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3.5"
>
<div className="flex items-start justify-between gap-3">
<div className="min-w-0 flex-1">
<p className="text-sm font-semibold text-white truncate">{ev.title}</p>
<p className="text-xs text-slate-500 mt-0.5">{formatEventDate(ev.eventDate)}</p>
{ev.location && (
ev.latitude && ev.longitude ? (
<button
onClick={() => setLocationModalEvent(ev)}
className="text-xs text-emerald-400 hover:text-emerald-300 mt-0.5 flex items-center gap-1 transition"
>
📍 {ev.location} <span className="text-slate-500">— haritada gör</span>
</button>
) : (
<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
📍 {ev.location}
</p>
)
)}
{ev.description && (
<p className="text-xs text-slate-400 mt-1.5">{ev.description}</p>
)}
</div>
{canDelete && (
<button
onClick={() => handleDeleteEvent(ev.id, ev.title)}
disabled={deletingEventId === ev.id}
className="text-slate-600 hover:text-red-400 transition p-1 shrink-0 disabled:opacity-50"
title="Etkinliği sil"
>
<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
)}
</div>

<div className="flex items-center gap-2 mt-3">
<button
onClick={() => handleRespond(ev.id, 'Going')}
disabled={respondingEventId === ev.id}
className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition disabled:opacity-50 ${
ev.myStatus === 'Going'
? 'bg-emerald-500 text-slate-950'
: 'border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
}`}
>
✓ Katılıyorum ({ev.goingCount})
</button>
<button
onClick={() => handleRespond(ev.id, 'NotGoing')}
disabled={respondingEventId === ev.id}
className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition disabled:opacity-50 ${
ev.myStatus === 'NotGoing'
? 'bg-slate-700 text-white'
: 'border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400'
}`}
>
✕ Katılmıyorum ({ev.notGoingCount})
</button>
</div>
</div>
);
})}
</div>
)}
</div>

<div className="mt-8">
<h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5">
<span className="text-blue-400">👥</span> Üyeler ({members.length})
</h3>
<div className="space-y-1">
{members.map((m) => {
const canKick = isAdmin && m.userId !== user?.userId && m.userId !== group.createdByUserId;
return (
<div
key={m.userId}
className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-900/50 transition-colors"
>
<div
onClick={() => navigate(`/profile/${m.userId}`)}
className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-semibold overflow-hidden shrink-0 cursor-pointer"
>
{m.profilePhotoUrl ? (
<img src={m.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
m.username?.[0]?.toUpperCase()
)}
</div>
<div
onClick={() => navigate(`/profile/${m.userId}`)}
className="flex-1 min-w-0 cursor-pointer"
>
<p className="text-sm text-white truncate font-medium">{m.username}</p>
</div>
{m.role === 'Admin' && (
<span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium shrink-0">
Admin
</span>
)}
{canKick && (
<button
onClick={() => handleKick(m.userId, m.username)}
disabled={kickingUserId === m.userId}
className="text-[11px] border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400 rounded-full px-3 py-1 transition disabled:opacity-50 shrink-0"
>
{kickingUserId === m.userId ? '...' : 'Çıkar'}
</button>
)}
</div>
);
})}
</div>
</div>
</div>

<CreateEventModal
isOpen={createEventOpen}
onClose={() => setCreateEventOpen(false)}
onCreated={loadEvents}
groupId={id}
/>

<EventLocationModal
isOpen={!!locationModalEvent}
onClose={() => setLocationModalEvent(null)}
latitude={locationModalEvent?.latitude}
longitude={locationModalEvent?.longitude}
locationName={locationModalEvent?.location}
/>

{ConfirmDialogElement}
</PageLayout>
);
}

export default GroupDetailPage;

