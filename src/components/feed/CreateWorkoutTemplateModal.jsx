import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { templateApi } from '../../api/templateApi';
import { minutesToTimeSpan } from '../../utils/duration';
const WORKOUT_TYPES = [
{ value: 0, label: 'Koşu', emoji: '🏃' },
{ value: 1, label: 'Ağırlık', emoji: '🏋️' },
{ value: 2, label: 'Yüzme', emoji: '🏊' },
{ value: 3, label: 'Bisiklet', emoji: '🚴' },
{ value: 4, label: 'Yoga', emoji: '🧘' },
{ value: 5, label: 'Diğer', emoji: '⚡' },
];

const FOCUS_AREAS = ['Esneklik', 'Güç', 'Denge', 'Nefes / Meditasyon', 'Genel'];

const PATTERNS = {
distance: /^\d{1,4}(\.\d{1,2})?$/,
distanceMeters: /^\d{1,5}(\.\d{1,2})?$/,
duration: /^\d{1,4}$/,
weightKg: /^\d{1,3}(\.\d{1,2})?$/,
reps: /^\d{1,4}$/,
sets: /^\d{1,3}$/,
};

const EMPTY_EXTRA = { weightKg: '', reps: '', sets: '', distanceMeters: '', focusArea: '', customStat: '' };

function CreateWorkoutTemplateModal({ isOpen, onClose, onCreated }) {
const [name, setName] = useState('');
const [type, setType] = useState(0);
const [description, setDescription] = useState('');
const [distance, setDistance] = useState('');
const [duration, setDuration] = useState('');
const [extra, setExtra] = useState(EMPTY_EXTRA);
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const resetForm = () => {
setName('');
setDescription('');
setDistance('');
setDuration('');
setExtra(EMPTY_EXTRA);
setErrors({});
};

const handleTypeChange = (newType) => {
setType(newType);
setDistance('');
setDuration('');
setExtra(EMPTY_EXTRA);
setErrors({});
};

const validateAndSet = (key, value, pattern, setter) => {
setter(value);
setErrors((prev) => {
const next = { ...prev };
if (value === '' || pattern.test(value)) delete next[key];
else next[key] = 'Geçersiz format';
return next;
});
};

const handleExtraChange = (key, value, pattern) => {
setExtra((prev) => ({ ...prev, [key]: value }));
setErrors((prev) => {
const next = { ...prev };
if (!pattern || value === '' || pattern.test(value)) delete next[key];
else next[key] = 'Geçersiz format';
return next;
});
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!name.trim()) return;

if (Object.keys(errors).length > 0) {
toast.error('Girdiğin değerleri kontrol et.');
return;
}

setLoading(true);
try {
await templateApi.create({
name: name.trim(),
type,
description: description.trim() || null,
distance: distance ? parseFloat(distance) : null,
duration: minutesToTimeSpan(duration),
weightKg: extra.weightKg ? parseFloat(extra.weightKg) : null,
reps: extra.reps ? parseInt(extra.reps, 10) : null,
sets: extra.sets ? parseInt(extra.sets, 10) : null,
distanceMeters: extra.distanceMeters ? parseFloat(extra.distanceMeters) : null,
focusArea: extra.focusArea || null,
customStat: extra.customStat.trim() || null,
});
toast.success('Şablon oluşturuldu!');
resetForm();
onCreated?.();
onClose();
} catch (err) {
toast.error(err.response?.data?.message || 'Şablon oluşturulamadı.');
} finally {
setLoading(false);
}
};

const inputClass = (hasError) =>
`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm transition-all ${
hasError ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500/50'
}`;

const renderTypeFields = () => {
if (type === 1) {
return (
<div className="grid grid-cols-3 gap-2.5 sm:gap-3">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Ağırlık (kg)</label>
<input type="text" inputMode="decimal" value={extra.weightKg}
onChange={(e) => handleExtraChange('weightKg', e.target.value, PATTERNS.weightKg)}
className={inputClass(errors.weightKg)} placeholder="60" />
{errors.weightKg && <p className="text-red-400 text-xs mt-1">{errors.weightKg}</p>}
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Tekrar</label>
<input type="text" inputMode="numeric" value={extra.reps}
onChange={(e) => handleExtraChange('reps', e.target.value, PATTERNS.reps)}
className={inputClass(errors.reps)} placeholder="12" />
{errors.reps && <p className="text-red-400 text-xs mt-1">{errors.reps}</p>}
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Set</label>
<input type="text" inputMode="numeric" value={extra.sets}
onChange={(e) => handleExtraChange('sets', e.target.value, PATTERNS.sets)}
className={inputClass(errors.sets)} placeholder="4" />
{errors.sets && <p className="text-red-400 text-xs mt-1">{errors.sets}</p>}
</div>
</div>
);
}

if (type === 2) {
return (
<div className="grid grid-cols-2 gap-2.5 sm:gap-3">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Mesafe (m)</label>
<input type="text" inputMode="decimal" value={extra.distanceMeters}
onChange={(e) => handleExtraChange('distanceMeters', e.target.value, PATTERNS.distanceMeters)}
className={inputClass(errors.distanceMeters)} placeholder="1000" />
{errors.distanceMeters && <p className="text-red-400 text-xs mt-1">{errors.distanceMeters}</p>}
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Süre (dk)</label>
<input type="text" inputMode="numeric" value={duration}
onChange={(e) => validateAndSet('duration', e.target.value, PATTERNS.duration, setDuration)}
className={inputClass(errors.duration)} placeholder="30" />
{errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
</div>
</div>
);
}

if (type === 4) {
return (
<div className="grid grid-cols-2 gap-2.5 sm:gap-3">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Süre (dk)</label>
<input type="text" inputMode="numeric" value={duration}
onChange={(e) => validateAndSet('duration', e.target.value, PATTERNS.duration, setDuration)}
className={inputClass(errors.duration)} placeholder="45" />
{errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Odak Alanı</label>
<div className="relative">
<select value={extra.focusArea}
onChange={(e) => handleExtraChange('focusArea', e.target.value, null)}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all">
<option value="">Seç (opsiyonel)</option>
{FOCUS_AREAS.map((f) => <option key={f} value={f}>{f}</option>)}
</select>
<svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
</div>
</div>
</div>
);
}

if (type === 5) {
return (
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Özel Bilgi</label>
<input type="text" maxLength={100} value={extra.customStat}
onChange={(e) => handleExtraChange('customStat', e.target.value, null)}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-all"
placeholder="Örn. 12 tur, 45 dakika" />
</div>
);
}

return (
<div className="grid grid-cols-2 gap-2.5 sm:gap-3">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Mesafe (km)</label>
<input type="text" inputMode="decimal" value={distance}
onChange={(e) => validateAndSet('distance', e.target.value, PATTERNS.distance, setDistance)}
className={inputClass(errors.distance)} placeholder="5.0" />
{errors.distance && <p className="text-red-400 text-xs mt-1">{errors.distance}</p>}
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Süre (dk)</label>
<input type="text" inputMode="numeric" value={duration}
onChange={(e) => validateAndSet('duration', e.target.value, PATTERNS.duration, setDuration)}
className={inputClass(errors.duration)} placeholder="30" />
{errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
</div>
</div>
);
};

const typeInfo = WORKOUT_TYPES[type];

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
onClick={onClose}
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
<button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<h2 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
<span className="text-xl sm:text-2xl">{typeInfo.emoji}</span> Yeni Şablon
</h2>
</div>

<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Şablon Adı</label>
<input
type="text"
value={name}
onChange={(e) => setName(e.target.value)}
maxLength={100}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm transition-all"
placeholder="Örn. Sabah Koşusu"
/>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Spor Türü</label>
<div className="grid grid-cols-3 gap-2">
{WORKOUT_TYPES.map((t) => (
<motion.button
key={t.value}
whileTap={{ scale: 0.96 }}
type="button"
onClick={() => handleTypeChange(t.value)}
className={`flex flex-col items-center gap-1 py-2.5 sm:py-3 rounded-xl border-2 transition-all text-xs sm:text-sm ${
type === t.value
? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.15)]'
: 'border-slate-800 text-slate-400 hover:border-slate-700'
}`}
>
<span className="text-lg sm:text-xl">{t.emoji}</span>
{t.label}
</motion.button>
))}
</div>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Açıklama</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
maxLength={500}
rows={2}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none text-sm transition-all"
placeholder="Rutin açıklaman..."
/>
</div>

{renderTypeFields()}

<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading || !name.trim()}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'Oluşturuluyor...' : 'Şablonu Kaydet'}
</motion.button>
</form>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default CreateWorkoutTemplateModal;







