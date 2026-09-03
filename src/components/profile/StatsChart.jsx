import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatShortDate(isoString) {
return new Date(isoString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function StatsChart({ workouts }) {
// Son 7 antrenmanı tarihe göre sırala, grafik verisi oluştur.
// NOT: X ekseni dataKey'i olarak ham createdAt (benzersiz) kullanılıyor.
// Aynı gün içinde birden fazla antrenman varsa görünen etiketler ("11 Ağu")
// birbirinin aynı olabiliyor, bu da Recharts'ın tooltip/nokta eşleştirmesini
// (etiket bazlı arama yaptığı için) yanlış veriye yönlendiriyordu.
// Ham timestamp'i anahtar olarak kullanmak bu çakışmayı bitiriyor.
const chartData = [...workouts]
.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
.slice(-7)
.map((w) => ({
date: w.createdAt, // benzersiz anahtar (eşleştirme için)
mesafe: w.distance || 0,
}));

if (chartData.length === 0) {
return (
<div className="flex items-center justify-center h-48 text-slate-500 text-sm">
Henüz grafik oluşturacak veri yok.
</div>
);
}

return (
<div className="h-48 w-full">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
<XAxis
dataKey="date"
tickFormatter={formatShortDate}
tick={{ fill: '#64748b', fontSize: 11 }}
axisLine={{ stroke: '#1e293b' }}
/>
<YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} unit="km" />
<Tooltip
labelFormatter={formatShortDate}
contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '13px' }}
labelStyle={{ color: '#e2e8f0' }}
itemStyle={{ color: '#34d399' }}
/>
<Line
type="monotone"
dataKey="mesafe"
stroke="#34d399"
strokeWidth={2.5}
dot={{ fill: '#34d399', r: 4 }}
activeDot={{ r: 6 }}
/>
</LineChart>
</ResponsiveContainer>
</div>
);
}

export default StatsChart;
