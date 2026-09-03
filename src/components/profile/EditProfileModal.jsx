import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import { turkiyeApi } from '../../api/turkiyeApi';
import PremiumBadge from '../ui/PremiumBadge';
import { COVER_THEMES, isGradientCover, getGradientKey } from '../../utils/coverThemes';

function EditProfileModal({ isOpen, onClose, profile, onUpdated }) {
const [bio, setBio] = useState(profile.bio || '');
const [city, setCity] = useState(profile.city || '');
const [isPrivate, setIsPrivate] = useState(profile.isPrivate || false);
const [statsVisibility, setStatsVisibility] = useState(profile.statsVisibility || 'Public');
const [photo, setPhoto] = useState(null);
const [photoPreview, setPhotoPreview] = useState(profile.profilePhotoUrl || null);
const [coverPhoto, setCoverPhoto] = useState(null);
const [coverPhotoPreview, setCoverPhotoPreview] = useState(profile.coverPhotoUrl || null);
const [loading, setLoading] = useState(false);
const [provinces, setProvinces] = useState([]);
const [loadingProvinces, setLoadingProvinces] = useState(true);

useEffect(() => {
if (!isOpen) return;

turkiyeApi.getProvinces()
.then((res) => setProvinces(res.data.data))
.catch(() => toast.error('İl listesi yüklenemedi.'))
.finally(() => setLoadingProvinces(false));
}, [isOpen]);

const handlePhotoChange = (e) => {
const file = e.target.files[0];
if (!file) return;
setPhoto(file);
setPhotoPreview(URL.createObjectURL(file));
};

const handleCoverPhotoChange = (e) => {
const file = e.target.files[0];
if (!file) return;
setCoverPhoto(file);
setCoverPhotoPreview(URL.createObjectURL(file));
};

const handleCoverThemeSelect = async (themeKey) => {
try {
await userApi.setCoverTheme(themeKey);
setCoverPhotoPreview(`gradient:${themeKey}`);
setCoverPhoto(null);
toast.success('Kapak teması güncellendi!');
onUpdated?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Tema uygulanamadı.');
}
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);

try {
const formData = new FormData();
formData.append('Bio', bio);
formData.append('City', city);
if (photo) formData.append('ProfilePhoto', photo);
if (coverPhoto) formData.append('CoverPhoto', coverPhoto);

await userApi.updateProfile(formData);
await userApi.updatePrivacy(isPrivate);
await userApi.updateStatsVisibility(statsVisibility);

toast.success('Profil güncellendi!');
onUpdated?.();
onClose();
} catch (err) {
toast.error(err.response?.data?.message || 'Güncelleme başarısız oldu.');
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
onClick={onClose}
className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] sm:w-full max-w-md z-50 max-h-[88vh] overflow-hidden rounded-3xl shadow-2xl"
>
<div className="bg-slate-900 border border-slate-800 rounded-3xl max-h-[88vh] overflow-y-auto">
<div className="relative h-28 sm:h-32 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 border-b border-slate-800 overflow-hidden group">
{coverPhotoPreview && !isGradientCover(coverPhotoPreview) && (
<img src={coverPhotoPreview} alt="" className="w-full h-full object-cover" />
)}
{isGradientCover(coverPhotoPreview) && (
<div className={`absolute inset-0 bg-gradient-to-br ${COVER_THEMES[getGradientKey(coverPhotoPreview)] || ''}`} />
)}
<div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

<label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/0 group-hover:bg-black/30 transition-colors">
<div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-slate-950/70 rounded-full p-2.5">
<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.132.174C3.196 7.57 2.25 8.657 2.25 9.93V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.93c0-1.273-.946-2.36-2.204-2.526a48.108 48.108 0 00-1.132-.174 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
</svg>
</div>
<input type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
</label>

<button
type="button"
onClick={onClose}
className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition z-10"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<h2 className="absolute bottom-3.5 sm:bottom-4 left-5 sm:left-6 text-white font-bold text-lg sm:text-xl drop-shadow-lg">Profili Düzenle</h2>
</div>

<form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-5 sm:pb-6">
<div className="flex justify-center -mt-10 sm:-mt-12 mb-4 sm:mb-5">
<label className="cursor-pointer relative group">
<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-2xl sm:text-3xl overflow-hidden border-4 border-slate-900 shadow-xl">
{photoPreview ? (
<img src={photoPreview} alt="" className="w-full h-full object-cover" />
) : (
profile.username?.[0]?.toUpperCase()
)}
</div>
<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.132.174C3.196 7.57 2.25 8.657 2.25 9.93V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.93c0-1.273-.946-2.36-2.204-2.526a48.108 48.108 0 00-1.132-.174 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
</svg>
</div>
<input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
</label>
</div>

<div className="space-y-3.5 sm:space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Bio</label>
<textarea
value={bio}
onChange={(e) => setBio(e.target.value)}
maxLength={300}
rows={3}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm transition"
placeholder="Kendinden bahset..."
/>
<p className="text-right text-[11px] text-slate-600 mt-1">{bio.length}/300</p>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Şehir</label>
{loadingProvinces ? (
<div className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-500 text-sm">
İller yükleniyor...
</div>
) : (
<div className="relative">
<select
value={city}
onChange={(e) => setCity(e.target.value)}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none transition"
>
<option value="">İl seç</option>
{provinces.map((p) => (
<option key={p.id} value={p.name}>{p.name}</option>
))}
</select>
<svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
</div>
)}
</div>

{profile.isPremium && (
<div className="border-t border-slate-800 pt-4">
<p className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
<PremiumBadge className="w-3.5 h-3.5" /> Premium Kapak Temaları
</p>
<div className="grid grid-cols-5 gap-2">
{Object.entries(COVER_THEMES).map(([key, grad]) => (
<button
key={key}
type="button"
onClick={() => handleCoverThemeSelect(key)}
className={`h-10 sm:h-12 rounded-lg bg-gradient-to-br ${grad} border-2 transition ${
isGradientCover(coverPhotoPreview) && getGradientKey(coverPhotoPreview) === key
? 'border-white scale-105'
: 'border-transparent hover:border-slate-600'
}`}
title={key}
/>
))}
</div>
</div>
)}

<div className="border-t border-slate-800 pt-4 space-y-3">
<p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Gizlilik</p>

<label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-800/40 rounded-xl px-3.5 py-3 hover:bg-slate-800/60 transition">
<div className="min-w-0 pr-1">
<p className="text-sm text-white">Gizli Hesap</p>
<p className="text-xs text-slate-500 mt-0.5">Sadece takipçilerin bio'nu görebilir.</p>
</div>
<div className="relative shrink-0">
<input
type="checkbox"
checked={isPrivate}
onChange={(e) => setIsPrivate(e.target.checked)}
className="sr-only peer"
/>
<div className="w-11 h-6 bg-slate-700 peer-checked:bg-emerald-500 rounded-full transition-colors"></div>
<div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
</div>
</label>

<div className="bg-slate-800/40 rounded-xl px-3.5 py-3">
<p className="text-sm text-white mb-2">İstatistik Görünürlüğü</p>
<div className="relative">
<select
value={statsVisibility}
onChange={(e) => setStatsVisibility(e.target.value)}
className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition"
>
<option value="Public">Herkese Açık</option>
<option value="FollowersOnly">Sadece Takipçiler</option>
<option value="Private">Gizli</option>
</select>
<svg className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
</div>
</div>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition shadow-lg shadow-emerald-500/10"
>
{loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
</button>
</div>
</form>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default EditProfileModal;

