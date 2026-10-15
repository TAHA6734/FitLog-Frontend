// Dakikayı .NET TimeSpan biçimine çevirir: "[g.]ss:dd:00"
export function minutesToTimeSpan(value) {
  const total = parseInt(value, 10);
  if (!Number.isFinite(total) || total <= 0) return null;

  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const minutes = total % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return days > 0 ? `${days}.${hh}:${mm}:00` : `${hh}:${mm}:00`;
}