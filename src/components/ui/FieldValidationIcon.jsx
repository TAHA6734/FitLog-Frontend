function FieldValidationIcon({ isValid, show }) {
if (!show) return null;

return (
<span className="absolute right-3 top-1/2 -translate-y-1/2">
{isValid ? (
<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9m6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
) : (
<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
</svg>
)}
</span>
);
}

export default FieldValidationIcon;
