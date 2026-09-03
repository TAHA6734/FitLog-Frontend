import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import WorkoutCard from '../components/feed/WorkoutCard';
import RepostCard from '../components/feed/RepostCard';
import CreateWorkoutModal from '../components/feed/CreateWorkoutModel';
import TemplatePickerModal from '../components/feed/TemplatePickerModal';
import CreateWorkoutTemplateModal from '../components/feed/CreateWorkoutTemplateModal';
import LeaderboardWidget from '../components/feed/LeaderboardWidget';
import WorkoutPartnersWidget from '../components/feed/WorkoutPartnersWidget';
import SearchWidget from '../components/feed/SearchWidget';
import SubscribeWidget from '../components/feed/SubscribeWidget';
import StoriesBar from '../components/stories/StoriesBar';
import { SkeletonWorkoutCard } from '../components/ui/Skeleton';
import { feedApi } from '../api/feedApi';

const SORT_TABS = [
{ key: 'chronological', label: 'En Yeni' },
{ key: 'engagement', label: 'Popüler' },
];

function FeedPage() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState('chronological');
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [modalOpen, setModalOpen] = useState(false);
const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
const [createTemplateOpen, setCreateTemplateOpen] = useState(false);

const loadFeed = useCallback(async (currentPage, sort, append = false) => {
try {
const res = await feedApi.getFeed(currentPage, 10, sort);
setItems((prev) => (append ? [...prev, ...res.data] : res.data));
setHasMore(res.data.length === 10);
} catch {
toast.error('Feed yüklenemedi.');
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
setLoading(true);
setPage(1);
loadFeed(1, sortBy, false);
}, [sortBy]);

const handleLoadMore = () => {
const nextPage = page + 1;
setPage(nextPage);
loadFeed(nextPage, sortBy, true);
};

const handleWorkoutCreated = () => {
setPage(1);
loadFeed(1, sortBy, false);
};

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
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
<div className="flex items-center justify-between gap-2">
<h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 shrink-0">
<span className="text-emerald-400">⚡</span>
<span className="hidden sm:inline">Ana Sayfa</span>
</h1>
<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
<div className="relative flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-xs sm:text-sm shrink-0">
{SORT_TABS.map((tab) => (
<button
key={tab.key}
onClick={() => setSortBy(tab.key)}
className="relative px-2.5 sm:px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap"
>
{sortBy === tab.key && (
<motion.span
layoutId="feedSortPill"
className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
transition={{ type: 'spring', stiffness: 500, damping: 32 }}
/>
)}
<span className={`relative z-10 ${sortBy === tab.key ? 'text-slate-950' : 'text-slate-400'}`}>
{tab.label}
</span>
</button>
))}
</div>

<motion.button
whileHover={{ scale: 1.06 }}
whileTap={{ scale: 0.94 }}
onClick={() => setTemplatePickerOpen(true)}
className="text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 rounded-full p-2 transition-colors shrink-0"
title="Şablondan paylaş"
>
<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>
</motion.button>

<motion.button
whileHover={{ scale: 1.06 }}
whileTap={{ scale: 0.94 }}
onClick={() => setModalOpen(true)}
className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-2 transition-colors shadow-[0_0_16px_rgba(16,185,129,0.35)] shrink-0"
title="Antrenman paylaş"
>
<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
</motion.button>
</div>
</div>
</div>

<StoriesBar />

{loading ? (
<div>
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
</div>
) : items.length === 0 ? (
<div className="flex flex-col items-center justify-center py-20 px-6 text-center">
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center mb-4">
<span className="text-3xl">🏁</span>
</div>
<p className="text-slate-300 font-semibold">Feed'in henüz boş</p>
<p className="text-slate-500 text-sm mt-1 max-w-xs">
Birilerini takip et veya kendi antrenmanını paylaşarak akışını canlandır.
</p>
<motion.button
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
onClick={() => setModalOpen(true)}
className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-full px-5 py-2.5 transition shadow-[0_0_16px_rgba(16,185,129,0.35)]"
>
İlk Antrenmanını Paylaş
</motion.button>
</div>
) : (
<>
<AnimatePresence initial={false}>
{items.map((item, i) => (
<motion.div
key={item.type === 'repost' ? `repost-${item.repost.id}` : `workout-${item.workout.id}`}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25, delay: Math.min(i % 10, 6) * 0.035 }}
>
{item.type === 'repost' ? (
<RepostCard repost={item.repost} />
) : (
<WorkoutCard workout={item.workout} />
)}
</motion.div>
))}
</AnimatePresence>

{hasMore && (
<div className="flex justify-center py-6">
<button
onClick={handleLoadMore}
className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-full px-5 py-2 transition-colors"
>
Daha fazla yükle
</button>
</div>
)}
</>
)}

<CreateWorkoutModal
isOpen={modalOpen}
onClose={() => setModalOpen(false)}
onCreated={handleWorkoutCreated}
/>

<TemplatePickerModal
isOpen={templatePickerOpen}
onClose={() => setTemplatePickerOpen(false)}
onUsed={handleWorkoutCreated}
onCreateNew={() => { setTemplatePickerOpen(false); setCreateTemplateOpen(true); }}
/>

<CreateWorkoutTemplateModal
isOpen={createTemplateOpen}
onClose={() => setCreateTemplateOpen(false)}
onCreated={() => setTemplatePickerOpen(true)}
/>
</PageLayout>
);
}

export default FeedPage;
