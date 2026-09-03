function PremiumBadge({ className = 'w-4 h-4' }) {
return (
<svg className={className} viewBox="0 0 24 24" fill="none">
<defs>
<linearGradient id="premiumBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stopColor="#fbbf24" />
<stop offset="100%" stopColor="#f59e0b" />
</linearGradient>
</defs>
<path
d="M12 2l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 14.27l-4.8 2.49.92-5.34-3.88-3.78 5.36-.78L12 2z"
fill="url(#premiumBadgeGrad)"
stroke="#f59e0b"
strokeWidth="0.5"
strokeLinejoin="round"
/>
<path
d="M9.5 12.5l1.8 1.8 3.2-3.6"
stroke="#0f172a"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
fill="none"
/>
</svg>
);
}

export default PremiumBadge;





