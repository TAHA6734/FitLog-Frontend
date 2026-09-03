import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FeedPage from './pages/FeedPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import ActivityPage from './pages/ActivityPage';
import PremiumBadge from './components/ui/PremiumBadge';
import PremiumCheckoutPage from './pages/PremiumCheckoutPage';


function PageWrapper({ children }) {
return (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.25 }}
className="bg-slate-950 min-h-screen"
>
{children}
</motion.div>
);
}

function AnimatedRoutes() {
const location = useLocation();

return (
<AnimatePresence mode="wait">
<Routes location={location} key={location.pathname}>
<Route path="/login" element={<PageWrapper><AuthPage /></PageWrapper>} />
<Route path="/register" element={<PageWrapper><AuthPage /></PageWrapper>} />
<Route path="/onboarding" element={<PageWrapper> <OnboardingPage/> </PageWrapper>}/>
<Route path="/profile/:userId" element={<PageWrapper><ProfilePage/></PageWrapper>}/>
<Route path="/workout/:id" element={<PageWrapper><WorkoutDetailPage/></PageWrapper>}/>
<Route path = "/notifications" element={<PageWrapper><NotificationsPage/></PageWrapper>}/>
<Route path="/activity" element={<PageWrapper><ActivityPage/></PageWrapper>}/>
<Route path="/search" element={<PageWrapper><SearchPage/></PageWrapper>}/>
<Route path="/chat" element = {<PageWrapper><ChatPage/></PageWrapper>}/>
<Route path="/groups" element={<PageWrapper><GroupsPage/></PageWrapper>}/>
<Route path="/groups/:id" element={<PageWrapper><GroupDetailPage/></PageWrapper>}/>
<Route path="/premium" element={<PageWrapper><PremiumCheckoutPage/></PageWrapper>}/>
<Route path="/settings" element={<PageWrapper><SettingsPage/></PageWrapper>}/>
<Route path="/leaderboard" element={<PageWrapper><LeaderboardPage/></PageWrapper>}/>
<Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
<Route path="/feed" element={<PageWrapper><FeedPage /></PageWrapper>} />
<Route path="/" element={<Navigate to="/login" />} />
</Routes>
</AnimatePresence>
);
}

function App() {
return (
<AuthProvider>
<NotificationProvider>
<ChatProvider> 
<AnimatedRoutes />
</ChatProvider>
</NotificationProvider>
</AuthProvider>
);
}

export default App;

