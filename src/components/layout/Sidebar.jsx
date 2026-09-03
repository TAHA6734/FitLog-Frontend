import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import PremiumBadge from '../ui/PremiumBadge';

const ACTIVITY_TABS = [
{ key: 'liked', label: 'Beğeniler' },
{ key: 'saved', label: 'Kayıtlar' },
{ key: 'commented', label: 'Yorumlar' },
{ key: 'achievements', label: 'Başarımlar' },
];

const SETTINGS_TABS = [
{ key: 'privacy', label: 'Gizlilik' },
{ key: 'blocked', label: 'Engellenenler' },
{ key: 'notifications', label: 'Bildirimler' },
];

function Sidebar() {
const { user, logout } = useAuth();
const { unreadCount } = useNotifications() || {};
const { totalUnread } = useChat() || {};
const navigate = useNavigate();
const location = useLocation();

const [openMenu, setOpenMenu] = useState(null);

useEffect(() => {
if (location.pathname === '/activity') setOpenMenu('activity');
else if (location.pathname === '/settings') setOpenMenu('settings');
}, [location.pathname]);

const currentTab = new URLSearchParams(location.search).get('tab');

const navItemsBefore = [
{ to: '/feed', label: 'Ana Sayfa', icon: HomeIcon },
{ to: '/search', label: 'Keşfet', icon: SearchIcon },
{ to: '/chat', label: 'Mesajlar', icon: ChatIcon, badge: totalUnread },
{ to: '/notifications', label: 'Bildirimler', icon: BellIcon, badge: unreadCount },
];

const navItemsAfter = [
{ to: '/groups', label: 'Gruplar', icon: GroupIcon },
{ to: '/leaderboard', label: 'Liderlik', icon: TrophyIcon },
];

const handleLogout = () => {
logout();
navigate('/login');
};

const goToTab = (basePath, tabKey) => {
navigate(`${basePath}?tab=${tabKey}`);
};

const renderNavItem = (item) => (
<NavLink
key={item.to}
to={item.to}
className={({ isActive }) =>
`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors relative ${
isActive
? 'bg-emerald-500/10 text-emerald-400'
: 'text-slate-300 hover:bg-slate-900 hover:text-white'
}`
}
>
<div className="relative">
<item.icon className="w-5 h-5" />
{item.badge > 0 && (
<span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
{item.badge > 9 ? '9+' : item.badge}
</span>
)}
</div>
{item.label}
</NavLink>
);

const renderAccordion = (key, label, Icon, tabs, basePath) => {
const isOpenMenu = openMenu === key;
const isOnPage = location.pathname === basePath;

return (
<div>
<button
onClick={() => setOpenMenu(isOpenMenu ? null : key)}
className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
isOnPage ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
}`}
>
<Icon className="w-5 h-5" />
<span className="flex-1 text-left">{label}</span>
<ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpenMenu ? 'rotate-180' : ''}`} />
</button>

{isOpenMenu && (
<div className="flex flex-wrap gap-1.5 px-1 mt-1.5 mb-1">
{tabs.map((tab) => {
const isActiveTab = isOnPage && currentTab === tab.key;
return (
<button
key={tab.key}
onClick={() => goToTab(basePath, tab.key)}
className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
isActiveTab
? 'bg-emerald-500 text-slate-950'
: 'bg-slate-900 text-slate-400 hover:text-white'
}`}
>
{tab.label}
</button>
);
})}
</div>
)}
</div>
);
};

return (
<aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-800 px-4 py-6">
<h1 className="flex items-center gap-2 text-2xl font-bold text-white px-3 mb-8">
<img src="/logo.png" alt="FitLog" className="w-7 h-7 object-contain" />
Fit<span className="text-emerald-400">Log</span>
</h1>


<nav className="flex-1 space-y-1">
{navItemsBefore.map(renderNavItem)}
{renderAccordion('activity', 'Hesap Hareketleri', ActivityIcon, ACTIVITY_TABS, '/activity')}
{navItemsAfter.map(renderNavItem)}
{renderAccordion('settings', 'Ayarlar', SettingsIcon, SETTINGS_TABS, '/settings')}
</nav>

<div
onClick={() => navigate(`/profile/${user?.userId}`)}
className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors mt-4"
>
<div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm shrink-0">
{user?.profilePhotoUrl ? (
<img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
user?.username?.[0]?.toUpperCase()
)}
</div>

<div className="flex-1 min-w-0">
<p className="text-sm font-medium text-white truncate flex items-center gap-1">
{user?.username}
{user?.isPremium && <PremiumBadge className="w-3.5 h-3.5" />}
</p>
</div>
<button
onClick={(e) => { e.stopPropagation(); handleLogout(); }}
className="text-slate-500 hover:text-red-400 transition-colors p-1"
title="Çıkış yap"
>
<LogoutIcon className="w-4 h-4" />
</button>
</div>
</aside>
);
}

function HomeIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
</svg>
);
}
function SearchIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
</svg>
);
}
function ChatIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
</svg>
);
}
function BellIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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
function TrophyIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35" />
</svg>
);
}
function LogoutIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
</svg>
);
}
function SettingsIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
);
}
function ActivityIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
</svg>
);
}
function ChevronDownIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
</svg>
);
}

export default Sidebar;


