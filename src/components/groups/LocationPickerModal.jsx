import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
iconSize: [25, 41],
iconAnchor: [12, 41],
});

const DEFAULT_CENTER = [41.0082, 28.9784]; // İstanbul

function ClickHandler({ onSelect }) {
useMapEvents({
click(e) {
onSelect(e.latlng);
},
});
return null;
}

// Arama sonucu seçilince haritayı o noktaya uçurur
function FlyToLocation({ target }) {
const map = useMap();
useEffect(() => {
if (target) {
map.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
}
}, [target, map]);
return null;
}

function LocationPickerModal({ isOpen, onClose, onSelect, initialPosition }) {
const [position, setPosition] = useState(initialPosition || null);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [searching, setSearching] = useState(false);
const [flyTarget, setFlyTarget] = useState(null);
const debounceRef = useRef(null);

useEffect(() => {
if (debounceRef.current) clearTimeout(debounceRef.current);

if (!searchQuery.trim()) {
setSearchResults([]);
return;
}

debounceRef.current = setTimeout(async () => {
setSearching(true);
try {
const res = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
);
const data = await res.json();
setSearchResults(data);
} catch {
setSearchResults([]);
} finally {
setSearching(false);
}
}, 500);

return () => clearTimeout(debounceRef.current);
}, [searchQuery]);

const handleResultClick = (result) => {
const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
setPosition(latlng);
setFlyTarget(latlng);
setSearchResults([]);
setSearchQuery(result.display_name);
};

const handleConfirm = () => {
if (!position) return;
onSelect({ lat: position.lat, lng: position.lng });
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
onClick={onClose}
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 rounded-3xl overflow-hidden shadow-2xl"
>
<div className="bg-slate-900 border border-slate-800 rounded-3xl">
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
<h2 className="text-white font-bold text-base flex items-center gap-2">
<span>📍</span> Konum Seç
</h2>
<button
onClick={onClose}
className="text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full p-1.5 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

{/* Arama kutusu */}
<div className="relative px-4 pt-4 z-[999]">
<div className="relative">
<svg
className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={2}
>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
</svg>
<input
type="text"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
placeholder="Adres, mekan veya semt ara..."
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm transition-all"
/>
{searching && (
<div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
)}
</div>

{searchResults.length > 0 && (
<div className="absolute left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-[1000] shadow-xl max-h-48 overflow-y-auto">
{searchResults.map((result) => (
<button
key={result.place_id}
type="button"
onClick={() => handleResultClick(result)}
className="w-full text-left px-3.5 py-2.5 text-sm text-slate-200 hover:bg-slate-700/60 transition border-b border-slate-700/50 last:border-0"
>
{result.display_name}
</button>
))}
</div>
)}
</div>

<div className="h-80 relative mt-3">
<MapContainer
center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
zoom={12}
className="w-full h-full"
>
<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
attribution='&copy; OpenStreetMap katkıda bulunanlar'
/>
<ClickHandler onSelect={setPosition} />
<FlyToLocation target={flyTarget} />
{position && <Marker position={[position.lat, position.lng]} icon={markerIcon} />}
</MapContainer>
</div>

<div className="p-4 flex items-center justify-between gap-3">
<p className="text-slate-500 text-xs truncate">
{position
? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
: 'Ara veya haritada bir noktaya tıkla'}
</p>
<button
onClick={handleConfirm}
disabled={!position}
className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-sm font-semibold rounded-full px-5 py-2 transition shrink-0"
>
Konumu Kaydet
</button>
</div>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default LocationPickerModal;
