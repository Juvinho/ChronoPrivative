'use client';

import React, { useState, useMemo } from 'react';
import { Clock, ChevronRight } from 'lucide-react';

interface ArchivesWidgetProps {
  archives?: string[];
  onArchiveSelect?: (archive: string) => void;
}

// Sample data: "October 2023", "September 2023", etc.
const DEFAULT_ARCHIVES = [
  'October 2023',
  'September 2023',
  'August 2023',
  'July 2023',
  'June 2023',
  'May 2023',
  'April 2023',
  'March 2023',
  'February 2023',
  'January 2023',
  'December 2022',
  'November 2022',
];

interface ArchiveGroup {
  year: string;
  months: string[];
  shouldCollapse: boolean;
}

export default function ArchivesWidget({
  archives = DEFAULT_ARCHIVES,
  onArchiveSelect,
}: ArchivesWidgetProps) {
  // Parse archives into grouped structure
  const groupedArchives = useMemo((): ArchiveGroup[] => {
    const groups = new Map<string, string[]>();

    archives.forEach(archive => {
      // Format: "October 2023" -> extract year
      const parts = archive.split(' ');
      const year = parts[parts.length - 1];

      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(archive);
    });

    // Convert to array and determine collapse state
    const result: ArchiveGroup[] = Array.from(groups.entries())
      .map(([year, months]) => ({
        year,
        months: months.sort(),
        shouldCollapse: months.length >= 5,
      }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Newest first

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
                      key={month}
                      onClick={() => handleMonthClick(month)}
                      className="w-full text-left flex items-center justify-between text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors group text-xs"
                    >
                      <span>{month}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </ul>

      {/* Empty State */}
      {groupedArchives.length === 0 && (
        <p className="text-xs text-[var(--theme-text-secondary)] italic">
          Nenhum arquivo disponível
        </p>
      )}
    </div>
  );
}
