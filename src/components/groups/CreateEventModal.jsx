import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { eventApi } from '../../api/eventApi';
import LocationPickerModal from './LocationPickerModal';
import DateTimePicker from './DateTimePicker';

function CreateEventModal({ isOpen, onClose, onCreated, groupId }) {
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [location, setLocation] = useState('');
const [eventDate, setEventDate] = useState('');
const [coords, setCoords] = useState(null); // { lat, lng }
const [showLocationPicker, setShowLocationPicker] = useState(false);
const [loading, setLoading] = useState(false);

const resetForm = () => {
setTitle('');
setDescription('');
setLocation('');
setEventDate('');
setCoords(null);
};

const handleClose = () => {
resetForm();
onClose();
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!title.trim() || !eventDate) return;

setLoading(true);
try {
await eventApi.create(groupId, {
title: title.trim(),
description: description.trim() || null,
location: location.trim() || null,
latitude: coords?.lat ?? null,
longitude: coords?.lng ?? null,
eventDate: new Date(eventDate).toISOString(),
});
toast.success('Etkinlik oluşturuldu! 🎉');
resetForm();
onCreated?.();
onClose();
} catch (err) {
toast.error(err.response?.data?.message || 'Etkinlik oluşturulamadı.');
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
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-3xl shadow-2xl"
>
<div className="bg-slate-900 border border-slate-800 rounded-3xl">
<div className="relative h-20 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-end px-6 pb-4 rounded-t-3xl">
<button
onClick={handleClose}
className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
<h2 className="text-white font-bold text-xl flex items-center gap-2">
<span className="text-2xl">📅</span> Yeni Etkinlik Oluştur
</h2>
</div>

<form onSubmit={handleSubmit} className="p-6 space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
Etkinlik Adı
</label>
<input
type="text"
value={title}
onChange={(e) => setTitle(e.target.value)}
maxLength={150}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm transition-all"
placeholder="Örn. Cumartesi Grup Koşusu"
/>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
Tarih ve Saat
</label>
<DateTimePicker value={eventDate} onChange={setEventDate} />
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
Konum
</label>
<div className="flex gap-2">
<input
type="text"
value={location}
onChange={(e) => setLocation(e.target.value)}
maxLength={250}
className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm transition-all"
placeholder="Örn. Belgrad Ormanı Girişi"
/>
<button
type="button"
onClick={() => setShowLocationPicker(true)}
className={`shrink-0 text-xs font-medium rounded-xl px-3.5 transition ${
coords
? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
: 'border border-slate-700 text-slate-300 hover:border-emerald-500/50'
}`}
>
{coords ? '📍 Seçildi' : '🗺️ Haritadan Seç'}
</button>
</div>
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
Açıklama
</label>
<textarea
value={description}
onChange={(e) => setDescription(e.target.value)}
maxLength={1000}
rows={3}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none text-sm transition-all"
placeholder="Etkinlik hakkında detaylar..."
/>
</div>

<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading || !title.trim() || !eventDate}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur'}
</motion.button>
</form>
</div>
</motion.div>

<LocationPickerModal
isOpen={showLocationPicker}
onClose={() => setShowLocationPicker(false)}
onSelect={setCoords}
initialPosition={coords}
/>
</>
)}
</AnimatePresence>
);
}

export default CreateEventModal;
