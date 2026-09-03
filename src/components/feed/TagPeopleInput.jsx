import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { followApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const MAX_TAGS = 10;

function TagPeopleInput({ value, onChange }) {
const [open, setOpen] = useState(false);
const [following, setFollowing] = useState([]);
const [loading, setLoading] = useState(false);
const [loaded, setLoaded] = useState(false);
const [search, setSearch] = useState('');
const { user } = useAuth();
const wrapperRef = useRef(null);
const searchInputRef = useRef(null);

useEffect(() => {
function handleClickOutside(e) {
if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
setOpen(false);
}
}
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const handleOpen = () => {
setOpen(true);
setTimeout(() => searchInputRef.current?.focus(), 50);

if (!loaded && user?.userId) {
setLoading(true);
followApi.getFollowing(user.userId)
.then((res) => setFollowing(res.data))
.catch(() => toast.error('Takip listesi yüklenemedi.'))
.finally(() => { setLoading(false); setLoaded(true); });
}
};

const selectedIds = new Set(value.map((u) => u.id));

const filtered = following.filter((u) =>
!selectedIds.has(u.id) &&
u.username.toLowerCase().includes(search.toLowerCase())
);

const handleSelect = (person) => {
if (value.length >= MAX_TAGS) {
toast.error(`En fazla ${MAX_TAGS} kişi etiketleyebilirsin.`);
return;
}
onChange([...value, person]);
setSearch('');
};

const handleRemove = (id) => {
onChange(value.filter((u) => u.id !== id));
};

return (
<div ref={wrapperRef} className="relative">
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
Kişileri Etiketle <span className="text-slate-600 normal-case">(opsiyonel, sadece takip ettiklerin)</span>
</label>

{value.length > 0 && (
<div className="flex flex-wrap gap-1.5 mb-2">
{value.map((u) => (
<span
key={u.id}
className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-full pl-1 pr-2 py-1"
>
<span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] overflow-hidden shrink-0">
{u.profilePhotoUrl ? (
<img src={u.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
u.username?.[0]?.toUpperCase()
)}
</span>
@{u.username}
<button
type="button"
onClick={() => handleRemove(u.id)}
className="text-emerald-400/70 hover:text-white transition"
>
<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</span>
))}
</div>
)}

{!open ? (
<button
type="button"
onClick={handleOpen}
className="w-full flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 hover:border-slate-600 transition-all text-left"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
Kişi ekle
</button>
) : (
<div className="bg-slate-800/60 border border-emerald-500/40 rounded-xl overflow-hidden">
<div className="p-2 border-b border-slate-700/60">
<input
ref={searchInputRef}
type="text"
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Takip ettiklerinde ara..."
className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
/>
</div>

<div className="max-h-48 overflow-y-auto">
{loading ? (
<p className="text-slate-500 text-xs text-center py-4">Yükleniyor...</p>
) : filtered.length === 0 ? (
<p className="text-slate-500 text-xs text-center py-4">
{following.length === 0 ? 'Henüz kimseyi takip etmiyorsun.' : 'Sonuç bulunamadı.'}
</p>
) : (
filtered.map((u) => (
<div
key={u.id}
onClick={() => handleSelect(u)}
className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-700/40 transition-colors"
>
<div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold overflow-hidden shrink-0">
{u.profilePhotoUrl ? (
<img src={u.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
u.username?.[0]?.toUpperCase()
)}
</div>
<span className="text-sm text-white">{u.username}</span>
</div>
))
)}
</div>
</div>
)}
</div>
);
}

export default TagPeopleInput;







