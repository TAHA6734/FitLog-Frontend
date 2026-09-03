import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import WorkoutCard from '../components/feed/WorkoutCard';
import AchievementsTab from '../components/achievements/AchievementsTab';
import { SkeletonWorkoutCard } from '../components/ui/Skeleton';
import { activityApi } from '../api/activityApi';

const TABS = [
{ key: 'liked', label: 'Beğenilenler', shortLabel: 'Beğeniler', emoji: '❤️' },
{ key: 'saved', label: 'Kaydedilenler', shortLabel: 'Kayıtlar', emoji: '🔖' },
{ key: 'commented', label: 'Yorum Yaptıkların', shortLabel: 'Yorumlar', emoji: '💬' },
{ key: 'achievements', label: 'Başarımlar', shortLabel: 'Başarımlar', emoji: '🏆' },
];

function ActivityPage() {
const [searchParams, setSearchParams] = useSearchParams();
const initialTab = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(
TABS.some((t) => t.key === initialTab) ? initialTab : 'liked'
);
const [workouts, setWorkouts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const tabFromUrl = searchParams.get('tab');
if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl) && tabFromUrl !== activeTab) {
setActiveTab(tabFromUrl);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

useEffect(() => {
if (activeTab === 'achievements') return;

setLoading(true);
const fetchers = {
liked: activityApi.getLiked,
saved: activityApi.getSaved,
commented: activityApi.getCommented,
};

fetchers[activeTab]()
.then((res) => setWorkouts(res.data))
.catch(() => toast.error('Yüklenemedi.'))
.finally(() => setLoading(false));
}, [activeTab]);

const handleTabChange = (key) => {
setActiveTab(key);
setSearchParams({ tab: key });
};

const emptyMessages = {
liked: { emoji: '❤️', text: 'Henüz hiçbir antrenman beğenmedin.' },
saved: { emoji: '🔖', text: 'Henüz hiçbir antrenman kaydetmedin.' },
commented: { emoji: '💬', text: 'Henüz hiçbir antrenmana yorum yapmadın.' },
};

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
<h1 className="text-lg font-bold text-white mb-3 flex items-center gap-1.5">
<span className="text-emerald-400">📋</span>
<span className="hidden xs:inline">Hesap Hareketleri</span>
<span className="xs:hidden">Hareketler</span>
</h1>
<div className="relative flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-xs sm:text-sm w-full overflow-x-auto">
{TABS.map((tab) => (
<button
key={tab.key}
onClick={() => handleTabChange(tab.key)}
className="relative px-3 sm:px-4 py-1.5 rounded-full font-medium whitespace-nowrap shrink-0"
>
{activeTab === tab.key && (
<motion.span
layoutId="activityTabPill"
className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
transition={{ type: 'spring', stiffness: 500, damping: 32 }}
/>
)}
<span className={`relative z-10 flex items-center gap-1.5 ${activeTab === tab.key ? 'text-slate-950' : 'text-slate-400'}`}>
<span>{tab.emoji}</span>
<span className="hidden sm:inline">{tab.label}</span>
<span className="sm:hidden">{tab.shortLabel}</span>
</span>
</button>
))}
</div>
</div>

{activeTab === 'achievements' ? (
<AchievementsTab />
) : loading ? (
<div>
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
</div>
) : workouts.length === 0 ? (
<div className="text-center py-16">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4">
<span className="text-3xl">{emptyMessages[activeTab].emoji}</span>
</div>
<p className="text-slate-500 text-sm">{emptyMessages[activeTab].text}</p>
</div>
) : (
<div>
{workouts.map((w) => (
<WorkoutCard key={w.id} workout={w} />
))}
</div>
)}
</PageLayout>
);
}

export default ActivityPage;

