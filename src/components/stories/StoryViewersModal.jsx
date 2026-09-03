import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { storyApi } from '../../api/storyApi';

function timeAgo(dateString) {
const diff = (Date.now() - new Date(dateString)) / 1000;
if (diff < 60) return 'az önce';
if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
return `${Math.floor(diff / 3600)}sa`;
}

function StoryViewersModal({ storyId, isOpen, onClose }) {
const [viewers, setViewers] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
if (!isOpen) return;
setLoading(true);
storyApi.getViewers(storyId)
.then((res) => setViewers(res.data))
.catch(() => toast.error('Görüntüleyenler yüklenemedi.'))
.finally(() => setLoading(false));
}, [isOpen, storyId]);

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/70 z-[60]"
/>
<motion.div
initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
className="fixed bottom-0 left-0 right-0 z-[70] bg-slate-900 border-t border-slate-800 rounded-t-2xl max-h-[60vh] flex flex-col"
>
<div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
<h2 className="text-white font-semibold text-sm">Görüntüleyenler ({viewers.length})</h2>
<button onClick={onClose} className="text-slate-500 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
<div className="overflow-y-auto flex-1">
{loading ? (
<p className="text-slate-500 text-sm text-center py-6">Yükleniyor...</p>
) : viewers.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-6">Henüz kimse görüntülemedi.</p>
) : (
viewers.map((v) => (
<div
key={v.userId}
onClick={() => { onClose(); navigate(`/profile/${v.userId}`); }}
className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors"
>
<div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-semibold overflow-hidden shrink-0">
{v.profilePhotoUrl ? (
<img src={v.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
v.username?.[0]?.toUpperCase()
)}
</div>
<p className="text-sm text-white flex-1 truncate">{v.username}</p>
<span className="text-xs text-slate-500">{timeAgo(v.viewedAt)}</span>
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

export default StoryViewersModal;






