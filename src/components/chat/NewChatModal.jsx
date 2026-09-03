import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';

function NewChatModal({ isOpen, onClose, onSelectUser }) {
const [results, setResults] = useState([]);
const [search, setSearch] = useState('');
const [loading, setLoading] = useState(false);

useEffect(() => {
if (!isOpen || !search.trim()) {
setResults([]);
return;
}

setLoading(true);
const timeout = setTimeout(() => {
axiosClient.get(`/User/search?query=${encodeURIComponent(search.trim())}`)
.then((res) => setResults(res.data))
.catch(() => setResults([]))
.finally(() => setLoading(false));
}, 300);

return () => clearTimeout(timeout);
}, [search, isOpen]);

const handleClose = () => {
setSearch('');
setResults([]);
onClose();
};

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={handleClose}
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-sm z-50 max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
>
<div className="bg-slate-900 border border-slate-800 rounded-3xl max-h-[70vh] flex flex-col">
<div className="relative bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
<button
onClick={handleClose}
className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
<span className="text-lg sm:text-xl">💬</span> Yeni Sohbet
</h2>
</div>

<div className="p-3 sm:p-3.5 border-b border-slate-800/80 shrink-0">
<div className="relative">
<svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
<input
type="text"
autoFocus
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Kullanıcı ara..."
className="w-full bg-slate-800/60 border border-slate-700 rounded-full pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
/>
</div>
</div>

<div className="overflow-y-auto flex-1">
{!search.trim() ? (
<div className="flex flex-col items-center py-10 text-center">
<div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-2">
<span className="text-xl">🔍</span>
</div>
<p className="text-slate-500 text-sm">Bir kullanıcı adı yaz.</p>
</div>
) : loading ? (
<p className="text-slate-500 text-sm text-center py-8">Aranıyor...</p>
) : results.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-8">Sonuç bulunamadı.</p>
) : (
results.map((u) => {
const username = u.username || u.Username || 'Bilinmeyen';
const userId = u.id || u.Id || u.userId;
const photo = u.profilePhotoUrl || u.ProfilePhotoUrl;

return (
<div
key={userId}
onClick={() => { onSelectUser({ id: userId, username, profilePhotoUrl: photo }); handleClose(); }}
className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-800/50 transition-colors"
>
<div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-semibold overflow-hidden shrink-0">
{photo ? (
<img src={photo} alt="" className="w-full h-full object-cover" />
) : (
username[0]?.toUpperCase()
)}
</div>
<p className="text-sm text-white font-medium">{username}</p>
</div>
);
})
)}
</div>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default NewChatModal;

