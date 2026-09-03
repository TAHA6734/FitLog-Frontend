import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import PremiumBadge from '../ui/PremiumBadge';
import { exportWorkoutsToCSV } from '../../utils/exportWorkouts';

const FEATURES = [
'Profilde altın Pro rozeti',
'Avatar etrafında özel parlama efekti',
'Premium kapak fotoğrafı temaları',
'Antrenmanlarını PDF/CSV olarak indir',
'Sınırsız antrenman şablonu',
];

function formatExpiry(dateString) {
if (!dateString) return null;
const date = new Date(dateString);
return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SubscribeWidget() {
const [isPremium, setIsPremium] = useState(false);
const [premiumExpiresAt, setPremiumExpiresAt] = useState(null);
const [loading, setLoading] = useState(true);
const [exporting, setExporting] = useState(false);
const navigate = useNavigate();

useEffect(() => {
userApi.getMe()
.then((res) => {
setIsPremium(res.data.isPremium || false);
setPremiumExpiresAt(res.data.premiumExpiresAt || null);
})
.catch(() => {})
.finally(() => setLoading(false));
}, []);

const handleExport = async () => {
setExporting(true);
try {
await exportWorkoutsToCSV();
toast.success('Antrenmanların indirildi.');
} catch {
toast.error('Dışa aktarma başarısız oldu.');
} finally {
setExporting(false);
}
};

if (loading) return null;

if (isPremium) {
const expiryLabel = formatExpiry(premiumExpiresAt);
return (
<div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/25 rounded-2xl p-4">
<div className="flex items-center gap-2 mb-1">
<PremiumBadge className="w-5 h-5" />
<h3 className="text-white font-bold text-sm">FitLog Pro Üyesisin</h3>
</div>
<p className="text-xs text-slate-400 mb-3">
{expiryLabel ? `${expiryLabel} tarihine kadar geçerli.` : 'Tüm premium özellikler açık.'}
</p>
<button
onClick={handleExport}
disabled={exporting}
className="w-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-full py-2 transition disabled:opacity-50"
>
{exporting ? 'Hazırlanıyor...' : '📄 Antrenmanları Dışa Aktar'}
</button>
</div>
);
}

return (
<div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
<h3 className="text-white font-bold text-sm mb-1 flex items-center gap-1.5">
<PremiumBadge className="w-4 h-4" /> FitLog Pro'ya Abone Ol
</h3>
<p className="text-xs text-slate-500 mb-3">Yeni özelliklerin kilidini aç.</p>
<ul className="space-y-1.5 mb-3">
{FEATURES.map((f) => (
<li key={f} className="flex items-start gap-1.5 text-xs text-slate-400">
<span className="text-amber-400 mt-0.5">✦</span>
{f}
</li>
))}
</ul>
<button
onClick={() => navigate('/premium')}
className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-full py-2 transition shadow-[0_0_16px_rgba(251,191,36,0.3)]"
>
Abone Ol
</button>
</div>
);
}

export default SubscribeWidget;

