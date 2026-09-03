import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { likeApi } from '../../api/workoutApi';

function LikeButton({ workoutId, initialLiked, initialCount }) {
const [liked, setLiked] = useState(initialLiked);
const [count, setCount] = useState(initialCount);
const [burst, setBurst] = useState(false);

const handleClick = async (e) => {
e.stopPropagation();
const wasLiked = liked;
setLiked(!wasLiked);
setCount((c) => (wasLiked ? c - 1 : c + 1));

if (!wasLiked) {
setBurst(true);
setTimeout(() => setBurst(false), 600);
}

try {
if (wasLiked) {
await likeApi.unlike(workoutId);
} else {
await likeApi.like(workoutId);
}
} catch {
// Hata olursa geri al
setLiked(wasLiked);
setCount((c) => (wasLiked ? c + 1 : c - 1));
}
};

return (
<button onClick={handleClick} className="flex items-center gap-1.5 group relative">
<div className="relative">
<motion.div whileTap={{ scale: 0.8 }}>
<svg
className={`w-[22px] h-[22px] transition-colors ${
liked ? 'text-red-500' : 'text-slate-400 group-hover:text-red-400'
}`}
fill={liked ? 'currentColor' : 'none'}
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={1.8}
>
<path
strokeLinecap="round"
strokeLinejoin="round"
d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
/>
</svg>
</motion.div>

<AnimatePresence>
{burst && (
<motion.div
initial={{ scale: 0.5, opacity: 1 }}
animate={{ scale: 2.2, opacity: 0 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.5, ease: 'easeOut' }}
className="absolute inset-0 flex items-center justify-center pointer-events-none"
>
<svg className="w-[22px] h-[22px] text-red-500" fill="currentColor" viewBox="0 0 24 24">
<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
</svg>
</motion.div>
)}
</AnimatePresence>
</div>

<span className={`text-sm transition-colors ${liked ? 'text-red-500' : 'text-slate-400'}`}>
{count}
</span>
</button>
);
}

export default LikeButton;



