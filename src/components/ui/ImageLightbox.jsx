import { AnimatePresence, motion } from 'framer-motion';

function ImageLightbox({ imageUrl, isOpen, onClose }) {
return (
<AnimatePresence>
{isOpen && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center cursor-zoom-out p-4"
>
<button
onClick={onClose}
className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition z-10"
>
<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>

<motion.img
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}
transition={{ type: 'spring', stiffness: 300, damping: 28 }}
src={imageUrl}
alt=""
onClick={(e) => e.stopPropagation()}
className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-default"
/>
</motion.div>
)}
</AnimatePresence>
);
}

export default ImageLightbox;
