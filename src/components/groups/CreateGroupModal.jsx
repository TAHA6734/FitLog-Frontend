import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { groupApi } from '../../api/groupApi';

function CreateGroupModal({ isOpen, onClose, onCreated }) {
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [loading, setLoading] = useState(false);

const resetForm = () => {
setName('');
setDescription('');
};

const handleClose = () => {
resetForm();
onClose();
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!name.trim()) return;

setLoading(true);
try {
await groupApi.create({ name: name.trim(), description: description.trim() || null });
toast.success('Grup oluşturuldu! 🎉');
resetForm();
onCreated?.();
onClose();
} catch (err) {
toast.error(err.response?.data?.message || 'Grup oluşturulamadı.');
} finally {
setLoading(false);
}
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
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-md z-50 max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl"
>
<div className="bg-slate-900 border border-slate-800 rounded-3xl max-h-[85vh] overflow-y-auto">
<div className="relative h-16 sm:h-20 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-end px-4 sm:px-6 pb-3 sm:pb-4">
<button
onClick={handleClose}
className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<h2 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
<span className="text-xl sm:text-2xl">👥</span> Yeni Grup Oluştur
</h2>
</div>

<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Grup Adı</label>
<input
type="text"
value={name}
onChange={(e) => setName(e.target.value)}
maxLength={100}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm transition-all"
placeholder="Örn. 5K Koşu Grubu"
/>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Açıklama</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
maxLength={500}
rows={3}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none text-sm transition-all"
placeholder="Bu grup ne hakkında?"
/>
</div>

<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading || !name.trim()}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'Oluşturuluyor...' : 'Grubu Oluştur'}
</motion.button>
</form>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default CreateGroupModal;




