import { AnimatePresence, motion } from 'framer-motion';

function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Evet', cancelLabel = 'Vazgeç', danger = true, onConfirm, onCancel }) {
return (
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onCancel}
className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
/>
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ type: 'spring', stiffness: 300, damping: 30 }}
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-sm z-[201] bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl"
>
<div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${danger ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
<svg className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
{danger ? (
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
) : (
<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
)}
</svg>
</div>

<h3 className="text-white font-semibold text-base mb-1">{title}</h3>
<p className="text-slate-400 text-sm mb-5">{message}</p>

<div className="flex gap-2">
<button
onClick={onCancel}
className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium rounded-xl py-2.5 transition"
>
{cancelLabel}
</button>
<button
onClick={onConfirm}
className={`flex-1 text-sm font-semibold rounded-xl py-2.5 transition ${
danger
? 'bg-red-500 hover:bg-red-400 text-white'
: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
}`}
>
{confirmLabel}
</button>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}

export default ConfirmDialog;



