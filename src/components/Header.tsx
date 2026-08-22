import React, { useState, useEffect } from 'react';
import { Eye, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onOpenPrivacy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [totalVisits, setTotalVisits] = useState<number>(24680);

  useEffect(() => {
    let sessionId = '';
    let isNew = false;
    try {
      sessionId = sessionStorage.getItem('ea_visit_sess') || '';
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('ea_visit_sess', sessionId);
        isNew = true;
      }
    } catch {
      sessionId = `sess_${Date.now()}`;
    }

    const fetchStats = async (isNewVisit: boolean) => {
      try {
        const query = new URLSearchParams({
          sessionId,
          isNew: isNewVisit ? 'true' : 'false',
        });
        const res = await fetch(`/api/visitor-stats?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.activeUsers === 'number') {
            setActiveUsers(Math.max(1, data.activeUsers));
          }
          if (typeof data.totalVisits === 'number') {
            setTotalVisits(data.totalVisits);
          }
        }
      } catch {
        // silent fallback
      }
    };

    fetchStats(isNew);
    const interval = setInterval(() => {
      fetchStats(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-850 px-3 sm:px-4 py-2 transition-all w-full select-none"
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Clean Brand Logo */}
        <div
          onClick={onReset}
          className="flex items-center gap-2 cursor-pointer group select-none min-w-0"
          title="Enhance Your Photo"
        >
          <div
            id="logo-icon"
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-750 shrink-0 group-hover:border-amber-400/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap flex items-center gap-1">
              <span>Enhance</span>
              <span className="text-amber-400 font-extrabold">
                Your Photo
              </span>
            </span>
          </div>
        </div>

        {/* Right: Compact Live User & Visit Counter Mini Box */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            id="visitor-stats-minibox"
            className="flex items-center gap-1.5 sm:gap-2.5 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg text-[10px] sm:text-xs"
          >
            {/* Online Counting */}
            <div
              className="flex items-center gap-1 text-neutral-200 font-medium"
              title="Users currently using this site online"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{activeUsers}</span>
              <span className="text-[9px] text-neutral-400 hidden xs:inline">online</span>
            </div>

            {/* Divider */}
            <div className="h-3 w-px bg-neutral-750" />

            {/* Total Visits Counting */}
            <div
              className="flex items-center gap-1 text-neutral-300 font-medium"
              title="Total visits to this site"
            >
              <Eye className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="font-mono font-bold text-amber-300">{formatNumber(totalVisits)}</span>
              <span className="text-[9px] text-neutral-400 hidden sm:inline">visits</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

