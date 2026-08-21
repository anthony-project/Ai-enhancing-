import React, { useState, useEffect } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onReset?: () => void;
  onOpenPrivacy?: () => void;
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
      className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-850/80 px-3 sm:px-4 py-2.5 transition-all w-full select-none"
    >
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Logo & Brand */}
        <motion.div
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
          title="Enhance Your Photo"
        >
          <div
            id="logo-icon"
            className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-neutral-900 border border-neutral-750/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] overflow-hidden shrink-0 group-hover:border-amber-400/60 transition-all p-0.5"
          >
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white font-serif whitespace-nowrap flex items-center gap-1.5">
              <span>Enhance</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 font-black">
                Your Photo
              </span>
            </span>
          </div>
        </motion.div>

        {/* Right: Top-Corner Live User & Visit Counter Mini Box */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Visitor & Online Stats Mini Box */}
          <div
            id="visitor-stats-minibox"
            className="flex items-center gap-1.5 sm:gap-3 bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 px-2.5 sm:px-3.5 py-1.5 rounded-2xl shadow-inner text-[10px] sm:text-xs"
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
            <div className="h-3.5 w-px bg-neutral-750" />

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
        </div>
      </div>
    </header>
  );
};

