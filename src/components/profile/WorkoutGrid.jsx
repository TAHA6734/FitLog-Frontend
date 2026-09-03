import { motion } from 'framer-motion';

const TYPE_LABELS = {
0: { label: 'Koşu', emoji: '🏃' },
1: { label: 'Ağırlık', emoji: '🏋️' },
2: { label: 'Yüzme', emoji: '🏊' },
3: { label: 'Bisiklet', emoji: '🚴' },
4: { label: 'Yoga', emoji: '🧘' },
5: { label: 'Diğer', emoji: '⚡' },
};

function WorkoutGrid({ workouts, onWorkoutClick }) {
if (workouts.length === 0) {
return (
<div className="text-center py-16 text-slate-500">
<p className="text-sm">Henüz antrenman paylaşılmamış.</p>
</div>
);
}

return (
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
{workouts.map((workout, i) => {
const typeInfo = TYPE_LABELS[workout.type] || TYPE_LABELS[5];

return (
<motion.div
key={workout.id}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.03 }}
onClick={() => onWorkoutClick?.(workout.id)}
className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-800"
>
{workout.photoUrl ? (
<img
src={workout.photoUrl}
alt=""
className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
/>
) : (
<div className="w-full h-full bg-slate-900 flex items-center justify-center text-5xl">
{typeInfo.emoji}
</div>
)}

<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

<div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
<p className="text-white text-sm font-semibold">{typeInfo.emoji} {typeInfo.label}</p>
{workout.distance && (
<p className="text-slate-300 text-xs">{workout.distance} km</p>
)}
</div>

<div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
❤️ {workout.likeCount ?? 0}
</div>
</motion.div>
);
})}
</div>
);
}

export default WorkoutGrid;




