import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Users, Eye, Activity } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [totalVisits, setTotalVisits] = useState<number>(24680);

  useEffect(() => {
    // Generate or retrieve unique browser session
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
        // network error fallback
      }
    };

    // First call counts the visit session
    fetchStats(isNew);

    // Heartbeat ping every 12 seconds to keep online status active
    const interval = setInterval(() => {
      fetchStats(false);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Format large visit numbers (e.g. 24,680 or 24.7K)
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 px-2.5 sm:px-4 py-2 transition-all w-full select-none"
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Logo & Brand (Instagram Profile Crop Avatar) */}
        <div
          onClick={onReset}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
          title="Enhance Your Photo"
        >
          <div
            id="logo-icon"
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 via-amber-500 to-red-600 p-0.5 shadow-md shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-all overflow-hidden shrink-0 ring-1 ring-white/20"
          >
            <img
              src="/logo.jpg"
              alt="Profile Logo"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-serif whitespace-nowrap">
                Enhance <span className="text-amber-400">Your Photo</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-neutral-950 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 fill-neutral-950 text-neutral-950" />
                8K
              </span>
            </div>
          </div>
        </div>

        {/* Right: Top-Corner Live User & Visit Counter Mini Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Visitor & Online Stats Mini Box */}
          <div
            id="visitor-stats-minibox"
            className="flex items-center gap-1.5 sm:gap-3 bg-neutral-900/90 border border-neutral-800 px-2 sm:px-3 py-1 rounded-xl shadow-inner text-[10px] sm:text-xs"
          >
            {/* Online / Active Users Counting */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-neutral-200 font-medium"
              title="Users currently using this site online"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{activeUsers}</span>
              <span className="text-[10px] text-neutral-400 hidden xs:inline">online</span>
            </div>

            {/* Divider */}
            <div className="h-3 w-px bg-neutral-750" />

            {/* Total Visits Counting */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-neutral-300 font-medium"
              title="Total visits to this site"
            >
              <Eye className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-mono font-bold text-amber-300">{formatNumber(totalVisits)}</span>
              <span className="text-[10px] text-neutral-400 hidden sm:inline">visits</span>
            </div>
          </div>

          {/* Zero Storage Badge */}
          <div className="hidden md:flex items-center gap-1 bg-emerald-950/70 border border-emerald-500/30 px-2 py-1 rounded-full text-[10px] text-emerald-300 font-semibold shadow-inner shrink-0">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>RAM Only</span>
          </div>
        </div>
      </div>
    </header>
  );
};


