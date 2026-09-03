import { useState, useRef, useEffect } from 'react';

const MONTHS = [
'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const DAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;
const PAD_COUNT = Math.floor(VISIBLE_COUNT / 2);

function pad(n) {
return String(n).padStart(2, '0');
}

function toLocalValue(date, hour, minute) {
if (!date) return '';
return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;
}

function isSameDay(a, b) {
return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Bugün için izin verilen en erken saat/dakikayı hesaplar. Bugün değilse kısıtlama yok.
function getMinTimeForDate(date, now) {
if (!isSameDay(date, now)) return { hour: 0, minute: 0 };

const nowH = now.getHours();
const nowM = now.getMinutes();
const nextMinute = MINUTE_OPTIONS.find((m) => m >= nowM);

if (nextMinute === undefined) {
return nowH >= 23 ? { hour: 23, minute: 55 } : { hour: nowH + 1, minute: 0 };
}
return { hour: nowH, minute: nextMinute };
}

// --- iPhone tarzı kaydırmalı (wheel) sütun ---
function WheelColumn({ values, selectedValue, onChange, formatLabel }) {
const containerRef = useRef(null);
const isProgrammaticScroll = useRef(false);
const scrollTimeoutRef = useRef(null);

useEffect(() => {
const container = containerRef.current;
if (!container) return;
const idx = values.indexOf(selectedValue);
if (idx === -1) return;
isProgrammaticScroll.current = true;
container.scrollTop = idx * ITEM_HEIGHT;
const t = setTimeout(() => { isProgrammaticScroll.current = false; }, 60);
return () => clearTimeout(t);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [values]);

const handleScroll = () => {
if (isProgrammaticScroll.current) return;
const container = containerRef.current;
if (!container) return;

clearTimeout(scrollTimeoutRef.current);
scrollTimeoutRef.current = setTimeout(() => {
const idx = Math.round(container.scrollTop / ITEM_HEIGHT);
const clamped = Math.max(0, Math.min(values.length - 1, idx));
const newVal = values[clamped];

container.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });

if (newVal !== selectedValue) {
onChange(newVal);
}
}, 100);
};

return (
<div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_COUNT, width: 76 }}>
<div
className="absolute left-0 right-0 bg-slate-800/70 rounded-xl pointer-events-none border-y-2 border-emerald-500/50"
style={{ top: PAD_COUNT * ITEM_HEIGHT, height: ITEM_HEIGHT }}
/>
<div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-slate-900 via-transparent to-slate-900 pointer-events-none z-10" />
<div
ref={containerRef}
onScroll={handleScroll}
className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden"
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'y mandatory' }}
>
<div style={{ height: PAD_COUNT * ITEM_HEIGHT }} />
{values.map((v) => (
<div
key={v}
className={`flex items-center justify-center text-lg font-semibold tabular-nums transition-colors ${
v === selectedValue ? 'text-white' : 'text-slate-600'
}`}
style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'center' }}
>
{formatLabel ? formatLabel(v) : pad(v)}
</div>
))}
<div style={{ height: PAD_COUNT * ITEM_HEIGHT }} />
</div>
</div>
);
}

function DateTimePicker({ value, onChange }) {
const [open, setOpen] = useState(false);
const [step, setStep] = useState('date'); // 'date' | 'time'
const [viewDate, setViewDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(null);
const [hour, setHour] = useState(12);
const [minute, setMinute] = useState(0);
const containerRef = useRef(null);

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

useEffect(() => {
if (!value) return;
const d = new Date(value);
setSelectedDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
setHour(d.getHours());
setMinute(d.getMinutes());
setViewDate(d);
}, []);

useEffect(() => {
const handleClickOutside = (e) => {
if (containerRef.current && !containerRef.current.contains(e.target)) {
setOpen(false);
}
};
document.addEventListener('mousedown', handleClickOutside);
return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const handleOpen = () => {
setStep('date');
setOpen(true);
};

const handleDayClick = (date) => {
const minTime = getMinTimeForDate(date, now);
const isCurrentBeforeMin = hour < minTime.hour || (hour === minTime.hour && minute < minTime.minute);

if (isCurrentBeforeMin) {
setHour(minTime.hour);
setMinute(minTime.minute);
}

setSelectedDate(date);
setStep('time');
};

const minTime = selectedDate ? getMinTimeForDate(selectedDate, now) : { hour: 0, minute: 0 };
const availableHours = Array.from({ length: 24 }, (_, h) => h).filter((h) => h >= minTime.hour);
const availableMinutes = MINUTE_OPTIONS.filter((m) => hour > minTime.hour || m >= minTime.minute);

const handleHourChange = (h) => {
setHour(h);
if (h === minTime.hour && minute < minTime.minute) {
setMinute(minTime.minute);
}
};

const handleConfirm = () => {
onChange(toLocalValue(selectedDate, hour, minute));
setOpen(false);
};

const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
const startOffset = (firstOfMonth.getDay() + 6) % 7;
const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

const cells = [];
for (let i = 0; i < startOffset; i++) cells.push(null);
for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));

const displayLabel = value
? (() => {
const d = new Date(value);
return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
})()
: 'Tarih ve saat seç';

return (
<div className="relative" ref={containerRef}>
<button
type="button"
onClick={handleOpen}
className="w-full flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-left transition hover:border-slate-600"
>
<span className={value ? 'text-white' : 'text-slate-500'}>{displayLabel}</span>
<svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
</button>

{open && (
<div className="absolute z-[1000] mt-2 w-full min-w-[280px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3.5">
{step === 'date' ? (
<>
<div className="flex items-center justify-between mb-3">
<button
type="button"
onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
</svg>
</button>
<span className="text-white text-sm font-semibold">
{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
</span>
<button
type="button"
onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
</svg>
</button>
</div>

<div className="grid grid-cols-7 gap-1 mb-1">
{DAYS.map((d) => (
<div key={d} className="text-center text-[10px] font-medium text-slate-500 py-1">
{d}
</div>
))}
</div>

<div className="grid grid-cols-7 gap-1">
{cells.map((date, i) => {
if (!date) return <div key={i} />;
const isPast = date < today;
const isSelected = isSameDay(date, selectedDate);
const isToday = isSameDay(date, today);
return (
<button
key={i}
type="button"
disabled={isPast}
onClick={() => handleDayClick(date)}
className={`aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center
${isPast ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800 cursor-pointer'}
${isSelected ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-500' : ''}
${isToday && !isSelected ? 'ring-1 ring-emerald-500/50' : ''}
`}
>
{date.getDate()}
</button>
);
})}
</div>
</>
) : (
<>
<div className="flex items-center gap-2 mb-4">
<button
type="button"
onClick={() => setStep('date')}
className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-medium transition p-1.5 -ml-1.5 rounded-lg hover:bg-slate-800"
>
<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
</svg>
Geri
</button>
<span className="text-white text-sm font-semibold flex-1 text-center pr-8">
{selectedDate && `${pad(selectedDate.getDate())} ${MONTHS[selectedDate.getMonth()]}`}
</span>
</div>

<p className="text-center text-xs text-slate-500 mb-2">Saat seç</p>

<div className="flex items-center justify-center gap-1">
<WheelColumn values={availableHours} selectedValue={hour} onChange={handleHourChange} />
<span className="text-white text-xl font-bold pb-0.5">:</span>
<WheelColumn values={availableMinutes} selectedValue={minute} onChange={setMinute} />
</div>

<button
type="button"
onClick={handleConfirm}
className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl py-2.5 transition"
>
Tamam
</button>
</>
)}
</div>
)}
</div>
);
}

export default DateTimePicker;
