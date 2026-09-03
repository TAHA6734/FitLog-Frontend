import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Vite ile Leaflet'in varsayılan marker ikonları bozuk gelir (asset path sorunu),
// bu yüzden CDN üzerinden elle tanımlıyoruz.
const markerIcon = new L.Icon({
iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
iconSize: [25, 41],
iconAnchor: [12, 41],
});

function WorkoutRouteMap({ route }) {
if (!route || route.length === 0) return null;

const positions = route.map((p) => [p.lat, p.lng]);
const start = positions[0];
const end = positions[positions.length - 1];

return (
<div className="w-full h-64 rounded-xl overflow-hidden border border-slate-800 mt-4">
<MapContainer
bounds={positions}
style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}
scrollWheelZoom={false}
>
<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>
<Polyline positions={positions} pathOptions={{ color: '#34d399', weight: 4 }} />
<Marker position={start} icon={markerIcon} />
{positions.length > 1 && <Marker position={end} icon={markerIcon} />}
</MapContainer>
</div>
);
}

export default WorkoutRouteMap;
