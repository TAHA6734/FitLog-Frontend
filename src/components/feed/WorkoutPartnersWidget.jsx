import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userApi, followApi } from '../../api/userApi';

function WorkoutPartnersWidget() {
const [partners, setPartners] = useState([]);
const [loading, setLoading] = useState(true);
const [followedIds, setFollowedIds] = useState(new Set());
const navigate = useNavigate();

useEffect(() => {
userApi.getWorkoutPartners()
.then((res) => setPartners(res.data.slice(0, 4)))
.catch(() => {})
.finally(() => setLoading(false));
}, []);

const handleFollow = async (userId, e) => {
e.stopPropagation();
try {
await followApi.follow(userId);
setFollowedIds((prev) => new Set(prev).add(userId));
toast.success('Takip edildi!');
} catch {
toast.error('Bir hata oluştu.');
}
};

return (
<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
<h3 className="text-white font-bold text-sm mb-3 flex items-center gap-1.5">
<span className="text-emerald-400">🤝</span> Antrenman Ortakları
</h3>

{loading ? (
<div className="space-y-3">
{[1, 2].map((i) => (
<div key={i} className="flex items-center gap-2.5 animate-pulse">
<div className="w-9 h-9 bg-slate-800 rounded-full" />
<div className="flex-1 space-y-1.5">
<div className="h-3 w-24 bg-slate-800 rounded" />
<div className="h-2.5 w-16 bg-slate-800 rounded" />
</div>
<div className="h-6 w-16 bg-slate-800 rounded-full" />
</div>
))}
</div>
) : partners.length === 0 ? (
<div className="text-center py-4">
<span className="text-2xl block mb-1.5">🔍</span>
<p className="text-xs text-slate-500">Henüz eşleşen bir antrenman ortağı bulunamadı.</p>
<button
onClick={() => navigate('/search')}
className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2"
>
Kullanıcı ara →
</button>
</div>
) : (
<div className="space-y-3">
{partners.map((partner) => (
<div
key={partner.userId}
onClick={() => navigate(`/profile/${partner.userId}`)}
className="flex items-center gap-2.5 cursor-pointer"
>
<div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-semibold shrink-0 overflow-hidden">
{partner.profilePhotoUrl ? (
<img src={partner.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
partner.username?.[0]?.toUpperCase()
)}
</div>
<div className="flex-1 min-w-0">
<p className="text-sm text-white truncate font-medium">{partner.username}</p>
<p className="text-xs text-slate-500">{partner.city}</p>
</div>
{!followedIds.has(partner.userId) ? (
<button
onClick={(e) => handleFollow(partner.userId, e)}
className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-full px-3 py-1 shrink-0 transition-colors"
>
Takip Et
</button>
) : (
<span className="text-xs text-slate-500 shrink-0">Takip edildi</span>
)}
</div>
))}
</div>
)}
</div>
);
}

export default WorkoutPartnersWidget;










