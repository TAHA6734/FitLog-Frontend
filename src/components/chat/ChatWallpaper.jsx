function ChatWallpaper({ theme }) {
const patterns = {
normal: ['🏋️', '🏃', '💪', '🔥', '🏊', '🚴'],
love: ['💕', '❤️', '💖', '😍', '💗', '🌹'],
};

const emojis = patterns[theme] || patterns.normal;
const rows = 10;
const cols = 7;

return (
<div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.15] z-0">
<div
className="grid gap-10 p-6 -rotate-6 scale-125"
style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
>
{Array.from({ length: rows * cols }).map((_, i) => (
<span key={i} className="text-3xl select-none flex items-center justify-center">
{emojis[i % emojis.length]}
</span>
))}
</div>
</div>
);
}

export default ChatWallpaper;
