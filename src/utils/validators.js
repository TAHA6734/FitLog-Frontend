// Sadece bilinen mail sağlayıcılarına izin veriyoruz.
// Kendi şirket/kurum mailini (örn. otokar.com.tr) test etmek istersen,
// bu listeye tek satır ekleyip build almanız yeterli.
export const ALLOWED_EMAIL_DOMAINS = [
// Google
'gmail.com', 'googlemail.com',
// Microsoft
'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'hotmail.com.tr', 'outlook.com.tr', 'live.com.tr',
// Yahoo
'yahoo.com', 'yahoo.com.tr', 'ymail.com',
// Apple
'icloud.com', 'me.com', 'mac.com',
// Diğer yaygın sağlayıcılar
'protonmail.com', 'proton.me', 'yandex.com', 'yandex.com.tr',
'mail.com', 'aol.com', 'gmx.com', 'zoho.com',
// Türkiye'de yaygın operatör/portal mailleri
'mynet.com', 'hotmail.com.tr', 'turk.net', 'superonline.com', 'ttmail.com',
];

// Bu son eklere sahip domainler (üniversite/kurum eğitim mailleri) genel kural olarak kabul edilir
const ALLOWED_EMAIL_SUFFIXES = ['.edu', '.edu.tr', '.k12.tr'];

function isAllowedEmailDomain(domain) {
const lower = domain.toLowerCase();
if (ALLOWED_EMAIL_DOMAINS.includes(lower)) return true;
return ALLOWED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

export const validators = {
email: {
regex: /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}$/,
maxLength: 255,
message: 'Geçerli bir e-posta adresi girin (örn. ornek@gmail.com).',
domainMessage: 'Bu mail sağlayıcısı desteklenmiyor. Lütfen gmail, hotmail, outlook, yahoo, icloud gibi bilinen bir sağlayıcı veya kurumsal/üniversite (.edu) maili kullan.',
},

username: {
regex: /^[a-zA-Z0-9_]+$/,
minLength: 3,
maxLength: 30,
message: 'Kullanıcı adı 3-30 karakter olmalı, sadece harf/rakam/alt çizgi içerebilir.',
},

password: {
regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
minLength: 6,
maxLength: 100,
message: 'Şifre 6-100 karakter olmalı, büyük/küçük harf ve rakam içermeli.',
},
};

function extractEmailParts(email) {
const [localPart, domain] = email.split('@');
return { localPart, domain };
}

export function validateField(type, value) {
const rule = validators[type];
if (!rule) return null;

if (!value || value.trim().length === 0) {
return 'Bu alan boş bırakılamaz.';
}

if (rule.minLength && value.length < rule.minLength) {
return `${rule.minLength} karakterden az olamaz.`;
}

if (rule.maxLength && value.length > rule.maxLength) {
return `${rule.maxLength} karakterden fazla olamaz.`;
}

if (!rule.regex.test(value)) {
return rule.message;
}

if (type === 'email') {
const { localPart, domain } = extractEmailParts(value);

if (!localPart || localPart.length > 64) {
return validators.email.message;
}
if (!domain || !domain.includes('.')) {
return validators.email.message;
}
if (!isAllowedEmailDomain(domain)) {
return validators.email.domainMessage;
}
}

return null;
}

export function isValidEmail(email) {
if (!email || email.length > validators.email.maxLength) return false;
if (!validators.email.regex.test(email)) return false;

const { localPart, domain } = extractEmailParts(email);
if (!localPart || localPart.length > 64) return false;
if (!domain || !domain.includes('.')) return false;
if (!isAllowedEmailDomain(domain)) return false;

return true;
}

export function isValidUsername(username) {
if (!username) return false;
if (username.length < validators.username.minLength || username.length > validators.username.maxLength) return false;
return validators.username.regex.test(username);
}

export function isValidPassword(password) {
if (!password) return false;
if (password.length < validators.password.minLength || password.length > validators.password.maxLength) return false;
return validators.password.regex.test(password);
}
