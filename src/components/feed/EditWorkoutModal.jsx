import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { workoutApi } from '../../api/workoutApi';

const TYPE_LABELS = {
0: { label: 'Koşu', emoji: '🏃' },
1: { label: 'Ağırlık', emoji: '🏋️' },
2: { label: 'Yüzme', emoji: '🏊' },
3: { label: 'Bisiklet', emoji: '🚴' },
4: { label: 'Yoga', emoji: '🧘' },
5: { label: 'Diğer', emoji: '⚡' },
};

const FOCUS_AREAS = ['Esneklik', 'Güç', 'Denge', 'Nefes / Meditasyon', 'Genel'];

const PATTERNS = {
distance: /^\d{1,4}(\.\d{1,2})?$/,
distanceMeters: /^\d{1,5}(\.\d{1,2})?$/,
duration: /^\d{1,4}$/,
weightKg: /^\d{1,3}(\.\d{1,2})?$/,
reps: /^\d{1,4}$/,
sets: /^\d{1,3}$/,
};

function parseDurationToMinutes(durationStr) {
if (!durationStr) return '';
const parts = durationStr.split(':');
if (parts.length < 2) return '';
const hours = parseInt(parts[0], 10) || 0;
const minutes = parseInt(parts[1], 10) || 0;
const total = hours * 60 + minutes;
return total > 0 ? String(total) : '';
}

function EditWorkoutModal({ workout, isOpen, onClose, onUpdated }) {
const type = workout.type;
const typeInfo = TYPE_LABELS[type] || TYPE_LABELS[5];

const [description, setDescription] = useState(workout.description || '');
const [distance, setDistance] = useState(workout.distance != null ? String(workout.distance) : '');
const [duration, setDuration] = useState(parseDurationToMinutes(workout.duration));
const [extra, setExtra] = useState({
weightKg: workout.weightKg != null ? String(workout.weightKg) : '',
reps: workout.reps != null ? String(workout.reps) : '',
sets: workout.sets != null ? String(workout.sets) : '',
distanceMeters: workout.distanceMeters != null ? String(workout.distanceMeters) : '',
focusArea: workout.focusArea || '',
customStat: workout.customStat || '',
});
const [errors, setErrors] = useState({});

const [photo, setPhoto] = useState(null);
const [photoPreview, setPhotoPreview] = useState(workout.photoUrl || null);
const [removePhoto, setRemovePhoto] = useState(false);

const [video, setVideo] = useState(null);
const [videoPreview, setVideoPreview] = useState(workout.videoUrl || null);
const [removeVideo, setRemoveVideo] = useState(false);

const [loading, setLoading] = useState(false);

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

const handlePhotoChange = (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.size > 10 * 1024 * 1024) {
toast.error('Dosya boyutu 10MB\'ı geçemez.');
return;
}
setPhoto(file);
setPhotoPreview(URL.createObjectURL(file));
setRemovePhoto(false);
};

const handleRemovePhoto = () => {
setPhoto(null);
setPhotoPreview(null);
setRemovePhoto(true);
};

const handleVideoChange = (e) => {
const file = e.target.files[0];
if (!file) return;
const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
if (!allowedTypes.includes(file.type)) {
toast.error('Sadece mp4, mov veya webm formatları desteklenir.');
return;
}
if (file.size > 50 * 1024 * 1024) {
toast.error('Video boyutu 50MB\'ı geçemez.');
return;
}
setVideo(file);
setVideoPreview(URL.createObjectURL(file));
setRemoveVideo(false);
};

const handleRemoveVideo = () => {
setVideo(null);
setVideoPreview(null);
setRemoveVideo(true);
};

const handleSubmit = async (e) => {
e.preventDefault();

if (Object.keys(errors).length > 0) {
toast.error('Girdiğin değerleri kontrol et.');
return;
}

setLoading(true);

const formData = new FormData();
formData.append('Description', description.trim());
if (duration) formData.append('Duration', `${duration}:00`);
if (distance) formData.append('Distance', distance);
if (extra.weightKg) formData.append('WeightKg', extra.weightKg);
if (extra.reps) formData.append('Reps', extra.reps);
if (extra.sets) formData.append('Sets', extra.sets);
if (extra.distanceMeters) formData.append('DistanceMeters', extra.distanceMeters);
if (extra.focusArea) formData.append('FocusArea', extra.focusArea);
if (extra.customStat.trim()) formData.append('CustomStat', extra.customStat.trim());
if (photo) formData.append('Photo', photo);
if (video) formData.append('Video', video);
formData.append('RemovePhoto', removePhoto);
formData.append('RemoveVideo', removeVideo);

try {
const res = await workoutApi.update(workout.id, formData);
toast.success('Antrenman güncellendi.');
onUpdated?.(res.data);
} catch (err) {
toast.error(err.response?.data?.message || 'Güncellenemedi.');
} finally {
setLoading(false);
}
};

const inputClass = (hasError) =>
`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm ${
hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-emerald-500'
}`;

const renderTypeFields = () => {
if (type === 1) {
return (
<div className="grid grid-cols-3 gap-3">
<div>
<label className="block text-sm text-slate-400 mb-1.5">Ağırlık (kg)</label>
<input type="text" inputMode="decimal" value={extra.weightKg}
onChange={(e) => handleExtraChange('weightKg', e.target.value, PATTERNS.weightKg)}
className={inputClass(errors.weightKg)} placeholder="60" />
{errors.weightKg && <p className="text-red-400 text-xs mt-1">{errors.weightKg}</p>}
</div>
<div>
<label className="block text-sm text-slate-400 mb-1.5">Tekrar</label>
<input type="text" inputMode="numeric" value={extra.reps}
onChange={(e) => handleExtraChange('reps', e.target.value, PATTERNS.reps)}
className={inputClass(errors.reps)} placeholder="12" />
{errors.reps && <p className="text-red-400 text-xs mt-1">{errors.reps}</p>}
</div>
<div>
<label className="block text-sm text-slate-400 mb-1.5">Set</label>
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
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-sm text-slate-400 mb-1.5">Mesafe (m)</label>
<input type="text" inputMode="decimal" value={extra.distanceMeters}
onChange={(e) => handleExtraChange('distanceMeters', e.target.value, PATTERNS.distanceMeters)}
className={inputClass(errors.distanceMeters)} placeholder="1000" />
{errors.distanceMeters && <p className="text-red-400 text-xs mt-1">{errors.distanceMeters}</p>}
</div>
<div>
<label className="block text-sm text-slate-400 mb-1.5">Süre (dk)</label>
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
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-sm text-slate-400 mb-1.5">Süre (dk)</label>
<input type="text" inputMode="numeric" value={duration}
onChange={(e) => validateAndSet('duration', e.target.value, PATTERNS.duration, setDuration)}
className={inputClass(errors.duration)} placeholder="45" />
{errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
</div>
<div>
<label className="block text-sm text-slate-400 mb-1.5">Odak Alanı</label>
<select value={extra.focusArea}
onChange={(e) => handleExtraChange('focusArea', e.target.value, null)}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
<option value="">Seç (opsiyonel)</option>
{FOCUS_AREAS.map((f) => <option key={f} value={f}>{f}</option>)}
</select>
</div>
</div>
);
}

if (type === 5) {
return (
<div>
<label className="block text-sm text-slate-400 mb-1.5">Özel Bilgi</label>
<input type="text" maxLength={100} value={extra.customStat}
onChange={(e) => handleExtraChange('customStat', e.target.value, null)}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
placeholder="Örn. 12 tur, 45 dakika" />
</div>
);
}

return (
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-sm text-slate-400 mb-1.5">Mesafe (km)</label>
<input type="text" inputMode="decimal" value={distance}
onChange={(e) => validateAndSet('distance', e.target.value, PATTERNS.distance, setDistance)}
className={inputClass(errors.distance)} placeholder="5.0" />
{errors.distance && <p className="text-red-400 text-xs mt-1">{errors.distance}</p>}
</div>
<div>
<label className="block text-sm text-slate-400 mb-1.5">Süre (dk)</label>
<input type="text" inputMode="numeric" value={duration}
onChange={(e) => validateAndSet('duration', e.target.value, PATTERNS.duration, setDuration)}
className={inputClass(errors.duration)} placeholder="30" />
{errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
</div>
</div>
);
};

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ duration: 0.2 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl z-50 max-h-[90vh] overflow-y-auto"
>
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
<h2 className="text-white font-semibold">Antrenmanı Düzenle</h2>
<button onClick={onClose} className="text-slate-500 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<form onSubmit={handleSubmit} className="p-5 space-y-4">
<div>
<label className="block text-sm text-slate-400 mb-2">Spor Türü</label>
<div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
<span className="text-lg">{typeInfo.emoji}</span>
{typeInfo.label}
</div>
<p className="text-xs text-slate-600 mt-1">Spor türü paylaşımdan sonra değiştirilemez.</p>
</div>

<div>
<label className="block text-sm text-slate-400 mb-1.5">Açıklama</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
maxLength={500}
rows={3}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
placeholder="Bugün nasıl geçti?"
/>
</div>

{renderTypeFields()}

<div>
<label className="block text-sm text-slate-400 mb-1.5">Fotoğraf</label>
{photoPreview ? (
<div className="relative">
<img src={photoPreview} alt="" className="w-full h-48 object-cover rounded-lg" />
<button type="button" onClick={handleRemovePhoto}
className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
) : (
<label className="flex flex-col items-center justify-center gap-1.5 h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition text-slate-500">
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
<span className="text-xs">Fotoğraf ekle</span>
<input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
</label>
)}
</div>

<div>
<label className="block text-sm text-slate-400 mb-1.5">Video</label>
{videoPreview ? (
<div className="relative">
<video src={videoPreview} controls className="w-full h-48 object-cover rounded-lg bg-black" />
<button type="button" onClick={handleRemoveVideo}
className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
) : (
<label className="flex flex-col items-center justify-center gap-1.5 h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition text-slate-500">
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-2.36a.75.75 0 011.03.67v9.38a.75.75 0 01-1.03.67l-4.72-2.36M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 9.75v9a2.25 2.25 0 002.25 2.25z" />
</svg>
<span className="text-xs">Video ekle (max 50MB)</span>
<input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoChange} className="hidden" />
</label>
)}
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg py-2.5 transition"
>
{loading ? 'Kaydediliyor...' : 'Kaydet'}
</button>
</form>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default EditWorkoutModal;

