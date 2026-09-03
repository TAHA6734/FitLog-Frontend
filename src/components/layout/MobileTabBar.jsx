import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import MobileMoreSheet from './MobileMoreSheet';

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
function MoreIcon(props) {
return (
<svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
</svg>
);
}

function MobileTabBar() {
const location = useLocation();
const { user } = useAuth();
const { unreadCount } = useNotifications() || {};
const { totalUnread } = useChat() || {};
const [moreOpen, setMoreOpen] = useState(false);

if (location.pathname.startsWith('/chat')) return null;

const tabs = [
{ to: '/feed', icon: HomeIcon, badge: 0 },
{ to: '/search', icon: SearchIcon, badge: 0 },
{ to: '/chat', icon: ChatIcon, badge: totalUnread },
{ to: '/notifications', icon: BellIcon, badge: unreadCount },
];

const moreActivePaths = ['/groups', '/leaderboard', '/activity', '/settings'];
const isMoreActive = moreActivePaths.some((p) => location.pathname.startsWith(p));

return (
<>
<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom)]">
{tabs.map((tab) => (
<NavLink
key={tab.to}
to={tab.to}
className={({ isActive }) =>
`relative flex items-center justify-center flex-1 h-full transition-colors ${
isActive ? 'text-emerald-400' : 'text-slate-500'
}`
}
>
<tab.icon className="w-6 h-6" />
{tab.badge > 0 && (
<span className="absolute top-2 right-1/2 translate-x-3 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
{tab.badge > 9 ? '9+' : tab.badge}
</span>
)}
</NavLink>
))}

<button
onClick={() => setMoreOpen(true)}
className={`flex items-center justify-center flex-1 h-full transition-colors ${
isMoreActive ? 'text-emerald-400' : 'text-slate-500'
}`}
>
<MoreIcon className="w-6 h-6" />
</button>

<NavLink
to={`/profile/${user?.userId}`}
className={({ isActive }) =>
`flex items-center justify-center flex-1 h-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`
}
>
<div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-semibold overflow-hidden">
{user?.profilePhotoUrl ? (
<img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
) : (
user?.username?.[0]?.toUpperCase()
)}
</div>
</NavLink>
</nav>

<MobileMoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
</>
);
}

export default MobileTabBar;

















