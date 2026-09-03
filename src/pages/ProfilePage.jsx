import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import StatsChart from '../components/profile/StatsChart';
import WorkoutCard from '../components/feed/WorkoutCard';
import RepostCard from '../components/feed/RepostCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import LeaderboardWidget from '../components/feed/LeaderboardWidget';
import WorkoutPartnersWidget from '../components/feed/WorkoutPartnersWidget';
import SearchWidget from '../components/feed/SearchWidget';
import SubscribeWidget from '../components/feed/SubscribeWidget';
import { SkeletonProfileHeader, SkeletonWorkoutCard, SkeletonBox } from '../components/ui/Skeleton';
import { userApi } from '../api/userApi';
import { feedApi } from '../api/feedApi';
import { activityApi } from '../api/activityApi';
import { useAuth } from '../context/AuthContext';

const TABS = [
{ key: 'posts', label: 'Gönderiler' },
{ key: 'replies', label: 'Yorumlar' },
{ key: 'reposts', label: 'Repostlar' },
{ key: 'media', label: 'Medya' },
];

function ProfilePage() {
const { userId } = useParams();
const { user: currentUser, updateUser } = useAuth();
const navigate = useNavigate();

const [profile, setProfile] = useState(null);
const [timeline, setTimeline] = useState([]);
const [loading, setLoading] = useState(true);
const [editModalOpen, setEditModalOpen] = useState(false);

const [activeTab, setActiveTab] = useState('posts');
const [replies, setReplies] = useState([]);
const [repliesLoaded, setRepliesLoaded] = useState(false);
const [repliesLoading, setRepliesLoading] = useState(false);

const isOwnProfile = currentUser?.userId === userId;

const loadProfile = async () => {
setLoading(true);
try {
const res = await userApi.getProfile(userId);
setProfile(res.data);

if (isOwnProfile) {
updateUser({ username: res.data.username, profilePhotoUrl: res.data.profilePhotoUrl, isPremium: res.data.isPremium });
}

const timelineRes = await feedApi.getUserTimeline(userId);
setTimeline(timelineRes.data);
} catch (err) {
toast.error('Profil yüklenemedi.');
} finally {
setLoading(false);
}
};

useEffect(() => {
loadProfile();
setActiveTab('posts');
setReplies([]);
setRepliesLoaded(false);
}, [userId]);

useEffect(() => {
if (activeTab !== 'replies' || repliesLoaded) return;

setRepliesLoading(true);
activityApi.getCommentedForUser(userId)
.then((res) => setReplies(res.data))
.catch(() => toast.error('Yorumlar yüklenemedi.'))
.finally(() => {
setRepliesLoading(false);
setRepliesLoaded(true);
});
}, [activeTab, userId, repliesLoaded]);

const sidePanel = (
<div className="space-y-4">
<SearchWidget />
<SubscribeWidget />
<LeaderboardWidget />
<WorkoutPartnersWidget />
</div>
);

if (loading) {
return (
<PageLayout rightPanel={sidePanel}>
<SkeletonProfileHeader />
<div className="border-b border-slate-800 px-6 py-6">
<SkeletonBox className="h-4 w-40 mb-4" />
<SkeletonBox className="h-48 w-full rounded-xl" />
</div>
<div>
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
</div>
</PageLayout>
);
}

if (!profile) {
return (
<PageLayout rightPanel={sidePanel}>
<div className="flex items-center justify-center h-64">
<p className="text-slate-500">Profil bulunamadı.</p>
</div>
</PageLayout>
);
}

const canViewContent = isOwnProfile || !profile.isPrivate || profile.followStatus === 'accepted';
const workoutsOnly = timeline.filter((i) => i.type === 'workout').map((i) => i.workout);
const repostsOnly = timeline.filter((i) => i.type === 'repost');
const mediaWorkouts = workoutsOnly.filter((w) => w.photoUrl || w.videoUrl);

const renderTabContent = () => {
if (!canViewContent) {
return (
<div className="text-center py-16 text-slate-500 text-sm">
🔒 Bu hesap gizli. İçerikleri görmek için takip etmelisin.
</div>
);
}

if (activeTab === 'posts') {
return timeline.length === 0 ? (
<div className="text-center py-16 text-slate-500 text-sm">Henüz bir gönderi yok.</div>
) : (
timeline.map((item) =>
item.type === 'repost' ? (
<RepostCard key={`repost-${item.repost.id}`} repost={item.repost} />
) : (
<WorkoutCard key={`workout-${item.workout.id}`} workout={item.workout} />
)
)
);
}

if (activeTab === 'replies') {
if (repliesLoading) {
return (
<div>
<SkeletonWorkoutCard />
<SkeletonWorkoutCard />
</div>
);
}
return replies.length === 0 ? (
<div className="text-center py-16 text-slate-500 text-sm">
💬 Henüz hiçbir antrenmana yorum yapmamış.
</div>
) : (
replies.map((w) => <WorkoutCard key={`reply-${w.id}`} workout={w} />)
);
}

if (activeTab === 'reposts') {
return repostsOnly.length === 0 ? (
<div className="text-center py-16 text-slate-500 text-sm">
🔁 Henüz hiçbir şey paylaşmamış.
</div>
) : (
repostsOnly.map((item) => <RepostCard key={`repost-tab-${item.repost.id}`} repost={item.repost} />)
);
}

if (activeTab === 'media') {
return mediaWorkouts.length === 0 ? (
<div className="text-center py-16 text-slate-500 text-sm">
🖼️ Henüz fotoğraf/video paylaşmamış.
</div>
) : (
<div className="grid grid-cols-3 gap-0.5 p-0.5">
{mediaWorkouts.map((w) => (
<div
key={`media-${w.id}`}
onClick={() => navigate(`/workout/${w.id}`)}
className="relative aspect-square bg-slate-900 cursor-pointer group overflow-hidden"
>
{w.photoUrl ? (
<img src={w.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
) : (
<>
<video src={w.videoUrl} className="w-full h-full object-cover" />
<div className="absolute inset-0 flex items-center justify-center bg-black/20">
<svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
<path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
</svg>
</div>
</>
)}
<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
</div>
))}
</div>
);
}

return null;
};

return (
<PageLayout rightPanel={sidePanel}>
<ProfileHeader
profile={profile}
isOwnProfile={isOwnProfile}
followStatus={profile.followStatus}
onFollowChange={loadProfile}
onEditClick={() => setEditModalOpen(true)}
/>

{profile.canViewStats && (
<div className="border-b border-slate-800 px-6 py-6">
<h3 className="text-white font-semibold mb-4 flex items-center gap-1.5">
<span className="text-emerald-400">📈</span> Son 7 Antrenman - Mesafe
</h3>
<StatsChart workouts={workoutsOnly} />
</div>
)}

{!profile.canViewStats && (
<div className="border-b border-slate-800 px-6 py-6 text-center text-slate-500 text-sm">
🔒 Bu kullanıcının istatistikleri gizli.
</div>
)}

<ProfileTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

<div>{renderTabContent()}</div>

{profile && (
<EditProfileModal
isOpen={editModalOpen}
onClose={() => setEditModalOpen(false)}
profile={profile}
onUpdated={loadProfile}
/>
)}
</PageLayout>
);
}

export default ProfilePage;






