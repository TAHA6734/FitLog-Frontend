import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import LeaderboardWidget from '../components/feed/LeaderboardWidget';
import WorkoutPartnersWidget from '../components/feed/WorkoutPartnersWidget';
import SearchWidget from '../components/feed/SearchWidget';
import SubscribeWidget from '../components/feed/SubscribeWidget';
import { SkeletonBox } from '../components/ui/Skeleton';
import { groupApi } from '../api/groupApi';

function GroupCardSkeleton() {
return (
<div className="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
<SkeletonBox className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
<div className="flex-1 space-y-2">
<SkeletonBox className="h-3.5 w-32" />
<SkeletonBox className="h-3 w-48" />
</div>
<SkeletonBox className="h-3 w-10" />
</div>
);
}

function PeopleIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
</svg>
);
}

function GroupsPage() {
const [groups, setGroups] = useState([]);
const [loading, setLoading] = useState(true);
const [modalOpen, setModalOpen] = useState(false);
const navigate = useNavigate();

const loadGroups = async () => {
setLoading(true);
try {
const res = await groupApi.getMyGroups();
setGroups(res.data);
} catch {
toast.error('Gruplar yüklenemedi.');
} finally {
setLoading(false);
}
};

useEffect(() => {
loadGroups();
}, []);

return (
<PageLayout
rightPanel={
<div className="space-y-4">
<SearchWidget />
<SubscribeWidget />
<LeaderboardWidget />
<WorkoutPartnersWidget />
</div>
}
>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10 flex items-center justify-between">
<h1 className="text-lg font-bold text-white flex items-center gap-1.5">
<span className="text-emerald-400">👥</span> Gruplar
</h1>
<button
onClick={() => setModalOpen(true)}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-2 transition shadow-[0_0_16px_rgba(16,185,129,0.35)]"
title="Yeni grup oluştur"
>
<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
</button>
</div>

<div className="p-3 sm:p-4">
{loading ? (
<div className="space-y-2">
<GroupCardSkeleton />
<GroupCardSkeleton />
<GroupCardSkeleton />
</div>
) : groups.length === 0 ? (
<div className="text-center py-16 px-6">
<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/5 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
<span className="text-2xl sm:text-3xl">👥</span>
</div>
<p className="text-slate-300 font-semibold text-sm sm:text-base">Henüz bir gruba katılmadın</p>
<p className="text-slate-500 text-xs sm:text-sm mt-1">Yeni bir grup oluştur veya birine katıl.</p>
<button
onClick={() => setModalOpen(true)}
className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transition shadow-[0_0_16px_rgba(16,185,129,0.35)]"
>
İlk Grubunu Oluştur
</button>
</div>
) : (
<div className="space-y-2">
{groups.map((g) => (
<div
key={g.id}
onClick={() => navigate(`/groups/${g.id}`)}
className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/30 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
>
<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-base sm:text-lg shrink-0">
{g.name?.[0]?.toUpperCase()}
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-semibold text-white truncate">{g.name}</p>
<p className="text-xs text-slate-500 truncate">{g.description || 'Açıklama yok'}</p>
</div>
<div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
<PeopleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
{g.memberCount}
</div>
</div>
))}
</div>
)}
</div>

<CreateGroupModal
isOpen={modalOpen}
onClose={() => setModalOpen(false)}
onCreated={loadGroups}
/>
</PageLayout>
);
}

export default GroupsPage;
