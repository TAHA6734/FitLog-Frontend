import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import ConversationList from '../components/chat/ConversationList';
import MessageWindow from '../components/chat/MessageWindow';
import NewChatModal from '../components/chat/NewChatModal';
import { SkeletonConversationItem } from '../components/ui/Skeleton';
import { messageApi } from '../api/messageApi';

function ChatPage() {
const [conversations, setConversations] = useState([]);
const [requests, setRequests] = useState([]);
const [showRequests, setShowRequests] = useState(false);
const [activeConversation, setActiveConversation] = useState(null);
const [loading, setLoading] = useState(true);
const [newChatOpen, setNewChatOpen] = useState(false);
const location = useLocation();

const loadConversations = useCallback(async () => {
try {
const res = await messageApi.getConversations();
setConversations(res.data);
} catch {
toast.error('Konuşmalar yüklenemedi.');
} finally {
setLoading(false);
}
}, []);

const loadRequests = useCallback(async () => {
try {
const res = await messageApi.getRequests();
setRequests(res.data);
} catch {
// sessizce geç
}
}, []);

useEffect(() => {
loadConversations();
loadRequests();
}, [loadConversations, loadRequests]);

useEffect(() => {
if (!activeConversation?.id?.startsWith('temp-')) return;
const realConversation = conversations.find((c) => c.otherUserId === activeConversation.otherUserId);
if (realConversation) {
setActiveConversation(realConversation);
}
}, [conversations, activeConversation]);

const handleSelectUser = useCallback((user) => {
setConversations((currentConversations) => {
const existing = currentConversations.find((c) => c.otherUserId === user.id);

if (existing) {
setActiveConversation(existing);
} else {
setActiveConversation({
id: `temp-${user.id}`,
otherUserId: user.id,
otherUsername: user.username,
otherUserProfilePhotoUrl: user.profilePhotoUrl,
isAccepted: true,
isPendingSentByMe: false,
});
}

return currentConversations;
});
setShowRequests(false);
}, []);

useEffect(() => {
const state = location.state;
if (state?.openUserId) {
handleSelectUser({
id: state.openUserId,
username: state.openUsername,
profilePhotoUrl: state.openUserPhoto,
});
}
}, [location.state, handleSelectUser]);

const handleSelectRequest = (r) => {
setActiveConversation({
id: r.id,
otherUserId: r.otherUserId,
otherUsername: r.otherUsername,
otherUserProfilePhotoUrl: r.otherUserProfilePhotoUrl,
isAccepted: false,
isPendingSentByMe: false,
});
};

const handleRequestHandled = () => {
loadRequests();
loadConversations();
setActiveConversation(null);
};

const handleBackToList = () => {
setActiveConversation(null);
};

return (
<PageLayout fullWidth>
<div className="flex h-screen w-full overflow-hidden">
{/* Konuşma listesi: mobilde sadece hiçbir sohbet seçili değilken görünür, masaüstünde her zaman görünür */}
<div
className={`w-full sm:w-80 border-r border-slate-800/80 flex-col shrink-0 bg-slate-950/40 ${
activeConversation ? 'hidden sm:flex' : 'flex'
}`}
>
<div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg">
<h1 className="text-lg font-bold text-white flex items-center gap-1.5">
<span className="text-emerald-400">💬</span> Mesajlar
</h1>
<button
onClick={() => setNewChatOpen(true)}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-2 transition shadow-[0_0_14px_rgba(16,185,129,0.3)]"
title="Yeni sohbet başlat"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
</button>
</div>

{requests.length > 0 && (
<button
onClick={() => setShowRequests((v) => !v)}
className={`flex items-center justify-between px-4 py-3 border-b border-slate-800/60 text-sm transition-colors ${
showRequests ? 'bg-slate-900/80 text-emerald-400' : 'text-slate-300 hover:bg-slate-900/40'
}`}
>
<span className="font-medium flex items-center gap-1.5">📥 Mesaj İstekleri</span>
<span className="bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
{requests.length}
</span>
</button>
)}

{showRequests ? (
requests.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-6">Bekleyen istek yok.</p>
) : (
<div className="overflow-y-auto flex-1">
{requests.map((r) => (
<div
key={r.id}
onClick={() => handleSelectRequest(r)}
className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-800/40 transition-colors ${
activeConversation?.id === r.id ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'
}`}
>
<div className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden shrink-0">
{r.otherUserProfilePhotoUrl ? (
<img src={r.otherUserProfilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
r.otherUsername?.[0]?.toUpperCase()
)}
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-white truncate">{r.otherUsername}</p>
<p className="text-xs text-slate-500 truncate">{r.lastMessageContent || 'Mesaj isteği'}</p>
</div>
</div>
))}
</div>
)
) : loading ? (
<div>
<SkeletonConversationItem />
<SkeletonConversationItem />
<SkeletonConversationItem />
<SkeletonConversationItem />
</div>
) : (
<ConversationList
conversations={conversations}
activeId={activeConversation?.id}
onSelect={(c) => { setActiveConversation(c); setShowRequests(false); }}
onPinChanged={loadConversations}
/>
)}
</div>

{/* Sohbet penceresi: mobilde sadece bir sohbet seçiliyken tam ekran görünür */}
<div className={`flex-1 min-w-0 ${activeConversation ? 'flex' : 'hidden sm:flex'}`}>
{activeConversation ? (
<MessageWindow
key={activeConversation.id}
conversation={activeConversation}
onMessageSent={loadConversations}
onRequestHandled={handleRequestHandled}
onBack={handleBackToList}
/>
) : (
<div className="flex-1 items-center justify-center bg-slate-950/60 hidden sm:flex">
<div className="text-center">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
<span className="text-3xl">💬</span>
</div>
<p className="text-slate-400 font-medium">Bir konuşma seç</p>
<p className="text-slate-600 text-sm mt-1">veya sağ üstten yeni sohbet başlat.</p>
</div>
</div>
)}
</div>
</div>

<NewChatModal
isOpen={newChatOpen}
onClose={() => setNewChatOpen(false)}
onSelectUser={handleSelectUser}
/>
</PageLayout>
);
}

export default ChatPage;
