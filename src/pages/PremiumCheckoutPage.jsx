import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import PageLayout from '../components/layout/PageLayout';
import PremiumBadge from '../components/ui/PremiumBadge';
import { paymentApi } from '../api/paymentApi';
import { luhnCheck, formatCardNumber, detectCardBrand } from '../utils/cardValidation';
import { useAuth } from '../context/AuthContext';

const PRICE_LABEL = '49,90 ₺';

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

function PremiumCheckoutPage() {
const navigate = useNavigate();
const { updateUser } = useAuth();

const [cardHolderName, setCardHolderName] = useState('');
const [cardNumber, setCardNumber] = useState('');
const [expireMonth, setExpireMonth] = useState('');
const [expireYear, setExpireYear] = useState('');
const [cvc, setCvc] = useState('');
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const brand = detectCardBrand(cardNumber);

const validate = () => {
const next = {};
if (!cardHolderName.trim()) next.cardHolderName = 'Kart üzerindeki ismi gir.';
if (!luhnCheck(cardNumber)) next.cardNumber = 'Geçersiz kart numarası.';
if (!expireMonth || !expireYear) next.expiry = 'Son kullanma tarihini seç.';
if (!/^\d{3,4}$/.test(cvc)) next.cvc = 'Geçersiz CVC.';
setErrors(next);
return Object.keys(next).length === 0;
};

const fireConfetti = () => {
confetti({
particleCount: 120,
spread: 90,
origin: { x: 0.5, y: 1 },
colors: ['#10b981', '#fbbf24', '#f59e0b', '#34d399'],
startVelocity: 55,
});
setTimeout(() => {
confetti({
particleCount: 80,
spread: 100,
origin: { x: 0.2, y: 1 },
colors: ['#10b981', '#fbbf24'],
startVelocity: 45,
});
confetti({
particleCount: 80,
spread: 100,
origin: { x: 0.8, y: 1 },
colors: ['#10b981', '#fbbf24'],
startVelocity: 45,
});
}, 200);
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!validate()) return;

setLoading(true);
try {
const res = await paymentApi.purchasePremium({
cardHolderName: cardHolderName.trim(),
cardNumber: cardNumber.replace(/\s/g, ''),
expireMonth,
expireYear,
cvc,
});

if (res.data.success) {
updateUser({ isPremium: true });
toast.success(res.data.message || 'FitLog Pro etkinleştirildi! ✨');
fireConfetti();
setTimeout(() => navigate('/feed'), 1200);
} else {
toast.error(res.data.message || 'Ödeme başarısız oldu.');
}
} catch (err) {
toast.error(err.response?.data?.message || 'Ödeme sırasında bir hata oluştu.');
} finally {
setLoading(false);
}
};

const inputClass = (hasError) =>
`w-full bg-slate-800/60 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 text-sm transition ${
hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-amber-500'
}`;

return (
<PageLayout>
<div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 px-4 py-3 z-10 flex items-center gap-3">
<button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition">
<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
</svg>
</button>
<h1 className="text-lg font-bold text-white flex items-center gap-1.5">
<PremiumBadge className="w-5 h-5" /> FitLog Pro'ya Geç
</h1>
</div>

<div className="p-4 max-w-md mx-auto">
<div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/25 rounded-2xl p-4 mb-5">
<div className="flex items-center justify-between">
<div>
<p className="text-white font-bold text-sm">FitLog Pro — 30 Gün</p>
<p className="text-xs text-slate-500 mt-0.5">Süre sonunda otomatik yenilenmez, tekrar ödeme yapman gerekir.</p>
</div>
<p className="text-xl font-bold text-amber-400 shrink-0 ml-3">{PRICE_LABEL}</p>
</div>
</div>

<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Kart Üzerindeki İsim</label>
<input
type="text"
value={cardHolderName}
onChange={(e) => setCardHolderName(e.target.value)}
placeholder="Ad Soyad"
className={inputClass(errors.cardHolderName)}
/>
{errors.cardHolderName && <p className="text-red-400 text-xs mt-1">{errors.cardHolderName}</p>}
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Kart Numarası</label>
<div className="relative">
<input
type="text"
inputMode="numeric"
value={cardNumber}
onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
placeholder="0000 0000 0000 0000"
maxLength={23}
className={inputClass(errors.cardNumber)}
/>
{brand && (
<span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
{brand}
</span>
)}
</div>
{errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
</div>

<div className="grid grid-cols-3 gap-3">
<div className="col-span-2">
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Son Kullanma</label>
<div className="flex gap-2">
<select
value={expireMonth}
onChange={(e) => setExpireMonth(e.target.value)}
className={inputClass(errors.expiry)}
>
<option value="">Ay</option>
{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
</select>
<select
value={expireYear}
onChange={(e) => setExpireYear(e.target.value)}
className={inputClass(errors.expiry)}
>
<option value="">Yıl</option>
{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
</select>
</div>
{errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
</div>

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">CVC</label>
<input
type="text"
inputMode="numeric"
value={cvc}
onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
placeholder="123"
className={inputClass(errors.cvc)}
/>
{errors.cvc && <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>}
</div>
</div>

<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading}
className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold rounded-xl py-3 transition disabled:opacity-50 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
>
{loading ? 'İşleniyor...' : `${PRICE_LABEL} Öde`}
</motion.button>

<p className="text-[11px] text-slate-600 text-center leading-relaxed">
Ödemen Iyzico altyapısı üzerinden güvenle işlenir. Bu bir test/sandbox ortamıdır, gerçek para çekilmez.
</p>
</form>

<div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
<p className="text-xs font-semibold text-slate-400 mb-1.5">🧪 Test Kartı (Sandbox)</p>
<p className="text-xs text-slate-500">Kart No: 5528 7900 0000 0008 · Son Kul.: 12/30 · CVC: 123</p>
</div>
</div>
</PageLayout>
);
}

export default PremiumCheckoutPage;
