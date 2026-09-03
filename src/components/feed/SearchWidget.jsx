import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import { groupApi } from '../../api/groupApi';

function SearchWidget() {
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [open, setOpen] = useState(false);
const navigate = useNavigate();
const wrapperRef = useRef(null);

useEffect(() => {
function handleClickOutside(e) {
if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
setOpen(false);
}
}
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

useEffect(() => {
if (!query.trim()) {
setResults([]);
return;
}

setLoading(true);
const timeout = setTimeout(async () => {
try {
const [userRes, groupRes] = await Promise.all([
userApi.search(query.trim()),
groupApi.search(query.trim()),
]);

const users = (userRes.data || []).slice(0, 4).map((u) => ({
id: u.id, displayName: u.username, photoUrl: u.profilePhotoUrl, _type: 'user',
}));
const groups = (groupRes.data || []).slice(0, 3).map((g) => ({
id: g.id, displayName: g.name, photoUrl: g.photoUrl, memberCount: g.memberCount, _type: 'group',
}));

setResults([...users, ...groups]);
} catch {
toast.error('Arama yapılamadı.');
} finally {
setLoading(false);
}
}, 300);

return () => clearTimeout(timeout);
}, [query]);

const handleSubmit = (e) => {
e.preventDefault();
setOpen(false);
navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
};

const handleResultClick = (item) => {
setOpen(false);
setQuery('');
if (item._type === 'user') navigate(`/profile/${item.id}`);
else navigate(`/groups/${item.id}`);
};

return (
<div ref={wrapperRef} className="relative">
<form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 backdrop-blur-sm">
<div className="relative group">
<svg className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
<input
type="text"
value={query}
onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
onFocus={() => query.trim() && setOpen(true)}
placeholder="FitLog'da ara..."
className="w-full bg-slate-800/70 border border-slate-700 rounded-full pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
/>
</div>
</form>

{open && query.trim() && (
<div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30">
{loading ? (
<p className="text-slate-500 text-xs text-center py-4">Aranıyor...</p>
) : results.length === 0 ? (
<p className="text-slate-500 text-xs text-center py-4">Sonuç bulunamadı.</p>
) : (
<>
<div className="max-h-72 overflow-y-auto">
{results.map((item) => (
<div
key={`${item._type}-${item.id}`}
onClick={() => handleResultClick(item)}
className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-800/60 cursor-pointer transition-colors"
>
<div className={`w-8 h-8 flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0 ${
item._type === 'user'
? 'rounded-full bg-emerald-500/20 text-emerald-400'
: 'rounded-lg bg-blue-500/20 text-blue-400'
}`}>
{item.photoUrl ? (
<img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
) : (
item.displayName?.[0]?.toUpperCase()
)}
</div>
<div className="min-w-0 flex-1">
<p className="text-xs text-white truncate font-medium">{item.displayName}</p>
{item._type === 'group' && (
<p className="text-[10px] text-slate-500">{item.memberCount} üye</p>
)}
</div>
</div>
))}
</div>
<button
onClick={handleSubmit}
className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 font-medium py-2.5 border-t border-slate-800 transition"
>
"{query}" için tüm sonuçları gör →
</button>
</>
)}
</div>
)}
</div>
);
}

export default SearchWidget;

