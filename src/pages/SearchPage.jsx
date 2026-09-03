import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import LeaderboardWidget from '../components/feed/LeaderboardWidget';
import WorkoutPartnersWidget from '../components/feed/WorkoutPartnersWidget';
import SearchWidget from '../components/feed/SearchWidget';
import SubscribeWidget from '../components/feed/SubscribeWidget';
import { SkeletonUserRow } from '../components/ui/Skeleton';
import { userApi } from '../api/userApi';
import { groupApi } from '../api/groupApi';
import { useAuth } from '../context/AuthContext';

const FILTER_TABS = [
{ key: 'all', label: 'Tümü' },
{ key: 'user', label: 'Kullanıcılar' },
{ key: 'group', label: 'Gruplar' },
];

const MAX_RECENT = 8;

function getRecentKey(userId) {
return `fitlog_recent_visits_${userId || 'guest'}`;
}

function loadRecentVisits(userId) {
try {
const raw = localStorage.getItem(getRecentKey(userId));
return raw ? JSON.parse(raw) : [];
} catch {
return [];
}
}

function saveRecentVisit(userId, item) {
const current = loadRecentVisits(userId).filter(
(r) => !(r._type === item._type && r.id === item.id)
);
const updated = [item, ...current].slice(0, MAX_RECENT);
localStorage.setItem(getRecentKey(userId), JSON.stringify(updated));
return updated;
}

function removeRecentVisit(userId, item) {
const updated = loadRecentVisits(userId).filter(
(r) => !(r._type === item._type && r.id === item.id)
);
localStorage.setItem(getRecentKey(userId), JSON.stringify(updated));
return updated;
}

function normalizeUser(u) {
return {
id: u.id ?? u.Id ?? u.userId ?? u.UserId,
displayName: u.username ?? u.Username ?? u.userName ?? u.UserName ?? 'Bilinmeyen',
photoUrl: u.profilePhotoUrl ?? u.ProfilePhotoUrl ?? null,
bio: u.bio ?? u.Bio ?? null,
_type: 'user',
};
}

function normalizeGroup(g) {
return {
id: g.id ?? g.Id,
displayName: g.name ?? g.Name ?? 'Bilinmeyen Grup',
photoUrl: g.photoUrl ?? g.PhotoUrl ?? null,
memberCount: g.memberCount ?? g.MemberCount ?? 0,
_type: 'group',
};
}

function UserIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
);
}

function GroupIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
</svg>
);
}

function SearchPage() {
const { user } = useAuth();
const [searchParams, setSearchParams] = useSearchParams();
const [query, setQuery] = useState(searchParams.get('q') || '');
const [allResults, setAllResults] = useState([]);
const [loading, setLoading] = useState(false);
const [typeFilter, setTypeFilter] = useState('all');
const [recentVisits, setRecentVisits] = useState([]);
const navigate = useNavigate();

useEffect(() => {
setRecentVisits(loadRecentVisits(user?.userId));
}, [user?.userId]);

useEffect(() => {
const urlQuery = searchParams.get('q');
if (urlQuery && urlQuery !== query) {
setQuery(urlQuery);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

useEffect(() => {
if (!query.trim()) {
setAllResults([]);
return;
}

setLoading(true);
const timeout = setTimeout(async () => {
try {
const [userRes, groupRes] = await Promise.all([
userApi.search(query.trim()),
groupApi.search(query.trim()),
]);

const userResults = (userRes.data || []).map(normalizeUser);
const groupResults = (groupRes.data || []).map(normalizeGroup);

setAllResults([...userResults, ...groupResults]);
} catch {
toast.error('Arama yapılamadı.');
setAllResults([]);
} finally {
setLoading(false);
}
}, 350);

return () => clearTimeout(timeout);
}, [query]);

const results = typeFilter === 'all' ? allResults : allResults.filter((r) => r._type === typeFilter);
const userCount = allResults.filter((r) => r._type === 'user').length;
const groupCount = allResults.filter((r) => r._type === 'group').length;

const handleClick = (item) => {
setRecentVisits(saveRecentVisit(user?.userId, item));
if (item._type === 'user') {
navigate(`/profile/${item.id}`);
} else {
navigate(`/groups/${item.id}`);
}
};

const handleRemoveRecent = (e, item) => {
e.stopPropagation();
setRecentVisits(removeRecentVisit(user?.userId, item));
};

return (
<PageLayout
rightPanel={
<div className="space-y-4">
<div className="hidden lg:block">
<SearchWidget />
</div>
<SubscribeWidget />
<LeaderboardWidget />
<WorkoutPartnersWidget />
</div>
}
>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
<h1 className="text-lg font-bold text-white mb-3 flex items-center gap-1.5">
<span className="text-emerald-400">🔎</span> Keşfet
</h1>
<div className="relative group mb-3">
<svg className="w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
<input
type="text"
value={query}
onChange={(e) => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
placeholder="Kullanıcı veya grup ara..."
className="w-full bg-slate-900/80 border border-slate-800 rounded-full pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
/>
{query && (
<button
onClick={() => { setQuery(''); setSearchParams({}); }}
className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
)}
</div>

{query.trim() && (
<div className="relative flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-xs sm:text-sm w-full sm:w-fit overflow-x-auto">
{FILTER_TABS.map((tab) => {
const count = tab.key === 'user' ? userCount : tab.key === 'group' ? groupCount : allResults.length;
return (
<button
key={tab.key}
onClick={() => setTypeFilter(tab.key)}
className="relative px-3 sm:px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap shrink-0"
>
{typeFilter === tab.key && (
<motion.span
layoutId="searchFilterPill"
className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
transition={{ type: 'spring', stiffness: 500, damping: 32 }}
/>
)}
<span className={`relative z-10 ${typeFilter === tab.key ? 'text-slate-950' : 'text-slate-400'}`}>
{tab.label} {count > 0 && <span className="opacity-70">({count})</span>}
</span>
</button>
);
})}
</div>
)}
</div>

<div className="p-3 sm:p-4">
{!query.trim() ? (
<div>
{recentVisits.length > 0 ? (
<div className="mb-6">
<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-1">Son Ziyaret Edilenler</p>
<div className="space-y-1">
{recentVisits.map((item) => (
<div
key={`${item._type}-${item.id}`}
onClick={() => handleClick(item)}
className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors group"
>
<div className={`w-9 h-9 flex items-center justify-center font-semibold overflow-hidden shrink-0 ${
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
<p className="text-sm text-white truncate font-medium">{item.displayName}</p>
<p className="text-[11px] text-slate-500">{item._type === 'user' ? 'Kullanıcı' : 'Grup'}</p>
</div>
<button
onClick={(e) => handleRemoveRecent(e, item)}
className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-slate-600 hover:text-white transition p-1 shrink-0"
>
<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
))}
</div>
</div>
) : (
<div className="flex flex-col items-center py-16 text-center">
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 flex items-center justify-center mb-3">
<span className="text-2xl">🧭</span>
</div>
<p className="text-slate-500 text-sm">Kullanıcı adı veya grup adı yaz.</p>
</div>
)}
</div>
) : loading ? (
<div className="space-y-2">
<SkeletonUserRow />
<SkeletonUserRow />
<SkeletonUserRow />
</div>
) : results.length === 0 ? (
<p className="text-slate-500 text-sm text-center py-10">Sonuç bulunamadı.</p>
) : (
<div className="space-y-2">
{results.map((item) => (
<div
key={`${item._type}-${item.id}`}
onClick={() => handleClick(item)}
className="flex items-center gap-3 px-3 sm:px-3.5 py-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all"
>
<div className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center font-bold overflow-hidden shrink-0 ${
item._type === 'user'
? 'rounded-full bg-gradient-to-br from-emerald-500/25 to-emerald-600/5 text-emerald-400 border border-emerald-500/20'
: 'rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-600/5 text-blue-400 border border-blue-500/20'
}`}>
{item.photoUrl ? (
<img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
) : (
item.displayName?.[0]?.toUpperCase()
)}
</div>
<div className="min-w-0 flex-1">
<p className="text-sm font-semibold text-white truncate">{item.displayName}</p>
{item._type === 'user' && item.bio && (
<p className="text-xs text-slate-500 truncate hidden sm:block">{item.bio}</p>
)}
{item._type === 'group' && (
<p className="text-xs text-slate-500 truncate">{item.memberCount} üye</p>
)}
</div>
<span className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
item._type === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
}`}>
{item._type === 'user' ? <UserIcon className="w-3 h-3" /> : <GroupIcon className="w-3 h-3" />}
{item._type === 'user' ? 'Kullanıcı' : 'Grup'}
</span>
<span className={`sm:hidden shrink-0 ${item._type === 'user' ? 'text-emerald-400' : 'text-blue-400'}`}>
{item._type === 'user' ? <UserIcon className="w-4 h-4" /> : <GroupIcon className="w-4 h-4" />}
</span>
</div>
))}
</div>
)}
</div>
</PageLayout>
);
}

export default SearchPage;
