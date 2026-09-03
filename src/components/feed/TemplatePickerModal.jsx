import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { templateApi } from '../../api/templateApi';

const TYPE_LABELS = {
0: { label: 'Koşu', emoji: '🏃' },
1: { label: 'Ağırlık', emoji: '🏋️' },
2: { label: 'Yüzme', emoji: '🏊' },
3: { label: 'Bisiklet', emoji: '🚴' },
4: { label: 'Yoga', emoji: '🧘' },
5: { label: 'Diğer', emoji: '⚡' },
};

function TemplatePickerModal({ isOpen, onClose, onUsed, onCreateNew }) {
const [templates, setTemplates] = useState([]);
const [loading, setLoading] = useState(true);
const [usingId, setUsingId] = useState(null);

const loadTemplates = () => {
setLoading(true);
templateApi.getMy()
.then((res) => setTemplates(res.data))
.catch(() => toast.error('Şablonlar yüklenemedi.'))
.finally(() => setLoading(false));
};

useEffect(() => {
if (isOpen) loadTemplates();
}, [isOpen]);

const handleUse = async (id) => {
setUsingId(id);
try {
await templateApi.use(id);
toast.success('Antrenman şablondan paylaşıldı!');
onUsed?.();
onClose();
} catch {
toast.error('Bir hata oluştu.');
} finally {
setUsingId(null);
}
};

const handleDelete = async (e, id) => {
e.stopPropagation();
try {
await templateApi.delete(id);
toast.success('Şablon silindi.');
setTemplates((prev) => prev.filter((t) => t.id !== id));
} catch {
toast.error('Silinemedi.');
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
onClick={onClose}
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl z-50 max-h-[70vh] flex flex-col"
>
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
<h2 className="text-white font-semibold">Şablonlarım</h2>
<button onClick={onClose} className="text-slate-500 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="overflow-y-auto flex-1 p-3">
{loading ? (
<p className="text-slate-500 text-sm text-center py-6">Yükleniyor...</p>
) : templates.length === 0 ? (
<div className="text-center py-8">
<p className="text-slate-500 text-sm mb-3">Henüz şablonun yok.</p>
</div>
) : (
<div className="space-y-2">
{templates.map((t) => {
const typeInfo = TYPE_LABELS[t.type] || TYPE_LABELS[5];
return (
<div
key={t.id}
onClick={() => handleUse(t.id)}
className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
>
<span className="text-xl shrink-0">{typeInfo.emoji}</span>
<div className="flex-1 min-w-0">
<p className="text-sm text-white truncate">{t.name}</p>
<p className="text-xs text-slate-500">
{t.distance && `${t.distance} km`} {t.duration && `· ${t.duration.slice(0, 5)}`}
</p>
</div>
{usingId === t.id ? (
<span className="text-xs text-emerald-400">Paylaşılıyor...</span>
) : (
<button
onClick={(e) => handleDelete(e, t.id)}
className="text-slate-500 hover:text-red-400 transition p-1"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
</svg>
</button>
)}
</div>
);
})}
</div>
)}

<button
onClick={onCreateNew}
className="w-full mt-3 border border-dashed border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white text-sm rounded-lg py-2.5 transition"
>
+ Yeni Şablon Oluştur
</button>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default TemplatePickerModal;



