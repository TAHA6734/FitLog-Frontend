import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { onboardingApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { turkiyeApi } from '../api/turkiyeApi';

const WORKOUT_TYPES = [
{ value: 0, label: 'Koşu', emoji: '🏃' },
{ value: 1, label: 'Ağırlık', emoji: '🏋️' },
{ value: 2, label: 'Yüzme', emoji: '🏊' },
{ value: 3, label: 'Bisiklet', emoji: '🚴' },
{ value: 4, label: 'Yoga', emoji: '🧘' },
{ value: 5, label: 'Diğer', emoji: '⚡' },
];

const GOALS = [
{ label: 'Kilo vermek', emoji: '🔥' },
{ label: 'Kas kazanmak', emoji: '💪' },
{ label: 'Dayanıklılık artırmak', emoji: '🫁' },
{ label: 'Sağlıklı kalmak', emoji: '🌿' },
{ label: 'Yarışa hazırlanmak', emoji: '🏆' },
];

const STEP_META = {
1: { title: 'Nelerle ilgileniyorsun?', subtitle: 'Birden fazla seçebilirsin.' },
2: { title: 'Hedefin nedir?', subtitle: 'Sana uygun içerikler önerelim.' },
3: { title: 'Nerelisin?', subtitle: 'Bölgendeki antrenman ortaklarını önerebilmemiz için (opsiyonel).' },
};

function OnboardingPage() {
const [step, setStep] = useState(1);
const [selectedTypes, setSelectedTypes] = useState([]);
const [goal, setGoal] = useState('');
const [city, setCity] = useState('');
const [loading, setLoading] = useState(false);
const [provinces, setProvinces] = useState([]);
const [loadingProvinces, setLoadingProvinces] = useState(true);

const navigate = useNavigate();
const { login, user } = useAuth();

useEffect(() => {
turkiyeApi.getProvinces()
.then((res) => setProvinces(res.data.data))
.catch(() => toast.error('İl listesi yüklenemedi.'))
.finally(() => setLoadingProvinces(false));
}, []);

const toggleType = (value) => {
setSelectedTypes((prev) =>
prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
);
};

const handleNext = () => {
if (step === 1 && selectedTypes.length === 0) {
toast.error('En az bir spor türü seç.');
return;
}
if (step === 2 && !goal) {
toast.error('Bir hedef seç.');
return;
}
setStep((s) => s + 1);
};

const handleFinish = async () => {
setLoading(true);
try {
await onboardingApi.complete({
preferredWorkoutTypes: selectedTypes,
fitnessGoal: goal,
city: city || null,
});

const updatedUser = { ...user, hasCompletedOnboarding: true };
localStorage.setItem('user', JSON.stringify(updatedUser));

toast.success('Her şey hazır, hoş geldin!');
navigate('/feed');
} catch {
toast.error('Bir hata oluştu, tekrar dene.');
} finally {
setLoading(false);
}
};

const meta = STEP_META[step];

return (
<div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden">
<div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

<div className="w-full max-w-lg relative z-10">
<h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-1 flex items-center justify-center gap-1.5">
<img src="/logo.png" alt="FitLog" className="w-6 h-6 object-contain" />
Fit<span className="text-emerald-400">Log</span>
</h1>

<div className="flex items-center justify-center gap-2 mt-5 sm:mt-6 mb-7 sm:mb-10">
{[1, 2, 3].map((s) => (
<div key={s} className="flex items-center">
<motion.div
animate={{
scale: step === s ? 1.1 : 1,
}}
className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
step >= s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
}`}
>
{step > s ? '✓' : s}
{step === s && (
<span className="absolute inset-0 rounded-full ring-2 ring-emerald-500/40 animate-ping" />
)}
</motion.div>
{s < 3 && (
<div className="w-8 sm:w-12 h-0.5 mx-1 sm:mx-1.5 bg-slate-800 rounded-full overflow-hidden">
<motion.div
initial={false}
animate={{ width: step > s ? '100%' : '0%' }}
transition={{ duration: 0.3 }}
className="h-full bg-emerald-500"
/>
</div>
)}
</div>
))}
</div>

<div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 sm:p-8 backdrop-blur-sm">
<AnimatePresence mode="wait">
{step === 1 && (
<motion.div
key="step1"
initial={{ opacity: 0, x: 24 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -24 }}
transition={{ duration: 0.25 }}
>
<h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">{meta.title}</h2>
<p className="text-slate-500 text-xs sm:text-sm text-center mb-6 sm:mb-8">{meta.subtitle}</p>

<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
{WORKOUT_TYPES.map((type) => {
const selected = selectedTypes.includes(type.value);
return (
<motion.button
key={type.value}
whileTap={{ scale: 0.96 }}
type="button"
onClick={() => toggleType(type.value)}
className={`flex flex-col items-center gap-1.5 sm:gap-2 py-4 sm:py-6 rounded-2xl border-2 transition-all ${
selected
? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
: 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
}`}
>
<span className="text-2xl sm:text-3xl">{type.emoji}</span>
<span className={`text-xs sm:text-sm font-medium ${selected ? 'text-emerald-400' : 'text-slate-300'}`}>
{type.label}
</span>
</motion.button>
);
})}
</div>

<motion.button
whileTap={{ scale: 0.98 }}
onClick={handleNext}
className="w-full mt-6 sm:mt-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
Devam Et
</motion.button>
</motion.div>
)}

{step === 2 && (
<motion.div
key="step2"
initial={{ opacity: 0, x: 24 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -24 }}
transition={{ duration: 0.25 }}
>
<h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">{meta.title}</h2>
<p className="text-slate-500 text-xs sm:text-sm text-center mb-6 sm:mb-8">{meta.subtitle}</p>

<div className="space-y-2">
{GOALS.map((g) => (
<motion.button
key={g.label}
whileTap={{ scale: 0.98 }}
onClick={() => setGoal(g.label)}
className={`w-full flex items-center gap-3 text-left px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all text-sm sm:text-base ${
goal === g.label
? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
: 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
}`}
>
<span className="text-lg sm:text-xl">{g.emoji}</span>
{g.label}
</motion.button>
))}
</div>

<div className="flex gap-3 mt-6 sm:mt-8">
<button
onClick={() => setStep(1)}
className="flex-1 border border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold rounded-xl py-3 transition text-sm sm:text-base"
>
Geri
</button>
<motion.button
whileTap={{ scale: 0.98 }}
onClick={handleNext}
className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)] text-sm sm:text-base"
>
Devam Et
</motion.button>
</div>
</motion.div>
)}

{step === 3 && (
<motion.div
key="step3"
initial={{ opacity: 0, x: 24 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -24 }}
transition={{ duration: 0.25 }}
>
<h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-1">{meta.title}</h2>
<p className="text-slate-500 text-xs sm:text-sm text-center mb-6 sm:mb-8">{meta.subtitle}</p>

{loadingProvinces ? (
<div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 animate-pulse text-sm">
İller yükleniyor...
</div>
) : (
<div className="relative">
<select
value={city}
onChange={(e) => setCity(e.target.value)}
className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
>
<option value="">İl seç (opsiyonel)</option>
{provinces.map((p) => (
<option key={p.id} value={p.name}>{p.name}</option>
))}
</select>
<svg className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
</svg>
</div>
)}

<div className="flex gap-3 mt-6 sm:mt-8">
<button
onClick={() => setStep(2)}
className="flex-1 border border-slate-800 text-slate-300 hover:bg-slate-900 font-semibold rounded-xl py-3 transition text-sm sm:text-base"
>
Geri
</button>
<motion.button
whileTap={{ scale: 0.98 }}
onClick={handleFinish}
disabled={loading}
className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)] text-sm sm:text-base"
>
{loading ? 'Kaydediliyor...' : 'Başla'}
</motion.button>
</div>
</motion.div>
)}
</AnimatePresence>
</div>
</div>
</div>
);
}

export default OnboardingPage;



