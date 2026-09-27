import React, { useState, useEffect } from 'react';
import { Incident } from '../types/incident';
import { ShieldAlert, Volume2, VolumeX, ArrowRight, X, ChevronRight, Ship } from 'lucide-react';

interface UrgentAlertTickerProps {
  incidents: Incident[];
  activeDistrict: string;
  onOpenAlertCenter: () => void;
  onSelectIncident: (incident: Incident) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const UrgentAlertTicker: React.FC<UrgentAlertTickerProps> = ({
  incidents,
  activeDistrict,
  onOpenAlertCenter,
  onSelectIncident,
  soundEnabled,
  onToggleSound
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Filter urgent active cases (P1 or needing boats, not yet resolved)
  const urgentCases = incidents.filter(i => {
    const isUrgent = (i.priority === 'P1' || i.needsBoat) && i.status !== 'RESOLVED';
    if (!isUrgent) return false;
    if (activeDistrict !== 'ALL' && i.district !== activeDistrict) return false;
    return true;
  });

  // Cycle through cases every 6 seconds
  useEffect(() => {
    if (urgentCases.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urgentCases.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [urgentCases.length]);

  if (isDismissed || urgentCases.length === 0) {
    return null;
  }

  const currentCase = urgentCases[currentIndex] || urgentCases[0];

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-800/60 px-3 sm:px-5 py-1.5 text-xs text-white shadow-inner flex items-center justify-between gap-2.5 animate-in fade-in">
      
      {/* Left: Blinking Indicator + Live Alert Message */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>

        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] shrink-0 tracking-wide">
          เคสด่วน ({urgentCases.length})
        </span>

        {/* Clickable Urgent Message */}
        <button
          type="button"
          onClick={() => onSelectIncident(currentCase)}
          className="text-left font-medium text-red-200 hover:text-white transition truncate flex items-center gap-1.5"
        >
          <span className="font-bold text-white shrink-0">อ.{currentCase.district}:</span>
          <span className="truncate">{currentCase.title}</span>
          <span className="hidden md:inline text-[11px] text-red-300/80 shrink-0">
            · {currentCase.needsBoat ? '🚤 ขอเรือด่วน' : ''} {currentCase.estimatedVictims ? `(${currentCase.estimatedVictims} ราย)` : ''}
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-red-400" />
        </button>
      </div>

      {/* Right Actions: Sound Toggle + View Center + Dismiss */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenAlertCenter}
          className="px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-red-100 border border-red-700/80 text-[11px] font-semibold flex items-center gap-1 transition"
        >
          <ShieldAlert className="w-3 h-3 text-red-300" />
          <span>ศูนย์แจ้งเตือน</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className={`p-1 rounded text-slate-400 hover:text-white transition ${soundEnabled ? 'text-amber-300' : ''}`}
          title={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-500 hover:text-white rounded transition"
          title="ซ่อนแถบแจ้งเตือน"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
