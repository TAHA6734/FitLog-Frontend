import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import MessageBubble from './MessageBubble';
import ChatWallpaper from './ChatWallpaper';
import VoiceRecorder from './VoiceRecorder';
import { SkeletonMessageBubble } from '../ui/Skeleton';
import { messageApi } from '../../api/messageApi';
import { blockApi } from '../../api/blockApi';
import { notificationApi } from '../../api/notificationApi';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

function MessageWindow({ conversation, onMessageSent, onRequestHandled,onBack }) {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(true);
const [replyTo, setReplyTo] = useState(null);
const [theme, setTheme] = useState('normal');
const [search, setSearch] = useState('');
const [searchOpen, setSearchOpen] = useState(false);
const [requestActionLoading, setRequestActionLoading] = useState(false);
const [isRecording, setIsRecording] = useState(false);

const { sendMessage, notifyTyping, notifyStopTyping, subscribeToMessages, isUserOnline, isUserTyping, refreshUnreadCount } = useChat() || {};
const { user } = useAuth();
const { refreshNotifications } = useNotifications() || {};
const navigate = useNavigate();

const messagesEndRef = useRef(null);
const typingTimeoutRef = useRef(null);
const messageRefs = useRef({});

const online = isUserOnline?.(conversation.otherUserId);
const typing = isUserTyping?.(conversation.otherUserId);

const isPendingIncoming = conversation.isAccepted === false && !conversation.isPendingSentByMe;
const isPendingSentByMe = conversation.isAccepted === false && conversation.isPendingSentByMe === true;

const loadMessages = useCallback(async () => {
if (conversation.id.startsWith('temp-')) {
setMessages([]);
setLoading(false);
return;
}

setLoading(true);
try {
const res = await messageApi.getMessages(conversation.id);
setMessages(res.data.reverse());
await messageApi.markAsRead(conversation.id);
refreshUnreadCount?.();

try {
await notificationApi.clearMessageNotifications(conversation.otherUserId);
refreshNotifications?.();
} catch {
// sessizce geç, kritik değil
}

onMessageSent?.();
} catch {
toast.error('Mesajlar yüklenemedi.');
} finally {
setLoading(false);
}
}, [conversation.id, conversation.otherUserId, onMessageSent, refreshNotifications, refreshUnreadCount]);

useEffect(() => {
loadMessages();
}, [loadMessages]);

useEffect(() => {
if (!subscribeToMessages) return;

const unsubscribe = subscribeToMessages(async (message) => {
if (message.senderId === conversation.otherUserId || message.senderId === user?.userId) {
if (message.conversationId === conversation.id || conversation.id.startsWith('temp-')) {
setMessages((prev) => {
if (prev.some((m) => m.id === message.id)) return prev;
return [...prev, { ...message, _justArrived: true }];
});



if (message.senderId === conversation.otherUserId && !conversation.id.startsWith('temp-')) {
try {
await messageApi.markAsRead(conversation.id);
refreshUnreadCount?.();
} catch {
// sessizce geç
}


notificationApi.clearMessageNotifications(conversation.otherUserId)
.then(() => refreshNotifications?.())
.catch(() => {});
}

onMessageSent?.();
}
}
});

return unsubscribe;
}, [conversation.id, conversation.otherUserId, subscribeToMessages, onMessageSent, refreshNotifications, refreshUnreadCount, user]);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
const timeout = setTimeout(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
}, 150);
return () => clearTimeout(timeout);
}, [messages]);

const handleInputChange = (e) => {
setInput(e.target.value);
notifyTyping?.(conversation.otherUserId);

clearTimeout(typingTimeoutRef.current);
typingTimeoutRef.current = setTimeout(() => {
notifyStopTyping?.(conversation.otherUserId);
}, 1500);
};

const handleSend = async (e) => {
e.preventDefault();
if (!input.trim()) return;

try {
await sendMessage(conversation.otherUserId, input.trim(), replyTo?.id || null);
setInput('');
setReplyTo(null);
notifyStopTyping?.(conversation.otherUserId);
onMessageSent?.();
if (isPendingIncoming) {
onRequestHandled?.();
}
} catch {
toast.error('Mesaj gönderilemedi.');
}
};

const handleAcceptRequest = async () => {
setRequestActionLoading(true);
try {
await messageApi.acceptRequest(conversation.id);
toast.success('Sohbete devam ediliyor.');
onRequestHandled?.();
} catch {
toast.error('Bir hata oluştu.');
} finally {
setRequestActionLoading(false);
}
};

const handleBlockUser = async () => {
if (!window.confirm(`${conversation.otherUsername} kullanıcısını engellemek istediğine emin misin?`)) return;
setRequestActionLoading(true);
try {
await blockApi.block(conversation.otherUserId);
toast.success('Kullanıcı engellendi.');
onRequestHandled?.();
} catch {
toast.error('Bir hata oluştu.');
} finally {
setRequestActionLoading(false);
}
};

const handleReactionChange = () => {
loadMessages();
};

const handleMessageDeleted = () => {
loadMessages();
};

const searchResults = search.trim()
? messages.filter((m) => m.content?.toLowerCase().includes(search.toLowerCase()))
: [];

const scrollToMessage = (messageId) => {
messageRefs.current[messageId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const bgClass = theme === 'love' ? 'bg-gradient-to-b from-pink-950/30 to-slate-950' : 'bg-slate-950';

return (
<div className={`flex flex-col h-full w-full relative overflow-hidden ${bgClass}`}>
<ChatWallpaper theme={theme} />

<div className="relative z-10 flex items-center justify-between px-3 sm:px-4 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg">
<div className="flex items-center gap-2 min-w-0">
<button
onClick={onBack}
className="sm:hidden text-slate-400 hover:text-white transition p-1 -ml-1 shrink-0"
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
</svg>
</button>
<div
onClick={() => navigate(`/profile/${conversation.otherUserId}`)}
className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0"
>

<div className="relative">
{conversation.isBlocked ? (
<div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
<circle cx="12" cy="12" r="9" />
<path strokeLinecap="round" d="M5.6 5.6l12.8 12.8" />
</svg>
</div>
) : (
<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden">
{conversation.otherUserProfilePhotoUrl ? (
<img src={conversation.otherUserProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
conversation.otherUsername?.[0]?.toUpperCase()
)}
</div>
)}
{online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />}
</div>
<div className="min-w-0">
<p className="text-sm font-medium text-white truncate">{conversation.otherUsername}</p>
<p className="text-xs text-slate-500">
{conversation.isBlocked ? '' : typing ? <span className="text-emerald-400">yazıyor...</span> : online ? 'çevrimiçi' : 'çevrimdışı'}
</p>
</div>
</div>
</div>


<div className="flex items-center gap-1">
<button
onClick={() => setSearchOpen((v) => !v)}
className={`p-2 rounded-full transition ${searchOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
title="Mesajlarda ara"
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
</button>

<div className="flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-xs">
<button
onClick={() => setTheme('normal')}
className={`px-2.5 py-1 rounded-full transition ${theme === 'normal' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
>
🏋️
</button>
<button
onClick={() => setTheme('love')}
className={`px-2.5 py-1 rounded-full transition ${theme === 'love' ? 'bg-pink-500 text-white font-semibold' : 'text-slate-400'}`}
>
💕
</button>
</div>
</div>
</div>

{searchOpen && (
<div className="relative z-10 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-lg">
<input
type="text"
autoFocus
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Bu sohbette ara..."
className="w-full bg-slate-800/60 border border-slate-700 rounded-full px-3.5 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
/>
{search.trim() && (
<div className="mt-2 max-h-40 overflow-y-auto space-y-1">
{searchResults.length === 0 ? (
<p className="text-xs text-slate-500 px-1">Sonuç bulunamadı.</p>
) : (
searchResults.map((m) => (
<div
key={m.id}
onClick={() => { scrollToMessage(m.id); setSearchOpen(false); setSearch(''); }}
className="text-xs text-slate-300 hover:bg-slate-800 rounded-lg px-2.5 py-1.5 cursor-pointer truncate"
>
<span className="text-slate-500">{m.senderUsername}:</span> {m.content}
</div>
))
)}
</div>
)}
</div>
)}

<div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
{loading ? (
<div>
<SkeletonMessageBubble align="left" />
<SkeletonMessageBubble align="right" />
<SkeletonMessageBubble align="left" />
<SkeletonMessageBubble align="left" />
<SkeletonMessageBubble align="right" />
</div>
) : messages.length === 0 ? (
<div className="flex flex-col items-center justify-center h-full text-center">
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center mb-3">
<span className="text-2xl">👋</span>
</div>
<p className="text-slate-400 text-sm">
{conversation.otherUsername} ile henüz mesajlaşmadınız.
</p>
<p className="text-slate-600 text-xs mt-1">İlk mesajı gönder!</p>
</div>
) : (
<>
{messages.map((m) => (
m._justArrived ? (
<motion.div
key={m.id}
ref={(el) => (messageRefs.current[m.id] = el)}
initial={{ opacity: 0, y: 12, scale: 0.97 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ duration: 0.2, ease: 'easeOut' }}
>
<MessageBubble
message={m}
isMine={m.senderId === user?.userId}
theme={theme}
onReply={setReplyTo}
onReactionChange={handleReactionChange}
onDeleted={handleMessageDeleted}
/>
</motion.div>
) : (
<div key={m.id} ref={(el) => (messageRefs.current[m.id] = el)}>
<MessageBubble
message={m}
isMine={m.senderId === user?.userId}
theme={theme}
onReply={setReplyTo}
onReactionChange={handleReactionChange}
onDeleted={handleMessageDeleted}
/>
</div>
)
))}
{typing && (
<div className="flex justify-start mb-2">
<div className="bg-slate-800/90 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
<span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
<span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
<span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
</div>
</div>
)}
<div ref={messagesEndRef} />
</>
)}
</div>

{isPendingIncoming && (
<div className="relative z-10 px-4 py-3.5 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80">
<p className="text-xs text-slate-400 mb-2.5">
{conversation.otherUsername} takip etmiyorsun. Bu kişiyi tanıyor musun?
</p>
<div className="flex gap-2">
<button
onClick={handleAcceptRequest}
disabled={requestActionLoading}
className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-sm font-semibold rounded-full py-2 transition shadow-[0_0_14px_rgba(16,185,129,0.3)]"
>
Sohbete Devam Et
</button>
<button
onClick={handleBlockUser}
disabled={requestActionLoading}
className="flex-1 border border-slate-700 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-sm font-semibold rounded-full py-2 transition"
>
Engelle
</button>
</div>
</div>
)}

{isPendingSentByMe && (
<div className="relative z-10 px-4 py-2.5 bg-slate-900/60 backdrop-blur-lg border-t border-slate-800/80 text-center">
<p className="text-xs text-slate-500">
İstek gönderildi. {conversation.otherUsername} kabul ettiğinde normal sohbete geçecek.
</p>
</div>
)}

{replyTo && (
<div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80">
<div className="flex-1 min-w-0 border-l-2 border-emerald-500 pl-2.5">
<p className="text-xs text-emerald-400 font-medium">{replyTo.senderUsername}</p>
<p className="text-xs text-slate-400 truncate">{replyTo.content || '[medya]'}</p>
</div>
<button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white ml-2">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
)}

<form onSubmit={handleSend} className="relative z-10 flex items-center gap-2 px-4 py-3 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-lg">
{!isRecording && (
<input
type="text"
value={input}
onChange={handleInputChange}
onKeyDown={(e) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
handleSend(e);
}
}}
maxLength={2000}
placeholder="Mesaj yaz..."
className="flex-1 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
/>
)}

{!isRecording && input.trim() ? (
<motion.button
whileTap={{ scale: 0.92 }}
type="submit"
className={`rounded-full p-2.5 transition ${
theme === 'love' ? 'bg-pink-500 hover:bg-pink-400 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
}`}
>
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
</svg>
</motion.button>
) : (
<VoiceRecorder
receiverId={conversation.otherUserId}
replyToMessageId={replyTo?.id}
onSent={() => setReplyTo(null)}
onRecordingStateChange={setIsRecording}
/>
)}
</form>
</div>
);
}

export default MessageWindow;





