import { useState } from 'react';
import { toast } from 'sonner';
import { useChat } from '../../context/ChatContext';
import { messageApi } from '../../api/messageApi';

function timeAgo(dateString) {
if (!dateString) return '';
const diff = (Date.now() - new Date(dateString)) / 1000;
if (diff < 60) return 'şimdi';
if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
return `${Math.floor(diff / 86400)}g`;
}

function BlockedAvatarIcon({ className = 'w-5 h-5' }) {
return (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
<circle cx="12" cy="12" r="9" />
<path strokeLinecap="round" d="M5.6 5.6l12.8 12.8" />
</svg>
);
}

function PinIcon({ className = 'w-4 h-4', filled = false }) {
return (
<svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5h14l-4.091-4.091a2.25 2.25 0 01-.659-1.591V3.104M12 14.5V21" />
</svg>
);
}

function ConversationList({ conversations = [], activeId, onSelect, onPinChanged }) {
const { isUserOnline } = useChat() || {};
const [search, setSearch] = useState('');
const [pinLoadingId, setPinLoadingId] = useState(null);

const filtered = (conversations || []).filter((c) =>
c.otherUsername.toLowerCase().includes(search.toLowerCase())
);

const pinned = filtered.filter((c) => c.isPinned);
const rest = filtered.filter((c) => !c.isPinned);

const handleTogglePin = async (e, c) => {
e.stopPropagation();
setPinLoadingId(c.id);
try {
if (c.isPinned) {
await messageApi.unpin(c.id);
} else {
await messageApi.pin(c.id);
}
onPinChanged?.();
} catch {
toast.error('Bir hata oluştu.');
} finally {
setPinLoadingId(null);
}
};

const renderRow = (c) => {
const online = !c.isBlocked && isUserOnline?.(c.otherUserId);

return (
<div
key={c.id}
onClick={() => onSelect(c)}
className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-800/40 transition-colors ${
activeId === c.id ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'
} ${c.isPinned ? 'bg-slate-900/30' : ''}`}
>
<div className="relative shrink-0">
{c.isBlocked ? (
<div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
<BlockedAvatarIcon />
</div>
) : (
<div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden">
{c.otherUserProfilePhotoUrl ? (
<img src={c.otherUserProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
c.otherUsername?.[0]?.toUpperCase()
)}
</div>
)}
{online && (
<span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
)}
</div>

<div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5">
<p className="text-sm font-medium text-white truncate">{c.otherUsername}</p>
{c.isPinned && <PinIcon className="w-3 h-3 text-emerald-400 shrink-0" filled />}
<span className="text-xs text-slate-500 shrink-0 ml-auto">{timeAgo(c.lastMessageAt)}</span>
</div>
<div className="flex items-center justify-between mt-0.5">
<p className="text-xs text-slate-500 truncate">
{c.lastMessageContent || 'Henüz mesaj yok'}
</p>
{c.unreadCount > 0 && (
<span className="bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0 ml-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
{c.unreadCount}
</span>
)}
</div>
</div>

<button
onClick={(e) => handleTogglePin(e, c)}
disabled={pinLoadingId === c.id}
title={c.isPinned ? 'Sabitlemeyi kaldır' : 'Sohbeti sabitle'}
className={`shrink-0 p-1.5 rounded-full transition ${
c.isPinned
? 'text-emerald-400 opacity-100'
: 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-white'
} disabled:opacity-50`}
>
<PinIcon className="w-4 h-4" filled={c.isPinned} />
</button>
</div>
);
};

return (
<div className="flex flex-col h-full">
<div className="p-3 border-b border-slate-800/60">
<div className="relative group">
<svg className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
<input
type="text"
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Konuşmalarda ara..."
className="w-full bg-slate-900/60 border border-slate-800 rounded-full pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
/>
</div>
</div>

{filtered.length === 0 ? (
<div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
<span className="text-3xl mb-2">💬</span>
<p className="text-slate-400 text-sm">
{search ? 'Sonuç bulunamadı.' : 'Henüz bir konuşman yok.'}
</p>
</div>
) : (
<div className="overflow-y-auto flex-1">
{pinned.length > 0 && (
<>
<p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
<PinIcon className="w-3 h-3" filled /> Sabitlenmiş
</p>
{pinned.map(renderRow)}
</>
)}
{rest.map(renderRow)}
</div>
)}
</div>
);
}

export default ConversationList;



