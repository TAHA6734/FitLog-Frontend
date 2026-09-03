// Gerçek bir ses dosyası olmadan, Web Audio API ile ~1 saniyelik kısa bir
// "taç giyme fanfarı" sentezliyoruz: 3 yükselen nota + son notada tutulan akor.
export function playAchievementSound() {
try {
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioCtx();
const now = ctx.currentTime;

const notes = [
{ freq: 523.25, start: 0, duration: 0.15 }, // C5
{ freq: 659.25, start: 0.15, duration: 0.15 }, // E5
{ freq: 783.99, start: 0.3, duration: 0.5 }, // G5 (tutulan final nota)
];

notes.forEach(({ freq, start, duration }) => {
const osc = ctx.createOscillator();
const gain = ctx.createGain();

osc.type = 'sawtooth';
osc.frequency.value = freq;

const startTime = now + start;
const endTime = startTime + duration;

gain.gain.setValueAtTime(0, startTime);
gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
gain.gain.linearRampToValueAtTime(0.18, startTime + duration * 0.6);
gain.gain.exponentialRampToValueAtTime(0.001, endTime);

const filter = ctx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 3000;

osc.connect(filter);
filter.connect(gain);
gain.connect(ctx.destination);

osc.start(startTime);
osc.stop(endTime + 0.05);
});

setTimeout(() => ctx.close(), 1200);
} catch {
// tarayıcı desteklemiyorsa sessizce geç
}
}

