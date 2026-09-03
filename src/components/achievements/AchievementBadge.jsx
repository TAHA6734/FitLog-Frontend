const TIER_STYLES = {
Beginner: {
gradient: ['#b45309', '#7c2d12'],
ring: '#92400e',
glow: false,
label: 'Başlangıç',
},
Amateur: {
gradient: ['#e2e8f0', '#94a3b8'],
ring: '#cbd5e1',
glow: false,
label: 'Amatör',
},
Pro: {
gradient: ['#3b82f6', '#4338ca'],
ring: '#60a5fa',
glow: true,
label: 'Pro',
},
SuperAthlete: {
gradient: ['#fbbf24', '#dc2626'],
ring: '#fcd34d',
glow: true,
label: 'Süper Atlet',
},
};

// Her spor + seviye kombinasyonu için basit, tanınabilir bir sembol path'i.
// Fotoğraf-kalitesinde illüstrasyon değil, düz-renkli amblem tarzı.
const SYMBOLS = {
Running: {
Beginner: 'M8 20 L12 12 L16 20 M10 16 L14 16 M12 12 L12 6 M9 6 L15 6', // koşu ayakkabısı basit
Amateur: 'M6 18 Q10 8 14 14 Q18 8 20 18', // tavşan sıçrama izi
Pro: 'M4 18 L9 8 L12 14 L16 6 L20 18', // leopar şerit/zikzak
SuperAthlete: 'M12 5 L14 11 L20 11 L15 14.5 L17 20 L12 16.5 L7 20 L9 14.5 L4 11 L10 11 Z', // yıldız/unicorn boynuzu simgesi
},
Swimming: {
Beginner: 'M4 14 Q7 10 10 14 T16 14 T22 14 M4 18 Q7 14 10 18 T16 18 T22 18',
Amateur: 'M4 14 Q8 8 12 14 Q16 20 20 14 M6 16 L4 18 M18 16 L20 18', // yunus dalga
Pro: 'M4 12 L10 12 L12 6 L14 12 L20 12 L14 16 L20 20 L12 17 L4 20 L8 15 Z', // köpekbalığı yüzgeci
SuperAthlete: 'M12 4 L12 20 M6 8 L18 8 M8 4 L8 12 M16 4 L16 12', // üç dişli asa (trident)
},
Weightlifting: {
Beginner: 'M4 12 L20 12 M6 8 L6 16 M18 8 L18 16 M4 9 L4 15 M20 9 L20 15', // dambıl
Amateur: 'M8 18 Q6 12 10 10 Q8 6 12 4 Q16 6 14 10 Q18 12 16 18 Z', // pazı/kol
Pro: 'M6 6 L8 12 L6 18 M18 6 L16 12 L18 18 M8 12 L16 12', // gorilla göğüs/kollar
SuperAthlete: 'M4 8 Q4 4 8 5 L9 9 L15 9 L16 5 Q20 4 20 8 L17 12 L19 18 L15 16 L12 20 L9 16 L5 18 L7 12 Z', // boğa kafası/boynuz
},
Yoga: {
Beginner: 'M12 4 L12 20 M8 8 L16 8 M9 12 L15 12 M8 16 L16 16', // basit nefes/lotus çizgileri
Amateur: 'M12 6 Q8 6 8 10 Q8 14 12 12 Q16 14 16 10 Q16 6 12 6 Z M10 16 L14 16 L12 20 Z', // kelebek
Pro: 'M4 18 Q8 6 12 12 Q16 6 20 18 Q16 14 12 18 Q8 14 4 18 Z', // ejderha kanat/dalga
SuperAthlete: 'M12 4 A4 4 0 1 1 11.99 4 M8 14 Q12 10 16 14 Q12 18 8 14 M12 18 L12 21', // om sembolü basitleştirilmiş
},
};

function AchievementBadge({ sport, tier, title, description, unit, threshold, progress, isUnlocked, size = 'normal' }) {
const style = TIER_STYLES[tier] || TIER_STYLES.Beginner;
const symbolPath = SYMBOLS[sport]?.[tier] || '';
const gradId = `grad-${sport}-${tier}`;
const dims = size === 'small' ? 'w-20 h-20' : 'w-28 h-28';
const progressPercent = threshold > 0 ? Math.min(100, Math.round((progress / threshold) * 100)) : 0;

return (
<div className="flex flex-col items-center gap-2 w-full">
<div className={`relative ${dims}`}>
<svg viewBox="0 0 100 110" className={`w-full h-full ${isUnlocked && style.glow ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : ''}`}>
<defs>
<linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stopColor={style.gradient[0]} />
<stop offset="100%" stopColor={style.gradient[1]} />
</linearGradient>
</defs>

{/* Altıgen çerçeve */}
<polygon
points="50,3 90,25 90,75 50,97 10,75 10,25"
fill={isUnlocked ? `url(#${gradId})` : '#1e293b'}
stroke={isUnlocked ? style.ring : '#334155'}
strokeWidth="3"
/>

{/* İç sembol */}
{isUnlocked && symbolPath && (
<g transform="translate(24, 30) scale(1.1)">
<path
d={symbolPath}
fill="none"
stroke="rgba(15,23,42,0.85)"
strokeWidth="2.2"
strokeLinecap="round"
strokeLinejoin="round"
/>
</g>
)}

{/* Kilit ikonu (kilitliyken) */}
{!isUnlocked && (
<g transform="translate(38, 38)">
<rect x="4" y="10" width="16" height="14" rx="2" fill="#475569" />
<path d="M7 10 V6 a5 5 0 0 1 10 0 v4" fill="none" stroke="#475569" strokeWidth="3" />
</g>
)}
</svg>
</div>

<div className="text-center">
<p className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
{isUnlocked ? title : '???'}
</p>
<p className="text-[10px] text-slate-500 mt-0.5">{style.label}</p>
</div>

{!isUnlocked && (
<div className="w-full px-1">
<div className="h-1 bg-slate-800 rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
</div>
<p className="text-[9px] text-slate-600 text-center mt-1">
{Math.floor(progress)} / {threshold} {unit}
</p>
</div>
)}
</div>
);
}

export default AchievementBadge;



