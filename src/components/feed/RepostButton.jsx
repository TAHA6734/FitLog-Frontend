import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { repostApi } from '../../api/repostApi';

function RepostButton({ workoutId, onReposted }) {
const [modalOpen, setModalOpen] = useState(false);
const [note, setNote] = useState('');
const [loading, setLoading] = useState(false);

const handleOpen = (e) => {
e.stopPropagation();
setModalOpen(true);
};

const handleClose = (e) => {
e?.stopPropagation();
setModalOpen(false);
};

const handleRepost = async (e) => {
e.preventDefault();
e.stopPropagation();
setLoading(true);
try {
await repostApi.create(workoutId, note.trim() || null);
toast.success('Paylaşıldı! 🔁');
setNote('');
setModalOpen(false);
onReposted?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Paylaşılamadı.');
} finally {
setLoading(false);
}
};

return (
<>
<button
onClick={handleOpen}
className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
title="Paylaş"
>
<svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
</button>

<AnimatePresence>
{modalOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={handleClose}
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
/>
<motion.div
onClick={(e) => e.stopPropagation()}
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl z-50"
>
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
<h2 className="text-white font-semibold text-sm">Antrenmanı Paylaş</h2>
<button onClick={handleClose} className="text-slate-500 hover:text-white transition">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<form onSubmit={handleRepost} className="p-5 space-y-3">
<textarea
value={note}
onChange={(e) => setNote(e.target.value)}
onClick={(e) => e.stopPropagation()}
maxLength={280}
rows={3}
placeholder="Bir not ekle (opsiyonel)..."
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
/>
<button
type="submit"
onClick={(e) => e.stopPropagation()}
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg py-2 text-sm transition"
>
{loading ? 'Paylaşılıyor...' : 'Paylaş'}
</button>
</form>
</motion.div>
</>
)}
</AnimatePresence>
</>
);
}

export default RepostButton;

