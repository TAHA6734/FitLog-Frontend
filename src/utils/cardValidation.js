export function luhnCheck(cardNumber) {
const digits = cardNumber.replace(/\s/g, '');
if (!/^\d{13,19}$/.test(digits)) return false;

let sum = 0;
let alternate = false;
for (let i = digits.length - 1; i >= 0; i--) {
let n = parseInt(digits[i], 10);
if (alternate) {
n *= 2;
if (n > 9) n -= 9;
}
sum += n;
alternate = !alternate;
}
return sum % 10 === 0;
}

export function formatCardNumber(value) {
const digits = value.replace(/\D/g, '').slice(0, 19);
return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function detectCardBrand(cardNumber) {
const digits = cardNumber.replace(/\s/g, '');
if (/^4/.test(digits)) return 'Visa';
if (/^5[1-5]/.test(digits)) return 'Mastercard';
if (/^(9792|9793)/.test(digits)) return 'Troy';
return null;
}



