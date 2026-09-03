import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AchievementBadge from './AchievementBadge';
import { achievementApi } from '../../api/achievementApi';

const TIER_ORDER = ['Beginner', 'Amateur', 'Pro', 'SuperAthlete'];
const TIER_LABELS = {
Beginner: '🥉 Başlangıç',
Amateur: '🥈 Amatör',
Pro: '🥇 Pro',
SuperAthlete: '👑 Süper Atlet',
};

function AchievementsTab() {
const [achievements, setAchievements] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
achievementApi.getMine()
.then((res) => setAchievements(res.data))
.catch(() => toast.error('Başarımlar yüklenemedi.'))
.finally(() => setLoading(false));
}, []);

if (loading) {
return <p className="text-slate-500 text-sm text-center py-10">Yükleniyor...</p>;
}

const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

return (
<div className="px-4 py-4">
<div className="mb-6 text-center">
<p className="text-2xl font-bold text-white">{unlockedCount} / {achievements.length}</p>
<p className="text-xs text-slate-500">başarım açıldı</p>
</div>

{TIER_ORDER.map((tier) => {
const tierAchievements = achievements.filter((a) => a.tier === tier);
if (tierAchievements.length === 0) return null;

return (
<div key={tier} className="mb-8">
<h3 className="text-sm font-semibold text-slate-300 mb-4">{TIER_LABELS[tier]}</h3>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
{tierAchievements.map((a) => (
<AchievementBadge
key={a.key}
sport={a.sport}
tier={a.tier}
title={a.title}
description={a.description}
unit={a.unit}
threshold={a.threshold}
progress={a.currentProgress}
isUnlocked={a.isUnlocked}
/>
))}
</div>
</div>
);
})}
</div>
);
}

export default AchievementsTab;





