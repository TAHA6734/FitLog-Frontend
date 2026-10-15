import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '../components/layout/PageLayout';
import LeaderboardWidget from '../components/feed/LeaderboardWidget';
import WorkoutPartnersWidget from '../components/feed/WorkoutPartnersWidget';
import SearchWidget from '../components/feed/SearchWidget';
import SubscribeWidget from '../components/feed/SubscribeWidget';
import { SkeletonBox, SkeletonAvatar } from '../components/ui/Skeleton';
import { leaderboardApi } from '../api/userApi';

const TABS = [
  { key: 'distance', label: 'Mesafe' },
  { key: 'streak', label: 'Streak' },
  { key: 'score', label: 'Gelişim Skoru' },
];

const TOP3_STYLES = {
  0: { grad: 'from-yellow-400/25 to-amber-600/5', border: 'border-yellow-500/30', ring: 'ring-yellow-400/40', text: 'text-yellow-400', glow: 'shadow-[0_0_24px_rgba(250,204,21,0.15)]', medal: '🥇' },
  1: { grad: 'from-slate-300/20 to-slate-500/5', border: 'border-slate-400/30', ring: 'ring-slate-300/40', text: 'text-slate-300', glow: 'shadow-[0_0_18px_rgba(203,213,225,0.1)]', medal: '🥈' },
  2: { grad: 'from-orange-400/20 to-orange-700/5', border: 'border-orange-500/30', ring: 'ring-orange-400/40', text: 'text-orange-400', glow: 'shadow-[0_0_18px_rgba(251,146,60,0.12)]', medal: '🥉' },
};

const FETCHERS = {
  distance: leaderboardApi.getDistance,
  streak: leaderboardApi.getStreak,
  score: leaderboardApi.getDevelopmentScore,
};

const EMPTY_MESSAGES = {
  distance: 'Bu hafta henüz kimse antrenman paylaşmadı.',
  streak: 'Henüz aktif bir streak yok.',
  score: 'Bu hafta gelişim skoru hesaplanacak yeterli veri yok.',
};

function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-800">
      <SkeletonBox className="w-6 h-5" />
      <SkeletonAvatar className="w-9 h-9 sm:w-10 sm:h-10" />
      <SkeletonBox className="h-3.5 flex-1" />
      <SkeletonBox className="h-3.5 w-12" />
    </div>
  );
}

function LeaderboardPage() {
  const [tab, setTab] = useState('distance');
  // Gelen veri hangi sekmeye aitse onunla birlikte saklanır; böylece sekme
  // değişince başka sekmenin (farklı şekilli) verisi yanlışlıkla çizilmez.
  const [result, setResult] = useState({ tab: 'distance', entries: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const entries = result.tab === tab ? result.entries : [];
  const isLoading = loading || result.tab !== tab;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    FETCHERS[tab]()
      .then((res) => {
        if (cancelled) return;
        setResult({ tab, entries: Array.isArray(res.data) ? res.data : [] });
      })
      .catch(() => {
        if (!cancelled) toast.error('Liderlik tablosu yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Hızlı sekme geçişlerinde eski isteğin yanıtı yenisinin üstüne yazmasın
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const formatValue = (entry) => {
    if (tab === 'distance') return `${(entry.value ?? 0).toFixed(1)} km`;
    if (tab === 'streak') return `${entry.value ?? 0} gün 🔥`;
    return `${Math.round((entry.score ?? 0) * 100)}%`;
  };

  const scoreBreakdown = (entry) => {
    const distance = entry.totalDistanceKm ?? 0;
    const activeDays = entry.activeDayCount ?? 0;
    const pace = entry.paceImprovement ?? 0;
    const elevation = entry.elevationGainMeters ?? 0;
    const variety = entry.sportVarietyCount ?? 0;
    const paceSign = pace >= 0 ? '+' : '';
    return `${distance.toFixed(1)} km · ${activeDays} gün · ${paceSign}${pace.toFixed(2)} dk/km · ${Math.round(elevation)} m · ${variety} branş`;
  };

  return (
    <PageLayout
      rightPanel={
        <div className="space-y-4">
          <SearchWidget />
          <SubscribeWidget />
          <LeaderboardWidget />
          <WorkoutPartnersWidget />
        </div>
      }
    >
      <div className="sticky top-0 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-3 z-10">
        <h1 className="text-lg font-bold text-white mb-3 flex items-center gap-1.5">
          <span className="text-yellow-400">🏆</span> Liderlik Tablosu
        </h1>
        <div className="relative flex bg-slate-900/80 border border-slate-800 rounded-full p-1 text-sm w-fit overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="relative px-4 py-1.5 rounded-full font-medium whitespace-nowrap shrink-0"
            >
              {tab === t.key && (
                <motion.span
                  layoutId="leaderboardPill"
                  className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <span className={`relative z-10 ${tab === t.key ? 'text-slate-950' : 'text-slate-400'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
        {tab === 'score' && (
          <p className="text-[11px] text-slate-500 mt-2">
            AHP ile ağırlıklandırılmış, TOPSIS ile sıralanan çok kriterli haftalık gelişim skoru (mesafe, istikrar, tempo gelişimi, irtifa, branş çeşitliliği).
          </p>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {isLoading ? (
          <div className="space-y-2">
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <p>{EMPTY_MESSAGES[tab]}</p>
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-4 sm:mb-5">
                {top3.map((entry, i) => {
                  const style = TOP3_STYLES[i];
                  const isFirst = i === 0;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      onClick={() => navigate(`/profile/${entry.userId}`)}
                      className={`flex flex-col items-center text-center rounded-2xl border ${style.border} bg-gradient-to-b ${style.grad} ${style.glow} px-1.5 sm:px-2 py-3 sm:py-4 cursor-pointer ${isFirst ? 'order-2 -mt-2 pb-4 sm:pb-5' : i === 1 ? 'order-1' : 'order-3'}`}
                    >
                      <span className="text-base sm:text-lg mb-1">{style.medal}</span>
                      <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ring-2 ${style.ring} bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm sm:text-lg overflow-hidden`}>
                        {entry.profilePhotoUrl ? (
                          <img src={entry.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          entry.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white mt-1.5 sm:mt-2 truncate w-full">{entry.username}</p>
                      <p className={`text-[10px] sm:text-xs font-bold mt-0.5 ${style.text}`}>{formatValue(entry)}</p>
                      {tab === 'score' && (
                        <p className="text-[8px] sm:text-[9px] text-slate-500 mt-1 leading-tight">{scoreBreakdown(entry)}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry, i) => (
                  <div
                    key={entry.userId}
                    onClick={() => navigate(`/profile/${entry.userId}`)}
                    className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <span className="w-5 sm:w-7 text-sm font-bold text-center text-slate-500 shrink-0">
                      {i + 4}
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold overflow-hidden shrink-0">
                      {entry.profilePhotoUrl ? (
                        <img src={entry.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        entry.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{entry.username}</p>
                      {tab === 'score' && (
                        <p className="text-[10px] text-slate-500 truncate">{scoreBreakdown(entry)}</p>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-400 shrink-0">
                      {formatValue(entry)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default LeaderboardPage;