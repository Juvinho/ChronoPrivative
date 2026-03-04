/**
 * @status PRÓXIMA FASE — v2
 * @decision D-01B (04/03/2026)
 * @reason Analytics só têm valor com histórico acumulado.
 *         Dados sendo coletados via posts.metadata.
 * @unblock Quando: decisão formal de v2 + mínimo de 30 dias de dados.
 * @ticket [link do ticket v2]
 */
'use client';

import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface MoodHeatmapProps {
  posts: Array<{ id: string; createdAt: string; mood?: string }>;
}

const MOODS = ['happy', 'sad', 'angry', 'calm', 'excited', 'nostalgic'];
const MOOD_COLORS: Record<string, string> = {
  happy: '#FFD700',
  sad: '#4169E1',
  angry: '#FF4500',
  calm: '#32CD32',
  excited: '#FF1493',
  nostalgic: '#9370DB',
};

const MOOD_LABELS: Record<string, string> = {
  happy: '😊 Feliz',
  sad: '😢 Triste',
  angry: '😠 Raivoso',
  calm: '😌 Calmo',
  excited: '🤩 Empolgado',
  nostalgic: '🥺 Nostálgico',
};

export default function MoodHeatmap({ posts }: MoodHeatmapProps) {
  // Calculate mood statistics
  const moodStats = useMemo(() => {
    const stats: Record<string, { count: number; percentage: number; color: string }> = {};
    
    MOODS.forEach(mood => {
      const count = posts.filter(p => p.mood === mood).length;
      stats[mood] = {
        count,
        percentage: posts.length > 0 ? (count / posts.length) * 100 : 0,
        color: MOOD_COLORS[mood],
      };
    });

    return stats;
  }, [posts]);

  // Get unique years and months
  const heatmapData = useMemo(() => {
    const data: Map<string, Map<string, number>> = new Map();

    posts.forEach(post => {
      if (!post.mood) return;

      const date = new Date(post.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!data.has(post.mood)) {
        data.set(post.mood, new Map());
      }

      const monthMap = data.get(post.mood)!;
      monthMap.set(yearMonth, (monthMap.get(yearMonth) || 0) + 1);
    });

    return data;
  }, [posts]);

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    heatmapData.forEach(monthMap => {
      monthMap.forEach((_, month) => monthSet.add(month));
    });
    return Array.from(monthSet).sort();
  }, [heatmapData]);

  const getIntensity = (count: number, max: number): number => {
    if (max === 0) return 0;
    return (count / max) * 100;
  };

  const maxCount = Math.max(
    ...Array.from(heatmapData.values()).flatMap(map => Array.from(map.values()))
  );

  const formatMonth = (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 size={24} className="text-[#9400FF]" />
        <h2 className="text-lg font-bold text-[#9400FF]">ANÁLISE DE HUMOR</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MOODS.map(mood => {
          const stat = moodStats[mood];
          return (
            <div
              key={mood}
              className="border border-[#9400FF] rounded p-3 bg-[#1A0B2E] hover:border-[#00FF00] transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#9400FF] text-sm">{MOOD_LABELS[mood]}</span>
                <span className="text-white font-bold">{stat.count}</span>
              </div>
              <div className="w-full h-2 bg-[#0A0015] rounded border border-[#9400FF]/30 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>

      {/* Timeline Heatmap */}
      {months.length > 0 && (
        <div className="space-y-3 border border-[#9400FF] rounded-lg p-4 bg-[#0A0015]/50">
          <h3 className="font-bold text-[#00FF00]">📊 CRONOGRAMA</h3>

          {MOODS.map(mood => {
            const monthMap = heatmapData.get(mood);
            if (!monthMap || monthMap.size === 0) return null;

            return (
              <div key={mood}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#9400FF] w-20">{MOOD_LABELS[mood]}</span>
                  <div className="flex-1 flex gap-1 flex-wrap">
                    {months.map(month => {
                      const count = monthMap.get(month) || 0;
                      const intensity = count > 0 ? getIntensity(count, maxCount) : 0;

                      return (
                        <div
                          key={month}
                          className="flex flex-col items-center cursor-help group"
                          title={`${formatMonth(month)}: ${count} post(s)`}
                        >
                          <div
                            className="w-6 h-6 rounded border border-[#9400FF]/50 transition-all group-hover:border-[#00FF00]"
                            style={{
                              backgroundColor: count > 0 ? MOOD_COLORS[mood] : '#0A0015',
                              opacity: intensity / 100 || 0.2,
                            }}
                          />
                          {count > 0 && (
                            <span className="text-xs font-bold text-gray-400 mt-1 group-hover:text-[#00FF00] transition-colors">
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#9400FF]/30 flex items-center justify-between text-xs text-gray-500">
            <span>Menos</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
                <div
                  key={opacity}
                  className="w-3 h-3 rounded border border-[#9400FF]/50"
                  style={{ backgroundColor: '#9400FF', opacity }}
                />
              ))}
            </div>
            <span>Mais</span>
          </div>
        </div>
      )}

      {/* No Data */}
      {posts.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[#9400FF] rounded text-gray-400">
          <p>Nenhum post com humor registrado ainda</p>
        </div>
      )}

      {/* Insights */}
      {posts.length > 0 && (
        <div className="p-4 bg-[#9400FF]/10 border border-[#9400FF]/30 rounded-lg space-y-2">
          <h4 className="font-bold text-[#00FF00] flex items-center gap-2">💡 INSIGHTS</h4>
          <div className="text-sm text-gray-300 space-y-1">
            {(() => {
              const topMood = MOODS.reduce((prev, curr) =>
                moodStats[curr].count > moodStats[prev].count ? curr : prev
              );
              const avgPostMonth = (posts.length / (months.length || 1)).toFixed(1);
              return (
                <>
                  <p>• Você tem {posts.length} posts no total</p>
                  <p>• Seu humor mais frequente é <span style={{ color: MOOD_COLORS[topMood] }} className="font-semibold">{MOOD_LABELS[topMood]}</span> ({moodStats[topMood].count} posts)</p>
                  <p>• Média de {avgPostMonth} posts por mês</p>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
