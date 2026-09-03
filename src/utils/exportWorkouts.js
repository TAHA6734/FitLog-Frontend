import { workoutApi } from '../api/workoutApi';

const TYPE_LABELS = { 0: 'Koşu', 1: 'Ağırlık', 2: 'Yüzme', 3: 'Bisiklet', 4: 'Yoga', 5: 'Diğer' };

function escapeCsvValue(value) {
if (value === null || value === undefined) return '';
const str = String(value);
if (str.includes(',') || str.includes('"') || str.includes('\n')) {
return `"${str.replace(/"/g, '""')}"`;
}
return str;
}

export async function exportWorkoutsToCSV() {
const res = await workoutApi.getMyWorkouts();
const workouts = res.data || [];

const headers = ['Tarih', 'Tür', 'Açıklama', 'Mesafe (km)', 'Süre', 'Ağırlık (kg)', 'Tekrar', 'Set', 'Mesafe (m)', 'Odak Alanı'];
const rows = workouts.map((w) => [
new Date(w.createdAt).toLocaleDateString('tr-TR'),
TYPE_LABELS[w.type] ?? 'Bilinmeyen',
w.description ?? '',
w.distance ?? '',
w.duration ? w.duration.slice(0, 5) : '',
w.weightKg ?? '',
w.reps ?? '',
w.sets ?? '',
w.distanceMeters ?? '',
w.focusArea ?? '',
]);

const csvContent = [headers, ...rows]
.map((row) => row.map(escapeCsvValue).join(','))
.join('\n');

const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `fitlog-antrenmanlarim-${new Date().toISOString().slice(0, 10)}.csv`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
}
