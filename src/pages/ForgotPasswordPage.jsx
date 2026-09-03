import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import PasswordStrength from '../components/ui/PasswordStrength';
import PasswordInput from '../components/ui/PasswordInput';
import { validateField } from '../utils/validators';

function ForgotPasswordPage() {
const [step, setStep] = useState(1);
const [email, setEmail] = useState('');
const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [timeLeft, setTimeLeft] = useState(60);

const navigate = useNavigate();
const digitRefs = useRef([]);

useEffect(() => {
if (step !== 2 || timeLeft <= 0) return;

const timer = setInterval(() => {
setTimeLeft((prev) => prev - 1);
}, 1000);

return () => clearInterval(timer);
}, [step, timeLeft]);

const code = codeDigits.join('');

const handleDigitChange = (index, value) => {
const digit = value.replace(/\D/g, '').slice(-1);
const next = [...codeDigits];
next[index] = digit;
setCodeDigits(next);

if (digit && index < 5) {
digitRefs.current[index + 1]?.focus();
}
};

const handleDigitKeyDown = (index, e) => {
if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
digitRefs.current[index - 1]?.focus();
}
};

const handleDigitPaste = (e) => {
const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
if (!pasted) return;
e.preventDefault();
const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
setCodeDigits(next);
digitRefs.current[Math.min(pasted.length, 5)]?.focus();
};

const handleSendCode = async (e) => {
e?.preventDefault();
setError('');

const emailError = validateField('email', email);
if (emailError) {
setError(emailError);
toast.error(emailError);
return;
}

setLoading(true);
try {
await authApi.forgotPassword(email);
toast.success('Kod e-postana gönderildi.');
setCodeDigits(['', '', '', '', '', '']);
setTimeLeft(60);
setStep(2);
} catch (err) {
const message = err.response?.data?.message || 'Bir hata oluştu.';
setError(message);
toast.error(message);
} finally {
setLoading(false);
}
};

const handleVerifyCode = (e) => {
e.preventDefault();
setError('');

if (timeLeft <= 0) {
setError('Kodun süresi doldu, yeni kod iste.');
return;
}

if (code.length !== 6) {
setError('Kod 6 haneli olmalı.');
toast.error('Kod 6 haneli olmalı.');
return;
}

setStep(3);
};

const handleResetPassword = async (e) => {
e.preventDefault();
setError('');

const passwordError = validateField('password', newPassword);
if (passwordError) {
setError(passwordError);
toast.error(passwordError);
return;
}

if (newPassword !== confirmPassword) {
setError('Şifreler eşleşmiyor.');
toast.error('Şifreler eşleşmiyor.');
return;
}

setLoading(true);
try {
await authApi.resetPassword({ email, code, newPassword });
toast.success('Şifren başarıyla sıfırlandı!');
navigate('/login');
} catch (err) {
const message = err.response?.data?.message || 'Kod geçersiz veya süresi dolmuş.';
setError(message);
toast.error(message);
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen flex items-center justify-center bg-slate-950 px-5 sm:px-6 relative overflow-hidden">
<div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

<div className="w-full max-w-sm relative z-10 py-8">
<h1 className="text-xl sm:text-2xl font-bold text-white mb-1 text-center flex items-center justify-center gap-1.5">
<img src="/logo.png" alt="FitLog" className="w-6 h-6 object-contain" />
Fit<span className="text-emerald-400">Log</span>
</h1>

<div className="flex items-center justify-center gap-2 mt-5 sm:mt-6 mb-6 sm:mb-8">
{[1, 2, 3].map((s) => (
<div key={s} className="flex items-center">
<div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold transition-colors ${
step >= s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
}`}>
{step > s ? '✓' : s}
</div>
{s < 3 && <div className={`w-7 sm:w-8 h-0.5 mx-1 transition-colors ${step > s ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
</div>
))}
</div>

<div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-sm">
{error && (
<motion.div
initial={{ opacity: 0, y: -8 }}
animate={{ opacity: 1, y: 0 }}
className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-4"
>
{error}
</motion.div>
)}

<AnimatePresence mode="wait">
{step === 1 && (
<motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
<div className="text-center mb-6">
<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-3">
<span className="text-xl sm:text-2xl">🔒</span>
</div>
<h2 className="text-xl sm:text-2xl font-bold text-white">Şifreni mi unuttun?</h2>
<p className="text-slate-500 text-xs sm:text-sm mt-2">E-posta adresini gir, sana bir kod gönderelim.</p>
</div>
<form onSubmit={handleSendCode} noValidate className="space-y-4">
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
maxLength={255}
className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
placeholder="ornek@mail.com"
/>
<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'Gönderiliyor...' : 'Kod Gönder'}
</motion.button>
</form>
</motion.div>
)}

{step === 2 && (
<motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
<div className="text-center mb-6">
<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-3">
<span className="text-xl sm:text-2xl">✉️</span>
</div>
<h2 className="text-xl sm:text-2xl font-bold text-white">Kodu gir</h2>
<p className="text-slate-500 text-xs sm:text-sm mt-2">
<span className="text-white">{email}</span> adresine gönderdiğimiz 6 haneli kodu gir.
</p>
</div>

<div className="text-center mb-5">
{timeLeft > 0 ? (
<span className={`text-sm font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-400'}`}>
Kalan süre: {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
</span>
) : (
<span className="text-sm text-red-400">Süre doldu, yeni kod iste.</span>
)}
</div>

<form onSubmit={handleVerifyCode} noValidate className="space-y-5">
<div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleDigitPaste}>
{codeDigits.map((digit, i) => (
<input
key={i}
ref={(el) => (digitRefs.current[i] = el)}
type="text"
inputMode="numeric"
value={digit}
onChange={(e) => handleDigitChange(i, e.target.value)}
onKeyDown={(e) => handleDigitKeyDown(i, e)}
disabled={timeLeft <= 0}
maxLength={1}
className={`w-9 h-11 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-slate-900/60 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-40 ${
digit ? 'border-emerald-500/60 focus:ring-emerald-500/50' : 'border-slate-800 focus:ring-emerald-500/50'
}`}
/>
))}
</div>

<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={timeLeft <= 0}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
Devam Et
</motion.button>

{timeLeft <= 0 ? (
<button
type="button"
onClick={handleSendCode}
disabled={loading}
className="w-full text-sm text-emerald-400 hover:text-emerald-300 transition"
>
{loading ? 'Gönderiliyor...' : 'Yeni kod gönder'}
</button>
) : (
<button
type="button"
onClick={() => setStep(1)}
className="w-full text-sm text-slate-400 hover:text-white transition"
>
← E-postayı değiştir
</button>
)}
</form>
</motion.div>
)}

{step === 3 && (
<motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
<div className="text-center mb-6">
<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-3">
<span className="text-xl sm:text-2xl">🔑</span>
</div>
<h2 className="text-xl sm:text-2xl font-bold text-white">Yeni şifre belirle</h2>
<p className="text-slate-500 text-xs sm:text-sm mt-2">Yeni şifreni gir ve onayla.</p>
</div>
<form onSubmit={handleResetPassword} noValidate className="space-y-4">
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Yeni Şifre</label>
<PasswordInput
value={newPassword}
onChange={(e) => setNewPassword(e.target.value)}
placeholder="••••••••"
/>
<PasswordStrength password={newPassword} />
</div>
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Şifreyi Onayla</label>
<PasswordInput
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
placeholder="••••••••"
/>
</div>
<motion.button
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
</motion.button>
</form>
</motion.div>
)}
</AnimatePresence>
</div>

<p className="text-center text-sm text-slate-400 mt-6">
<Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
← Girişe dön
</Link>
</p>
</div>
</div>
);
}

export default ForgotPasswordPage;








