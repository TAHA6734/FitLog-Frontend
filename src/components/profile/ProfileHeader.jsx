import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { followApi } from '../../api/userApi';
import { blockApi } from '../../api/blockApi';
import FollowListModal from './FollowListModal';
import PremiumBadge from '../ui/PremiumBadge';
import ImageLightbox from '../ui/ImageLightbox';
import { useConfirm } from '../../hooks/useConfirm';
import { COVER_THEMES, isGradientCover, getGradientKey } from '../../utils/coverThemes';

function StatItem({ label, value, onClick }) {
return (
<div className={`text-center ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
<p className="text-base sm:text-lg font-bold text-white">{value}</p>
<p className="text-[11px] sm:text-xs text-slate-400">{label}</p>
</div>
);
}

function ProfileHeader({ profile, isOwnProfile, followStatus, onFollowChange, onEditClick }) {
const [followLoading, setFollowLoading] = useState(false);
const [localStatus, setLocalStatus] = useState(followStatus);
const [listModal, setListModal] = useState(null);
const [isBlocked, setIsBlocked] = useState(false);
const [blockChecked, setBlockChecked] = useState(false);
const [blockActionLoading, setBlockActionLoading] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [avatarLightboxOpen, setAvatarLightboxOpen] = useState(false);
const menuRef = useRef(null);
const navigate = useNavigate();
const { confirm, ConfirmDialogElement } = useConfirm();

useEffect(() => {
if (isOwnProfile) {
setBlockChecked(true);
return;
}
blockApi.isBlocked(profile.id)
.then((res) => setIsBlocked(res.data.isBlocked))
.catch(() => {})
.finally(() => setBlockChecked(true));
}, [profile.id, isOwnProfile]);

useEffect(() => {
function handleClickOutside(e) {
if (menuRef.current && !menuRef.current.contains(e.target)) {
setMenuOpen(false);
}
}
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const hasPhoto = (url) => typeof url === 'string' && url.trim().length > 0;

const handleFollowToggle = async () => {
setFollowLoading(true);
try {
if (localStatus === 'accepted' || localStatus === 'pending') {
await followApi.unfollow(profile.id);
setLocalStatus('none');
toast.success(
localStatus === 'pending' ? 'Takip isteği geri çekildi.' : `${profile.username} artık takip edilmiyor.`
);
} else {
await followApi.follow(profile.id);
setLocalStatus(profile.isPrivate ? 'pending' : 'accepted');
toast.success(
profile.isPrivate ? 'Takip isteği gönderildi.' : `${profile.username} takip ediliyor!`
);
}
onFollowChange?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setFollowLoading(false);
}
};

const handleMessageClick = () => {
navigate('/chat', {
state: {
openUserId: profile.id,
openUsername: profile.username,
openUserPhoto: profile.profilePhotoUrl,
},
});
};

const handleBlock = async () => {
setMenuOpen(false);
const ok = await confirm({ title: 'Kullanıcıyı Engelle', message: `${profile.username} kullanıcısını engellemek istediğine emin misin?` });
if (!ok) return;

setBlockActionLoading(true);
try {
await blockApi.block(profile.id);
toast.success(`${profile.username} engellendi.`);
navigate(-1);
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setBlockActionLoading(false);
}
};

const handleUnblock = async () => {
setMenuOpen(false);
setBlockActionLoading(true);
try {
await blockApi.unblock(profile.id);
setIsBlocked(false);
toast.success(`${profile.username} adlı kullanıcının engeli kaldırıldı.`);
onFollowChange?.();
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setBlockActionLoading(false);
}
};

const followButtonLabel = {
accepted: 'Takip Ediliyor',
pending: 'İstek Gönderildi',
none: 'Takip Et',
}[localStatus] || 'Takip Et';

return (
<div className="border-b border-slate-800">
<div className={`relative h-28 sm:h-40 md:h-52 w-full overflow-hidden ${
isGradientCover(profile.coverPhotoUrl)
? `bg-gradient-to-br ${COVER_THEMES[getGradientKey(profile.coverPhotoUrl)] || 'from-emerald-600/25 via-slate-900 to-slate-950'}`
: 'bg-gradient-to-br from-emerald-600/25 via-slate-900 to-slate-950'
}`}>
{hasPhoto(profile.coverPhotoUrl) && !isGradientCover(profile.coverPhotoUrl) && (
<img src={profile.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
)}
<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
</div>

<div className="px-4 sm:px-6 pb-5 sm:pb-6">
<div className="flex items-end justify-between -mt-9 sm:-mt-12 md:-mt-14 relative z-10">
<div className="relative">
{hasPhoto(profile.profilePhotoUrl) ? (
<img
src={profile.profilePhotoUrl}
alt={profile.username}
onClick={() => setAvatarLightboxOpen(true)}
className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-4 shadow-xl cursor-pointer transition hover:brightness-90 ${profile.isPremium ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-slate-950'}`}
/>
) : (
<div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl sm:text-2xl md:text-3xl border-4 shadow-xl ${profile.isPremium ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-slate-950'}`}>
{profile.username?.[0]?.toUpperCase()}
</div>
)}
{profile.currentStreak > 0 && (
<div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-orange-400 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-2 border-slate-950 shadow-lg">
🔥{profile.currentStreak}
</div>
)}
</div>

<div className="pb-1">
{isOwnProfile ? (
<button
onClick={onEditClick}
className="border border-slate-700 text-slate-200 hover:bg-slate-900 text-xs sm:text-sm font-semibold rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition"
>
Düzenle
</button>
) : (
<div className="flex items-center gap-1.5 sm:gap-2">
{blockChecked && isBlocked ? (
<button
onClick={handleUnblock}
disabled={blockActionLoading}
className="border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs sm:text-sm font-medium rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition disabled:opacity-50"
>
{blockActionLoading ? '...' : 'Engeli Kaldır'}
</button>
) : (
<>
<button
onClick={handleMessageClick}
className="border border-slate-700 text-slate-300 hover:bg-slate-900 rounded-full p-2 sm:p-2.5 transition"
title="Mesaj gönder"
>
<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
</svg>
</button>
<motion.button
whileTap={{ scale: 0.95 }}
onClick={handleFollowToggle}
disabled={followLoading}
className={`text-xs sm:text-sm font-semibold rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2.5 transition ${
localStatus === 'accepted' || localStatus === 'pending'
? 'border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400'
: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
}`}
>
{followLoading ? '...' : followButtonLabel}
</motion.button>

<div className="relative" ref={menuRef}>
<button
onClick={() => setMenuOpen((v) => !v)}
className="border border-slate-700 text-slate-300 hover:bg-slate-900 rounded-full p-2 sm:p-2.5 transition"
title="Diğer seçenekler"
>
<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
<path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
</svg>
</button>

{menuOpen && (
<div className="absolute right-0 top-10 sm:top-11 z-40 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden w-36 sm:w-40">
<button
onClick={handleBlock}
className="w-full text-left px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-slate-800 transition"
>
Engelle
</button>
</div>
)}
</div>
</>
)}
</div>
)}
</div>
</div>

<div className="mt-3 sm:mt-4">
<div className="flex items-center gap-1.5 sm:gap-2">
<h1 className="text-lg sm:text-2xl font-bold text-white truncate">{profile.username}</h1>
{profile.isPremium && <PremiumBadge className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
{profile.isPrivate && (
<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
</svg>
)}
</div>
{profile.bio ? (
<p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm">{profile.bio}</p>
) : (
<p className="text-slate-600 text-xs sm:text-sm mt-1 italic">
{profile.isPrivate && !isOwnProfile && localStatus !== 'accepted' ? 'Bu hesap gizli.' : 'Henüz bir bio eklenmemiş.'}
</p>
)}
</div>

<div className="flex items-center gap-5 sm:gap-8 mt-4 sm:mt-6">
<StatItem label="Antrenman" value={profile.totalWorkouts ?? 0} />
<StatItem label="Takipçi" value={profile.followerCount ?? 0} onClick={() => setListModal('followers')} />
<StatItem label="Takip" value={profile.followingCount ?? 0} onClick={() => setListModal('following')} />
<StatItem label="En Uzun Seri" value={`${profile.currentStreak ?? 0} gün`} />
</div>
</div>

<FollowListModal
isOpen={listModal !== null}
onClose={() => setListModal(null)}
userId={profile.id}
type={listModal}
/>

{hasPhoto(profile.profilePhotoUrl) && (
<ImageLightbox
imageUrl={profile.profilePhotoUrl}
isOpen={avatarLightboxOpen}
onClose={() => setAvatarLightboxOpen(false)}
/>
)}
{ConfirmDialogElement}
</div>
);
}

export default ProfileHeader;

