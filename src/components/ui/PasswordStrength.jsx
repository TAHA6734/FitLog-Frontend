function PasswordStrength({ password }) {
const criteria = [
{ label: '6-100 karakter arası', test: (p) => p.length >= 6 && p.length <= 100 },
{ label: 'Bir küçük harf (a-z)', test: (p) => /[a-z]/.test(p) },
{ label: 'Bir büyük harf (A-Z)', test: (p) => /[A-Z]/.test(p) },
{ label: 'Bir rakam (0-9)', test: (p) => /[0-9]/.test(p) },
];

if (!password) return null;

return (
<div className="mt-2 space-y-1">
{criteria.map((c) => {
const passed = c.test(password);
return (
<div key={c.label} className="flex items-center gap-2 text-xs">
<span className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
passed ? 'bg-emerald-500' : 'bg-slate-800'
}`}>
{passed && (
<svg className="w-2.5 h-2.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
</svg>
)}
</span>
<span className={passed ? 'text-emerald-400' : 'text-slate-500'}>{c.label}</span>
</div>
);
})}
</div>
);
}

export default PasswordStrength;




