import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { followApi, userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

function isCurrentlyFollowed(u) {
return u.isFollowedByMe === true || u.followStatus === 'accepted';
}

function FollowListModal({ isOpen, onClose, userId, type }) {
const [list, setList] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [actionLoadingId, setActionLoadingId] = useState(null);

const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [searching, setSearching] = useState(false);

const navigate = useNavigate();
const { user: currentUser } = useAuth();

const isOwnList = currentUser?.userId === userId;

useEffect(() => {
if (!isOpen) return;

setLoading(true);
setError(null);
setSearchQuery('');
setSearchResults([]);
const fetcher = type === 'followers' ? followApi.getFollowers : followApi.getFollowing;

fetcher(userId)
.then((res) => setList(res.data))
.catch((err) => {
setError(err.response?.data?.message || 'Liste yüklenemedi.');
})
.finally(() => setLoading(false));
}, [isOpen, userId, type]);

useEffect(() => {
if (!searchQuery.trim()) {
setSearchResults([]);
setSearching(false);
return;
}

setSearching(true);
const timeout = setTimeout(() => {
userApi.search(searchQuery.trim())
.then((res) => setSearchResults(res.data))
.catch(() => toast.error('Arama başarısız oldu.'))
.finally(() => setSearching(false));
}, 300);

return () => clearTimeout(timeout);
}, [searchQuery]);

const handleUserClick = (id) => {
onClose();
navigate(`/profile/${id}`);
};

const handleUnfollow = async (e, target) => {
e.stopPropagation();
setActionLoadingId(target.id);
try {
await followApi.unfollow(target.id);
setList((prev) => prev.filter((u) => u.id !== target.id));
toast.success(`${target.username} artık takip edilmiyor.`);
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setActionLoadingId(null);
}
};

const handleRemoveFollower = async (e, target) => {
e.stopPropagation();
setActionLoadingId(target.id);
try {
await followApi.removeFollower(target.id);
setList((prev) => prev.filter((u) => u.id !== target.id));
toast.success(`${target.username} takipçilerinden kaldırıldı.`);
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setActionLoadingId(null);
}
};

const handleToggleFollow = async (e, target, listSetter) => {
e.stopPropagation();
setActionLoadingId(target.id);
const currentlyFollowed = isCurrentlyFollowed(target);
try {
if (currentlyFollowed) {
await followApi.unfollow(target.id);
} else {
await followApi.follow(target.id);
}
listSetter((prev) =>
prev.map((u) =>
u.id === target.id
? { ...u, isFollowedByMe: !currentlyFollowed, followStatus: !currentlyFollowed ? 'accepted' : 'none' }
: u
)
);
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setActionLoadingId(null);
}
};

const renderActionButton = (u) => {
if (currentUser?.userId === u.id) return null;

if (isOwnList) {
if (type === 'following') {
return (
<button
onClick={(e) => handleUnfollow(e, u)}
disabled={actionLoadingId === u.id}
className="text-[11px] border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 rounded-full px-3 py-1.5 transition disabled:opacity-50 shrink-0"
>
{actionLoadingId === u.id ? '...' : 'Takibi Bırak'}
</button>
);
}
if (type === 'followers') {
return (
<button
onClick={(e) => handleRemoveFollower(e, u)}
disabled={actionLoadingId === u.id}
className="text-[11px] border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 rounded-full px-3 py-1.5 transition disabled:opacity-50 shrink-0"
>
{actionLoadingId === u.id ? '...' : 'Kaldır'}
</button>
);
}
}

const followed = isCurrentlyFollowed(u);
return (
<button
onClick={(e) => handleToggleFollow(e, u, setList)}
disabled={actionLoadingId === u.id}
className={`text-[11px] rounded-full px-3 py-1.5 transition disabled:opacity-50 shrink-0 ${
followed
? 'border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400'
: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold'
}`}
>
{actionLoadingId === u.id ? '...' : followed ? 'Takip Ediliyor' : 'Takip Et'}
</button>
);
};

const renderSearchActionButton = (u) => {
if (currentUser?.userId === u.id) return null;

const followed = isCurrentlyFollowed(u);
return (
<button
onClick={(e) => handleToggleFollow(e, u, setSearchResults)}
disabled={actionLoadingId === u.id}
className={`text-[11px] rounded-full px-3 py-1.5 transition disabled:opacity-50 shrink-0 ${
followed
? 'border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400'
: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold'
}`}
>
{actionLoadingId === u.id ? '...' : followed ? 'Takip Ediliyor' : 'Takip Et'}
</button>
);
};

const isSearchMode = searchQuery.trim().length > 0;
const displayList = isSearchMode ? searchResults : list;

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl z-50 max-h-[70vh] flex flex-col"
>
<div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
<h2 className="text-white font-semibold">
{type === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
</h2>
<button onClick={onClose} className="text-slate-500 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="px-4 py-3 border-b border-slate-800">
<div className="relative">
<svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
<input
type="text"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
placeholder="Kullanıcı ara..."
className="w-full bg-slate-800 border border-slate-700 rounded-full pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
/>
</div>
</div>

<div className="overflow-y-auto flex-1">
{isSearchMode ? (
searching ? (
<p className="text-slate-500 text-sm text-center py-6">Aranıyor...</p>
) : searchResults.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-6">Kullanıcı bulunamadı.</p>
) : (
searchResults.map((u) => (
<div
key={u.id}
onClick={() => handleUserClick(u.id)}
className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-800/50 transition-colors"
>
<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden shrink-0">
{u.profilePhotoUrl ? (
<img src={u.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
u.username?.[0]?.toUpperCase()
)}
</div>
<p className="text-sm text-white flex-1 truncate">{u.username}</p>
{renderSearchActionButton(u)}
</div>
))
)
) : loading ? (
<p className="text-slate-500 text-sm text-center py-6">Yükleniyor...</p>
) : error ? (
<div className="text-center py-10 px-4">
<span className="text-3xl mb-2 block">🔒</span>
<p className="text-slate-400 text-sm">{error}</p>
</div>
) : list.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-6">
{type === 'followers' ? 'Henüz takipçi yok.' : 'Henüz kimseyi takip etmiyor.'}
</p>
) : (
list.map((u) => (
<div
key={u.id}
onClick={() => handleUserClick(u.id)}
className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-800/50 transition-colors"
>
<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden shrink-0">
{u.profilePhotoUrl ? (
<img src={u.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
u.username?.[0]?.toUpperCase()
)}
</div>
<p className="text-sm text-white flex-1 truncate">{u.username}</p>
{renderActionButton(u)}
</div>
))
)}
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default FollowListModal;
