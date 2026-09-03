export const COVER_THEMES = {
sunset: 'from-orange-500 via-red-500 to-pink-600',
ocean: 'from-cyan-500 via-blue-600 to-indigo-700',
royal: 'from-violet-600 via-purple-700 to-fuchsia-800',
'emerald-gold': 'from-emerald-500 via-emerald-700 to-amber-600',
midnight: 'from-slate-700 via-slate-900 to-black',
};

export function isGradientCover(url) {
return typeof url === 'string' && url.startsWith('gradient:');
}

export function getGradientKey(url) {
return url.replace('gradient:', '');
}





