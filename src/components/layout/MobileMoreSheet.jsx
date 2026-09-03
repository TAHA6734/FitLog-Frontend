import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ITEMS = [
{ to: '/groups', label: 'Gruplar', emoji: '👥' },
{ to: '/leaderboard', label: 'Liderlik', emoji: '🏆' },
{ to: '/activity', label: 'Hesap Hareketleri', emoji: '📋' },
{ to: '/settings', label: 'Ayarlar', emoji: '⚙️' },
];

function MobileMoreSheet({ isOpen, onClose }) {
const navigate = useNavigate();

const handleNavigate = (to) => {
onClose();
navigate(to);
};

return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="lg:hidden fixed inset-0 bg-black/70 z-40"
/>
<motion.div
initial={{ y: '100%' }}
animate={{ y: 0 }}
exit={{ y: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2"
>
<div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

<div className="px-4 pb-1">
{ITEMS.map((item) => (
<button
key={item.to}
onClick={() => handleNavigate(item.to)}
className="w-full flex items-center gap-3.5 px-2 py-3.5 rounded-xl hover:bg-slate-800/60 transition-colors text-left"
>
<span className="text-xl">{item.emoji}</span>
<span className="text-white text-[15px] font-medium">{item.label}</span>
</button>
))}
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default MobileMoreSheet;


