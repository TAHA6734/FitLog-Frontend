import { AnimatePresence, motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
iconSize: [25, 41],
iconAnchor: [12, 41],
});

function EventLocationModal({ isOpen, onClose, latitude, longitude, locationName }) {
return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md z-[201] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
>
<div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
<h2 className="text-white font-semibold text-sm flex items-center gap-1.5">
📍 {locationName || 'Etkinlik Konumu'}
</h2>
<button onClick={onClose} className="text-slate-500 hover:text-white transition">
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="h-72">
<MapContainer
center={[latitude, longitude]}
zoom={15}
style={{ height: '100%', width: '100%' }}
scrollWheelZoom={true}
>
<TileLayer
attribution='&copy; OpenStreetMap katkıda bulunanlar'
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
<Marker position={[latitude, longitude]} icon={markerIcon}>
{locationName && <Popup>{locationName}</Popup>}
</Marker>
</MapContainer>
</div>

<div className="p-3">
<a
href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
target="_blank"
rel="noopener noreferrer"
className="block text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
>
Tam ekran haritada aç ↗
</a>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default EventLocationModal;




