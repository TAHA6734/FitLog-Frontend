import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from '../components/ui/PasswordStrength';
import PasswordInput from '../components/ui/PasswordInput';
import FieldValidationIcon from '../components/ui/FieldValidationIcon';
import { validateField, isValidEmail, isValidUsername } from '../utils/validators';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1200&auto=format&fit=crop';
const REGISTER_IMAGE = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop';

function AuthPage() {
const location = useLocation();
const isLogin = location.pathname === '/login';

const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [agreed, setAgreed] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError('');

const emailError = validateField('email', email);
if (emailError) {
setError(emailError);
toast.error(emailError);
return;
}

if (!isLogin) {
const usernameError = validateField('username', username);
if (usernameError) {
setError(usernameError);
toast.error(usernameError);
return;
}

const passwordError = validateField('password', password);
if (passwordError) {
setError(passwordError);
toast.error(passwordError);
return;
}

if (!agreed) {
setError('Devam etmek için kullanım şartlarını kabul etmelisin.');
toast.error('Kullanım şartlarını kabul etmelisin.');
return;
}
} else {
if (!password) {
setError('Şifre alanı boş bırakılamaz.');
return;
}
}

setLoading(true);

try {
const response = isLogin
? await authApi.login({ email, password })
: await authApi.register({ username, email, password });

login(response.data);
toast.success(isLogin ? 'Tekrar hoş geldin!' : 'Hesabın oluşturuldu!');

if (isLogin && response.data.hasCompletedOnboarding) {
navigate('/feed');
} else {
navigate('/onboarding');
}
} catch (err) {
const message = err.response?.data?.message || 'Bir hata oluştu, bilgilerini kontrol et.';
setError(message);
toast.error(message);
} finally {
setLoading(false);
}
};

const handleGoogleSuccess = async (credentialResponse) => {
setError('');
setLoading(true);

try {
const response = await authApi.googleLogin(credentialResponse.credential);
login(response.data);
toast.success('Google ile giriş başarılı!');

if (response.data.hasCompletedOnboarding) {
navigate('/feed');
} else {
navigate('/onboarding');
}
} catch (err) {
const message = err.response?.data?.message || 'Google ile giriş yapılamadı.';
setError(message);
toast.error(message);
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen flex overflow-hidden bg-slate-950 relative">
<div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
<div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

<motion.div
layout
transition={{ type: 'spring', stiffness: 200, damping: 28 }}
className={`hidden lg:block lg:w-1/2 relative ${isLogin ? 'order-1' : 'order-2'}`}
>
<AnimatePresence mode="wait">
<motion.img
key={isLogin ? 'login-img' : 'register-img'}
src={isLogin ? LOGIN_IMAGE : REGISTER_IMAGE}
alt=""
initial={{ opacity: 0, scale: 1.05 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 1.05 }}
transition={{ duration: 0.5 }}
className="w-full h-full object-cover absolute inset-0"
/>
</AnimatePresence>
<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
<div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

<div className="absolute top-10 left-12 flex items-center gap-2">
<img src="/logo.png" alt="FitLog" className="w-7 h-7 object-contain" />
<span className="text-white font-bold text-lg tracking-tight">FitLog</span>
</div>

<AnimatePresence mode="wait">
<motion.div
key={isLogin ? 'login-text' : 'register-text'}
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -16 }}
transition={{ duration: 0.35 }}
className="absolute bottom-12 left-12 right-12"
>
<div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1 mb-4">
<span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
<span className="text-emerald-300 text-xs font-semibold">50+ sporcu her gün paylaşıyor</span>
</div>
<h2 className="text-white text-4xl font-bold mb-3 leading-tight drop-shadow-lg">
{isLogin ? 'Her adım bir hikaye.' : 'Yolculuğuna bugün başla.'}
</h2>
<p className="text-slate-300 text-base">
{isLogin ? 'Antrenmanını paylaş, topluluğunla bağlan.' : 'Binlerce sporcuya katıl, hedeflerine birlikte ulaşın.'}
</p>
</motion.div>
</AnimatePresence>
</motion.div>

<motion.div
layout
transition={{ type: 'spring', stiffness: 200, damping: 28 }}
className={`w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-6 py-8 sm:py-12 relative z-10 ${isLogin ? 'order-2' : 'order-1'}`}
>
<div className="w-full max-w-sm">
<h1 className="lg:hidden text-2xl font-bold text-white mb-1 flex items-center gap-1.5">
<img src="/logo.png" alt="FitLog" className="w-6 h-6 object-contain" />
Fit<span className="text-emerald-400">Log</span>
</h1>

<AnimatePresence mode="wait">
<motion.div
key={isLogin ? 'login-form' : 'register-form'}
initial={{ opacity: 0, x: isLogin ? 24 : -24 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: isLogin ? -24 : 24 }}
transition={{ duration: 0.3 }}
>
<div className="mt-4 lg:mt-0 mb-6">
<h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
{isLogin ? 'Tekrar hoş geldin' : 'Hemen başla'}
</h2>
<p className="text-slate-500 text-sm mt-1.5">
{isLogin ? 'Hesabına erişmek için bilgilerini gir.' : 'Ücretsiz hesabını oluştur.'}
</p>
</div>

{error && (
<motion.div
initial={{ opacity: 0, y: -8 }}
animate={{ opacity: 1, y: 0 }}
className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-4"
>
{error}
</motion.div>
)}

<form onSubmit={handleSubmit} noValidate className="space-y-4">
{!isLogin && (
<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Kullanıcı adı</label>
<div className="relative">
<input
type="text"
value={username}
onChange={(e) => setUsername(e.target.value)}
maxLength={30}
className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
placeholder="kullaniciadi"
/>
<FieldValidationIcon show={username.length > 0} isValid={isValidUsername(username)} />
</div>
</div>
)}

<div>
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">E-posta adresi</label>
<div className="relative">
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
maxLength={255}
className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
placeholder="ornek@mail.com"
/>
<FieldValidationIcon show={email.length > 0} isValid={isValidEmail(email)} />
</div>
</div>

<div>
<div className="flex items-center justify-between mb-1.5">
<label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Şifre</label>
{isLogin && (
<button
type="button"
onClick={() => navigate('/forgot-password')}
className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
>
Şifremi unuttum
</button>
)}
</div>
<PasswordInput
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder={isLogin ? '••••••••' : 'En az 6 karakter'}
/>
{!isLogin && <PasswordStrength password={password} />}
</div>

{!isLogin && (
<label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
<input
type="checkbox"
checked={agreed}
onChange={(e) => setAgreed(e.target.checked)}
className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
/>
<span>Kullanım şartlarını ve gizlilik politikasını kabul ediyorum.</span>
</label>
)}

<motion.button
whileHover={{ scale: 1.01 }}
whileTap={{ scale: 0.98 }}
type="submit"
disabled={loading}
className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl py-3 transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
>
{loading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
</motion.button>
</form>

<div className="relative my-6">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-slate-800"></div>
</div>
<div className="relative flex justify-center text-xs">
<span className="bg-slate-950 px-3 text-slate-500">veya</span>
</div>
</div>

<div className="flex justify-center">
<GoogleLogin
onSuccess={handleGoogleSuccess}
onError={() => {
setError('Google ile giriş başarısız oldu.');
toast.error('Google ile giriş başarısız oldu.');
}}
theme="filled_black"
shape="pill"
width="320"
/>
</div>

<p className="text-center text-sm text-slate-400 mt-6">
{isLogin ? (
<>Hesabın yok mu?{' '}
<button onClick={() => navigate('/register')} className="text-emerald-400 hover:text-emerald-300 font-medium">
Kayıt Ol
</button>
</>
) : (
<>Zaten hesabın var mı?{' '}
<button onClick={() => navigate('/login')} className="text-emerald-400 hover:text-emerald-300 font-medium">
Giriş Yap
</button>
</>
)}
</p>
</motion.div>
</AnimatePresence>
</div>
</motion.div>
</div>
);
}

export default AuthPage;

