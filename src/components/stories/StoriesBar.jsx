import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storyApi } from '../../api/storyApi';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';

function StoryCircleSkeleton() {
return (
<div className="flex flex-col items-center gap-1.5 shrink-0 w-16">
<div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse" />
<div className="h-2.5 w-10 bg-slate-800 rounded animate-pulse" />
</div>
);
}

function getSeenKey(userId) {
return `fitlog_own_story_seen_${userId || 'guest'}`;
}

function loadSeenOwnStoryIds(userId) {
try {
const raw = localStorage.getItem(getSeenKey(userId));
return raw ? new Set(JSON.parse(raw)) : new Set();
} catch {
return new Set();
}
}

function saveSeenOwnStoryIds(userId, idsSet) {
localStorage.setItem(getSeenKey(userId), JSON.stringify(Array.from(idsSet)));
}

function StoriesBar() {
const [groups, setGroups] = useState([]);
const [loading, setLoading] = useState(true);
const [createOpen, setCreateOpen] = useState(false);
const [viewerStartIndex, setViewerStartIndex] = useState(null);
const [seenOwnIds, setSeenOwnIds] = useState(new Set());
const { user } = useAuth();

const scrollRef = useRef(null);
const isDraggingRef = useRef(false);
const dragStartXRef = useRef(0);
const dragScrollLeftRef = useRef(0);

useEffect(() => {
setSeenOwnIds(loadSeenOwnStoryIds(user?.userId));
}, [user?.userId]);

const loadStories = useCallback(() => {
storyApi.getFeed()
.then((res) => setGroups(res.data))
.catch(() => {})
.finally(() => setLoading(false));
}, []);

useEffect(() => {
loadStories();
}, [loadStories]);

const handleWheel = (e) => {
if (e.deltaY === 0) return;
e.currentTarget.scrollLeft += e.deltaY;
};

const handleMouseDown = (e) => {
isDraggingRef.current = true;
dragStartXRef.current = e.pageX;
dragScrollLeftRef.current = scrollRef.current.scrollLeft;
};

const handleMouseMove = (e) => {
if (!isDraggingRef.current) return;
e.preventDefault();
const delta = e.pageX - dragStartXRef.current;
scrollRef.current.scrollLeft = dragScrollLeftRef.current - delta;
};

const stopDragging = () => {
isDraggingRef.current = false;
};

const ownGroup = groups.find((g) => g.isOwn);
const otherGroups = groups.filter((g) => !g.isOwn);

const ownAllSeen = ownGroup
? ownGroup.stories.every((s) => seenOwnIds.has(s.id))
: false;

const handleMarkOwnStorySeen = (storyId) => {
setSeenOwnIds((prev) => {
if (prev.has(storyId)) return prev;
const next = new Set(prev);
next.add(storyId);
saveSeenOwnStoryIds(user?.userId, next);
return next;
});
};

const handleOwnClick = () => {
if (ownGroup) {
setViewerStartIndex(groups.indexOf(ownGroup));
} else {
setCreateOpen(true);
}
};

const handleAddClick = (e) => {
e.stopPropagation();
setCreateOpen(true);
};

const handleViewerClose = () => {
setViewerStartIndex(null);
loadStories();
};

if (loading) {
return (
<div className="flex gap-3 px-4 py-4 overflow-x-auto border-b border-slate-800 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
{[1, 2, 3, 4].map((i) => <StoryCircleSkeleton key={i} />)}
</div>
);
}

return (
<>
<div
ref={scrollRef}
onWheel={handleWheel}
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={stopDragging}
onMouseLeave={stopDragging}
className="flex gap-3 px-4 py-4 overflow-x-auto border-b border-slate-800 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
>
<div className="flex flex-col items-center gap-1.5 shrink-0 w-16 cursor-pointer" onClick={handleOwnClick}>
<div className={`relative w-16 h-16 rounded-full p-[2px] ${
ownGroup
? (ownAllSeen ? 'bg-slate-700' : 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600')
: 'bg-slate-800'
}`}>
<div className="w-full h-full rounded-full bg-slate-950 p-[2px]">
<div className="w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden">
{user?.profilePhotoUrl ? (
<img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" draggable={false} />
) : (
user?.username?.[0]?.toUpperCase()
)}
</div>
</div>
<button
onClick={handleAddClick}
className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-1 border-2 border-slate-950 transition"
>
<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
</button>
</div>
<span className="text-[11px] text-slate-400 truncate w-full text-center">Hikayen</span>
</div>

{otherGroups.map((group) => (
<div
key={group.userId}
onClick={() => setViewerStartIndex(groups.indexOf(group))}
className="flex flex-col items-center gap-1.5 shrink-0 w-16 cursor-pointer"
>
<div className={`w-16 h-16 rounded-full p-[2px] ${
group.hasUnseenStory ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600' : 'bg-slate-700'
}`}>
<div className="w-full h-full rounded-full bg-slate-950 p-[2px]">
<div className="w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden">
{group.profilePhotoUrl ? (
<img src={group.profilePhotoUrl} alt="" className="w-full h-full object-cover" draggable={false} />
) : (
group.username?.[0]?.toUpperCase()
)}
</div>
</div>
</div>
<span className="text-[11px] text-slate-400 truncate w-full text-center">{group.username}</span>
</div>
))}
</div>

<CreateStoryModal
isOpen={createOpen}
onClose={() => setCreateOpen(false)}
onCreated={loadStories}
/>

{viewerStartIndex !== null && (
<StoryViewer
groups={groups}
startGroupIndex={viewerStartIndex}
onClose={handleViewerClose}
onViewOwnStory={handleMarkOwnStorySeen}
/>
)}
</>
);
}

export default StoriesBar;
