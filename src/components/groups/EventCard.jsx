import { toast } from 'sonner';
import { eventApi } from '../../api/eventApi';

function formatEventDate(dateStr) {
const date = new Date(dateStr);
return date.toLocaleString('tr-TR', {
day: 'numeric',
month: 'long',
hour: '2-digit',
minute: '2-digit',
});
}

function EventCard({ event, groupId, onUpdated, isAdmin }) {
const handleRespond = async (status) => {
try {
await eventApi.respond(groupId, event.id, status);
onUpdated?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Oy verilemedi.');
}
};

const handleDelete = async () => {
if (!confirm('Bu etkinliği silmek istediğine emin misin?')) return;
try {
await eventApi.delete(groupId, event.id);
toast.success('Etkinlik silindi.');
onUpdated?.();
} catch {
toast.error('Etkinlik silinemedi.');
}
};

const canDelete = isAdmin;

return (
<div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
<div className="flex items-start justify-between gap-2">
<div className="min-w-0">
<h4 className="text-white font-semibold text-sm truncate">{event.title}</h4>
<p className="text-slate-500 text-xs mt-1">📅 {formatEventDate(event.eventDate)}</p>
{event.location && (
<p className="text-slate-500 text-xs mt-0.5">
📍 {event.location}
{event.latitude && event.longitude && (
<a
href={`https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=16/${event.latitude}/${event.longitude}`}
target="_blank"
rel="noopener noreferrer"
className="text-emerald-400 hover:underline ml-1.5"
>
Haritada gör →
</a>
)}
</p>
)}


</div>
{canDelete && (
<button
onClick={handleDelete}
className="text-slate-500 hover:text-red-400 transition shrink-0"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
)}
</div>

{event.description && (
<p className="text-slate-400 text-xs mt-2">{event.description}</p>
)}

<div className="flex items-center gap-2 mt-3">
<button
onClick={() => handleRespond('Going')}
className={`flex-1 text-xs font-medium rounded-full py-2 transition ${
event.myStatus === 'Going'
? 'bg-emerald-500 text-slate-950'
: 'border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
}`}
>
Katılacağım ({event.goingCount})
</button>
<button
onClick={() => handleRespond('NotGoing')}
className={`flex-1 text-xs font-medium rounded-full py-2 transition ${
event.myStatus === 'NotGoing'
? 'bg-red-500/80 text-white'
: 'border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400'
}`}
>
Katılamayacağım ({event.notGoingCount})
</button>
</div>
</div>
);
}

export default EventCard;




