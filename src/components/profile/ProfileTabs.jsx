import { motion } from 'framer-motion';

function ProfileTabs({ tabs, active, onChange }) {
return (
<div className="flex border-b border-slate-800 overflow-x-auto">
{tabs.map((tab) => (
<button
key={tab.key}
onClick={() => onChange(tab.key)}
className="flex-1 min-w-[70px] relative py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-colors hover:bg-slate-900/40 whitespace-nowrap"
>
<span className={active === tab.key ? 'text-white' : 'text-slate-500'}>
{tab.label}
</span>
{active === tab.key && (
<motion.div
layoutId="profileTabUnderline"
className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
transition={{ type: 'spring', stiffness: 500, damping: 35 }}
/>
)}
</button>
))}
</div>
);
}

export default ProfileTabs;
