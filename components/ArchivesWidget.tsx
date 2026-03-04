'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Clock, ChevronRight } from 'lucide-react';

interface ArchiveEntry {
  month: string; // ISO date string from backend, e.g. "2023-10-01T00:00:00.000Z"
  total: number;
}

interface ArchivesWidgetProps {
  archives?: ArchiveEntry[];
  onArchiveSelect?: (archive: string) => void;
}

interface ArchiveGroup {
  year: string;
  months: { label: string; isoDate: string }[];
  shouldCollapse: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatMonthLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function ArchivesWidget({
  archives: propArchives,
  onArchiveSelect,
}: ArchivesWidgetProps) {
  const [archives, setArchives] = useState<ArchiveEntry[]>(propArchives ?? []);
  const [loading, setLoading] = useState(!propArchives);

  useEffect(() => {
    if (propArchives) {
      setArchives(propArchives);
      return;
    }

    const fetchArchives = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/posts/archives`);
        if (!response.ok) {
          console.error(`[ArchivesWidget] Erro HTTP ${response.status} ao carregar archives`);
          return;
        }
        const data = await response.json();
        setArchives(data.data ?? []);
      } catch (err) {
        console.error('[ArchivesWidget] Erro ao carregar archives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [propArchives]);

  // Parse archives into grouped structure — sort by date descending (BUG 3)
  const groupedArchives = useMemo((): ArchiveGroup[] => {
    const groups = new Map<string, { label: string; isoDate: string }[]>();

    // Backend already returns ORDER BY month DESC, but we sort again for safety
    const sorted = [...archives].sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    );

    sorted.forEach(entry => {
      const d = new Date(entry.month);
      const year = String(d.getUTCFullYear());
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push({ label: formatMonthLabel(entry.month), isoDate: entry.month });
    });

    const result: ArchiveGroup[] = Array.from(groups.entries())
      .map(([year, months]) => ({
        year,
        // months are already date-sorted (newest first within each year)
        months,
        shouldCollapse: months.length >= 5,
      }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Newest year first

    return result;
  }, [archives]);

  // Track expanded/collapsed state
  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => {
    const initiallyExpanded = new Set<string>();
    // By default, all years are collapsed
    groupedArchives.forEach(group => {
      if (!group.shouldCollapse) {
        initiallyExpanded.add(group.year);
      }
    });
    return initiallyExpanded;
  });

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  const handleMonthClick = (month: string) => {
    onArchiveSelect?.(month);
  };

  return (
    <div className="bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] p-5 rounded-sm">
      <h3 className="font-bold text-[var(--theme-text-light)] mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[var(--theme-primary)]" />
        Archives
      </h3>

      {loading ? (
        <div className="text-xs text-[var(--theme-text-secondary)] animate-pulse">
          Carregando arquivos...
        </div>
      ) : (
      <ul className="space-y-2 text-sm">
        {groupedArchives.map(group => {
          const isExpanded = expandedYears.has(group.year);
          const canCollapse = group.shouldCollapse;

          return (
            <div key={group.year}>
              {/* Year Header */}
              {canCollapse ? (
                <button
                  onClick={() => toggleYear(group.year)}
                  className="w-full flex items-center justify-between text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors group"
                  title={`${isExpanded ? 'Colapso' : 'Expandir'} ${group.year}`}
                >
                  <span className="font-semibold">{group.year}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              ) : (
                <div className="font-semibold text-[var(--theme-text-secondary)]">
                  {group.year}
                </div>
              )}

              {/* Months List */}
              {(isExpanded || !canCollapse) && (
                <div className="ml-4 mt-1 space-y-1">
                  {group.months.map(month => (
                    <button
                      key={month.isoDate}
                      onClick={() => handleMonthClick(month.label)}
                      className="w-full text-left flex items-center justify-between text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors group text-xs"
                    >
                      <span>{month.label}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </ul>
      )}

      {/* Empty State */}
      {!loading && groupedArchives.length === 0 && (
        <p className="text-xs text-[var(--theme-text-secondary)] italic">
          Nenhum arquivo disponível
        </p>
      )}
    </div>
  );
}
