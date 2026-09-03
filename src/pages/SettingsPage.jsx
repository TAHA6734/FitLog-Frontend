import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import { userApi } from '../api/userApi';
import { blockApi } from '../api/blockApi';
import { notificationPreferenceApi } from '../api/notificationPreferenceApi';
import { SkeletonToggleRow, SkeletonUserRow } from '../components/ui/Skeleton';

const TABS = [
{ key: 'privacy', label: 'Gizlilik', icon: '🔒' },
{ key: 'blocked', label: 'Engellenenler', icon: '🚫' },
{ key: 'notifications', label: 'Bildirimler', icon: '🔔' },
];

function SettingsPage() {
const [searchParams, setSearchParams] = useSearchParams();
const initialTab = searchParams.get('tab');
const [activeTab, setActiveTab] = useState(
TABS.some((t) => t.key === initialTab) ? initialTab : 'privacy'
);

useEffect(() => {
const tabFromUrl = searchParams.get('tab');
if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl) && tabFromUrl !== activeTab) {
setActiveTab(tabFromUrl);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

const handleTabChange = (key) => {
setActiveTab(key);
setSearchParams({ tab: key });
};

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
<h1 className="text-lg font-bold text-white mb-3 flex items-center gap-1.5">
<span className="text-emerald-400">⚙️</span> Ayarlar
</h1>
<div className="flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-xs sm:text-sm w-full sm:w-fit overflow-x-auto">
{TABS.map((tab) => (
<button
key={tab.key}
onClick={() => handleTabChange(tab.key)}
className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap shrink-0 ${
activeTab === tab.key ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
}`}
>
<span>{tab.icon}</span> {tab.label}
</button>
))}
</div>
</div>

<div className="p-4 sm:p-6">
{activeTab === 'privacy' && <PrivacyTab />}
{activeTab === 'blocked' && <BlockedTab />}
{activeTab === 'notifications' && <NotificationsTab />}
</div>
</PageLayout>
);
}

function ToggleRow({ title, description, checked, onChange, accent = 'emerald' }) {
const accentClass = accent === 'amber' ? 'peer-checked:bg-amber-500' : 'peer-checked:bg-emerald-500';
return (
<label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-900/50 border border-slate-800 rounded-2xl px-3.5 sm:px-4 py-3.5 hover:border-slate-700 transition-all">
<div className="min-w-0">
<p className="text-sm text-white font-medium">{title}</p>
{description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
</div>
<div className="relative shrink-0">
<input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
<div className={`w-11 h-6 bg-slate-700 ${accentClass} rounded-full transition-colors`}></div>
<div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
</div>
</label>
);
}

function PrivacyTab() {
const [isPrivate, setIsPrivate] = useState(false);
const [statsVisibility, setStatsVisibility] = useState('Public');
const [isPremium, setIsPremium] = useState(false);
const [premiumLoading, setPremiumLoading] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

useEffect(() => {
userApi.getMe()
.then((res) => {
setIsPrivate(res.data.isPrivate || false);
setStatsVisibility(res.data.statsVisibility || 'Public');
setIsPremium(res.data.isPremium || false);
})
.catch(() => toast.error('Ayarlar yüklenemedi.'))
.finally(() => setLoading(false));
}, []);

const handleTogglePremium = async () => {
setPremiumLoading(true);
const next = !isPremium;
try {
await userApi.setPremium(next);
setIsPremium(next);
toast.success(next ? 'Premium (test) etkinleştirildi!' : 'Premium (test) kapatıldı.');
} catch (err) {
toast.error(err.response?.data?.message || 'Bir hata oluştu.');
} finally {
setPremiumLoading(false);
}
};

const handleSave = async () => {
setSaving(true);
try {
await userApi.updatePrivacy(isPrivate);
await userApi.updateStatsVisibility(statsVisibility);
toast.success('Gizlilik ayarları güncellendi.');
} catch {
toast.error('Kaydedilemedi.');
} finally {
setSaving(false);
}
};

if (loading) {
return (
<div className="max-w-md space-y-4">
<SkeletonToggleRow />
<SkeletonToggleRow />
</div>
);
}

return (
<div className="max-w-md space-y-4">
<ToggleRow
title="Gizli Hesap"
description="Yeni takipçiler önce onayını beklesin."
checked={isPrivate}
onChange={(e) => setIsPrivate(e.target.checked)}
/>

<div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-3.5 sm:px-4 py-3.5">
<p className="text-sm text-white font-medium mb-1">İstatistik Görünürlüğü</p>
<p className="text-xs text-slate-500 mb-3">Grafiğini ve verilerini kim görebilsin?</p>
<div className="relative">
<select
value={statsVisibility}
onChange={(e) => setStatsVisibility(e.target.value)}
className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition"
>
<option value="Public">Herkese Açık</option>
<option value="FollowersOnly">Sadece Takipçiler</option>
<option value="Private">Gizli</option>
</select>
<svg className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
</div>
</div>

<button
onClick={handleSave}
disabled={saving}
className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl px-5 py-2.5 text-sm transition shadow-[0_0_16px_rgba(16,185,129,0.2)]"
>
{saving ? 'Kaydediliyor...' : 'Kaydet'}
</button>

<div className="border-t border-slate-800 pt-4">
<ToggleRow
title="✨ Premium (Test Modu)"
description="Ödeme entegrasyonu ayrıca da var, bu anahtar geliştirme/test amaçlı."
checked={isPremium}
onChange={handleTogglePremium}
accent="amber"
/>
{premiumLoading && <p className="text-xs text-slate-500 mt-1.5">Güncelleniyor...</p>}
</div>
</div>
);
}

function BlockedTab() {
const [blocked, setBlocked] = useState([]);
const [loading, setLoading] = useState(true);

const loadBlocked = () => {
setLoading(true);
blockApi.getBlockedUsers()
.then((res) => setBlocked(res.data))
.catch(() => toast.error('Liste yüklenemedi.'))
.finally(() => setLoading(false));
};

useEffect(() => {
loadBlocked();
}, []);

const handleUnblock = async (userId) => {
try {
await blockApi.unblock(userId);
setBlocked((prev) => prev.filter((u) => u.id !== userId));
toast.success('Engel kaldırıldı.');
} catch {
toast.error('Bir hata oluştu.');
}
};

if (loading) {
return (
<div className="max-w-md space-y-2">
<SkeletonUserRow />
<SkeletonUserRow />
<SkeletonUserRow />
</div>
);
}

if (blocked.length === 0) {
return (
<div className="text-center py-10">
<div className="w-14 h-14 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-3">
<span className="text-2xl">🚫</span>
</div>
<p className="text-slate-500 text-sm">Kimseyi engellemedin.</p>
</div>
);
}

return (
<div className="max-w-md space-y-2">
{blocked.map((u) => (
<div
key={u.id}
className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800"
>
<div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden shrink-0">
{u.profilePhotoUrl ? (
<img src={u.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
u.username?.[0]?.toUpperCase()
)}
</div>
<p className="text-sm text-white flex-1 font-medium truncate">{u.username}</p>
<button
onClick={() => handleUnblock(u.id)}
className="text-xs border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full px-3 py-1.5 transition shrink-0"
>
Kaldır
</button>
</div>
))}
</div>
);
}

function NotificationsTab() {
const [prefs, setPrefs] = useState({
notifyOnLike: true,
notifyOnComment: true,
notifyOnFollow: true,
notifyOnMention: true,
notifyOnMessage: true,
});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

useEffect(() => {
notificationPreferenceApi.get()
.then((res) => setPrefs(res.data))
.catch(() => toast.error('Tercihler yüklenemedi.'))
.finally(() => setLoading(false));
}, []);

const handleToggle = (key) => {
setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
};

const handleSave = async () => {
setSaving(true);
try {
await notificationPreferenceApi.update(prefs);
toast.success('Bildirim tercihleri güncellendi.');
} catch {
toast.error('Kaydedilemedi.');
} finally {
setSaving(false);
}
};

const items = [
{ key: 'notifyOnLike', label: 'Beğeniler', emoji: '❤️' },
{ key: 'notifyOnComment', label: 'Yorumlar', emoji: '💬' },
{ key: 'notifyOnFollow', label: 'Takipler', emoji: '👤' },
{ key: 'notifyOnMention', label: 'Etiketlemeler', emoji: '📢' },
{ key: 'notifyOnMessage', label: 'Mesajlar', emoji: '✉️' },
];

if (loading) {
return (
<div className="max-w-md space-y-2">
<SkeletonToggleRow />
<SkeletonToggleRow />
<SkeletonToggleRow />
<SkeletonToggleRow />
<SkeletonToggleRow />
</div>
);
}

return (
<div className="max-w-md space-y-2">
{items.map((item) => (
<label
key={item.key}
className="flex items-center justify-between cursor-pointer bg-slate-900/50 border border-slate-800 rounded-2xl px-3.5 sm:px-4 py-3 hover:border-slate-700 transition-all"
>
<div className="flex items-center gap-3">
<span className="text-lg">{item.emoji}</span>
<p className="text-sm text-white font-medium">{item.label}</p>
</div>
<div className="relative shrink-0">
<input
type="checkbox"
checked={prefs[item.key]}
onChange={() => handleToggle(item.key)}
className="sr-only peer"
/>
<div className="w-11 h-6 bg-slate-700 peer-checked:bg-emerald-500 rounded-full transition-colors"></div>
<div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
</div>
</label>
))}

<button
onClick={handleSave}
disabled={saving}
className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl px-5 py-2.5 text-sm transition mt-2 shadow-[0_0_16px_rgba(16,185,129,0.2)]"
>
{saving ? 'Kaydediliyor...' : 'Kaydet'}
</button>
</div>
);
}

export default SettingsPage;


