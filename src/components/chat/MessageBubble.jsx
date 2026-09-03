import { useState, useRef, useEffect } from 'react';
import { messageApi } from '../../api/messageApi';
import { useAuth } from '../../context/AuthContext';
import VoiceMessagePlayer from './VoiceMessagePlayer';

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

function MessageBubble({ message, isMine, theme, onReply, onReactionChange, onDeleted }) {
const [pickerOpen, setPickerOpen] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const pressTimer = useRef(null);
const menuRef = useRef(null);
const { user } = useAuth();

const time = new Date(message.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
const isDeleted = message.content === 'Bu mesaj silindi';

useEffect(() => {
function handleClickOutside(e) {
if (menuRef.current && !menuRef.current.contains(e.target)) {
setMenuOpen(false);
}
}
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const bubbleColor = isDeleted
? 'bg-slate-900/80 text-slate-500 italic rounded-bl-md rounded-br-md border border-slate-800'
: isMine
? theme === 'love'
? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-br-md shadow-[0_2px_10px_rgba(236,72,153,0.25)]'
: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 rounded-br-md shadow-[0_2px_10px_rgba(16,185,129,0.25)]'
: 'bg-slate-800/90 text-slate-100 rounded-bl-md border border-slate-700/50';

const myReaction = message.reactions?.find((r) => r.userId === user?.userId);

const handleReact = async (emoji) => {
setPickerOpen(false);
try {
if (myReaction?.emoji === emoji) {
await messageApi.removeReaction(message.id);
} else {
await messageApi.react(message.id, emoji);
}
onReactionChange?.();
} catch {
// sessizce geç
}
};

const handleDelete = async (forEveryone) => {
setMenuOpen(false);
try {
await messageApi.deleteMessage(message.id, forEveryone);
onDeleted?.();
} catch {
// sessizce geç
}
};

const startPress = () => {
if (isDeleted) return;
pressTimer.current = setTimeout(() => setPickerOpen(true), 500);
};
const cancelPress = () => {
clearTimeout(pressTimer.current);
};

const groupedReactions = (message.reactions || []).reduce((acc, r) => {
acc[r.emoji] = (acc[r.emoji] || 0) + 1;
return acc;
}, {});

return (
<div className={`group flex ${isMine ? 'justify-end' : 'justify-start'} mb-2.5 items-end gap-1.5 relative`}>
{!isMine && !isDeleted && (
<button
onClick={() => onReply(message)}
className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition p-1 self-center"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
</svg>
</button>
)}

<div className="relative min-w-0 flex-shrink-0 max-w-[75vw] sm:max-w-[420px]">
<div
onMouseDown={startPress}
onMouseUp={cancelPress}
onMouseLeave={cancelPress}
onTouchStart={startPress}
onTouchEnd={cancelPress}
className={`w-fit max-w-full rounded-2xl px-4 py-2.5 select-none ${!isDeleted ? 'cursor-pointer' : ''} ${bubbleColor}`}
>
{!isDeleted && message.replyToMessageId && (
<div className={`mb-1.5 pl-2 border-l-2 ${isMine ? 'border-slate-950/30' : 'border-slate-500'} text-xs opacity-75`}>
<p className="font-semibold">{message.replyToSenderUsername}</p>
<p className="truncate">{message.replyToContent || '[medya]'}</p>
</div>
)}

{isDeleted ? (
<p className="text-sm flex items-center gap-1.5">
<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
</svg>
Bu mesaj silindi
</p>
) : (
<>
{message.mediaUrl && message.mediaType === 'audio' ? (
<VoiceMessagePlayer src={message.mediaUrl} isMine={isMine} />
) : message.mediaUrl ? (
<img src={message.mediaUrl} alt="" className="rounded-lg mb-1.5 max-h-64 object-cover" />
) : null}
{message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
</>
)}

<div className={`flex items-center gap-1 justify-end mt-1 ${isMine && !isDeleted ? 'opacity-70' : 'text-slate-500'}`}>
<span className="text-[10px]">{time}</span>
{isMine && !isDeleted && (
<svg
className={`w-3.5 h-3.5 ${message.isRead ? 'text-sky-300' : ''}`}
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={2.5}
>
{message.isRead || message.isDelivered ? (
<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l3 3L15 6.75M11 12.75l3 3L20.5 6.75" />
) : (
<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
)}
</svg>
)}
</div>
</div>

{!isDeleted && Object.keys(groupedReactions).length > 0 && (
<div className={`flex gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
{Object.entries(groupedReactions).map(([emoji, count]) => (
<span
key={emoji}
onClick={() => handleReact(emoji)}
className="bg-slate-900/90 border border-slate-700/60 rounded-full px-2 py-0.5 text-xs cursor-pointer flex items-center gap-0.5 shadow-sm"
>
{emoji} {count > 1 && <span className="text-slate-400">{count}</span>}
</span>
))}
</div>
)}

{pickerOpen && (
<>
<div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
<div className={`absolute z-50 -top-13 ${isMine ? 'right-0' : 'left-0'} bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-full px-2.5 py-2 flex gap-1.5 shadow-2xl`}>
{REACTION_EMOJIS.map((emoji) => (
<button
key={emoji}
onClick={() => handleReact(emoji)}
className="text-lg hover:scale-125 transition-transform"
>
{emoji}
</button>
))}
</div>
</>
)}
</div>

{!isDeleted && (
<div className="relative" ref={menuRef}>
<button
onClick={() => setMenuOpen((v) => !v)}
className={`opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition p-1 self-center ${menuOpen ? 'opacity-100' : ''}`}
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
</svg>
</button>

{menuOpen && (
<div className={`absolute z-50 top-6 ${isMine ? 'right-0' : 'left-0'} bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-xl py-1 shadow-2xl min-w-[140px]`}>
<button
onClick={() => handleDelete(false)}
className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-700/60 transition"
>
Benden Sil
</button>
{isMine && (
<button
onClick={() => handleDelete(true)}
className="w-full text-left px-3.5 py-2.5 text-xs text-red-400 hover:bg-slate-700/60 transition"
>
Herkesten Sil
</button>
)}
</div>
)}
</div>
)}

{isMine && !isDeleted && (
<button
onClick={() => onReply(message)}
className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition p-1 self-center"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
</svg>
</button>
)}
</div>
);
}

export default MessageBubble;









