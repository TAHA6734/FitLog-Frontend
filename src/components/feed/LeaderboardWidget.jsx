import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../../api/userApi';

function LeaderboardWidget() {
const [entries, setEntries] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
leaderboardApi.getDistance()
.then((res) => setEntries(res.data.slice(0, 5)))
.catch(() => {})
.finally(() => setLoading(false));
}, []);

return (
<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
<div className="flex items-center justify-between mb-3">
<h3 className="text-white font-bold text-sm flex items-center gap-1.5">
<span className="text-yellow-400">🏆</span> Haftalık Liderlik
</h3>
<button
onClick={() => navigate('/leaderboard')}
className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
>
Tümü
</button>
</div>

{loading ? (
<div className="space-y-2.5">
{[1, 2, 3].map((i) => (
<div key={i} className="flex items-center gap-2.5 animate-pulse">
<div className="w-5 h-4 bg-slate-800 rounded" />
<div className="w-7 h-7 bg-slate-800 rounded-full" />
<div className="h-3.5 flex-1 bg-slate-800 rounded" />
<div className="h-3 w-10 bg-slate-800 rounded" />
</div>
))}
</div>
) : entries.length === 0 ? (
<div className="text-center py-4">
<span className="text-2xl block mb-1.5">⚡</span>
<p className="text-xs text-slate-500">Bu hafta henüz kimse antrenman paylaşmadı.</p>
<button
onClick={() => navigate('/feed')}
className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2"
>
İlk sen ol →
</button>
</div>
) : (
<div className="space-y-2.5">
{entries.map((entry, i) => {
const medalColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
return (
<div
key={entry.userId}
onClick={() => navigate(`/profile/${entry.userId}`)}
className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
>
<span className={`w-5 text-sm font-bold text-center ${medalColors[i] || 'text-slate-500'}`}>
{i + 1}
</span>
<div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold shrink-0 overflow-hidden">
{entry.profilePhotoUrl ? (
<img src={entry.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
entry.username?.[0]?.toUpperCase()
)}
</div>
<span className="text-sm text-slate-200 flex-1 truncate font-medium">{entry.username}</span>
<span className="text-xs text-emerald-400 font-semibold">{entry.value.toFixed(1)} km</span>
</div>
);
})}
</div>
)}
</div>
);
}

export default LeaderboardWidget;









