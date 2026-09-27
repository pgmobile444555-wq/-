import React, { useState, useMemo } from 'react';
import { Incident, PriorityLevel, SaKaeoDistrict } from '../types/incident';
import { 
  Radio, 
  MapPin, 
  Clock, 
  Ship, 
  LifeBuoy, 
  Phone, 
  ExternalLink, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Layers,
  Sparkles,
  ArrowUpDown,
  Navigation,
  Zap
} from 'lucide-react';

interface RealtimeIncidentFeedUnderMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenIncidentDetail: (incident: Incident) => void;
  onOpenLineSimulator: (incident: Incident) => void;
  onScrollToMap: () => void;
  onQuickDispatch?: (incident: Incident) => void;
  onQuickResolve?: (incident: Incident) => void;
  activeDistrict: string;
}

export const RealtimeIncidentFeedUnderMap: React.FC<RealtimeIncidentFeedUnderMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenIncidentDetail,
  onOpenLineSimulator,
  onScrollToMap,
  onQuickDispatch,
  onQuickResolve,
  activeDistrict
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'P1' | 'NEEDS_BOAT' | 'PENDING' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'TIME_DESC' | 'PRIORITY' | 'WATER_LEVEL'>('TIME_DESC');

  // Format relative time (e.g. เมื่อ 3 นาทีที่แล้ว)
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffMinutes < 1) return 'เมื่อสักครู่';
      if (diffMinutes < 60) return `เมื่อ ${diffMinutes} นาทีที่แล้ว`;
      if (diffHours < 24) return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
      return new Date(dateStr).toLocaleDateString('th-TH', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: '⏳ รอส่งเรือช่วยเหลือ', color: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      case 'VERIFIED':
        return { label: '📋 รับเรื่องแล้ว', color: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'DISPATCHED':
        return { label: '🚤 ชุดเรือกำลังเดินทาง', color: 'bg-sky-950/80 text-sky-300 border-sky-800' };
      case 'ON_SCENE':
        return { label: '🌊 กำลังช่วยเหลือในพื้นที่', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800' };
      case 'RESOLVED':
        return { label: '✅ ช่วยเหลือสำเร็จปลอดภัย', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Priority Badge Helper
  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'P1':
        return { label: 'P1 วิกฤตสูงสุด', color: 'bg-red-950 text-red-300 border-red-700 animate-pulse' };
      case 'P2':
        return { label: 'P2 เร่งด่วนมาก', color: 'bg-orange-950 text-orange-300 border-orange-700' };
      case 'P3':
        return { label: 'P3 ปานกลาง', color: 'bg-yellow-950 text-yellow-300 border-yellow-850' };
      case 'P4':
        return { label: 'P4 เฝ้าระวัง', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    let result = incidents.filter(inc => {
      // District scope
      if (activeDistrict !== 'ALL' && inc.district !== activeDistrict) {
        return false;
      }

      // Filter types
      if (filterType === 'P1' && inc.priority !== 'P1') return false;
      if (filterType === 'NEEDS_BOAT' && !inc.needsBoat) return false;
      if (filterType === 'PENDING' && inc.status !== 'PENDING') return false;
      if (filterType === 'ACTIVE' && !(inc.status === 'DISPATCHED' || inc.status === 'ON_SCENE')) return false;
      if (filterType === 'RESOLVED' && inc.status !== 'RESOLVED') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (inc.title || '').toLowerCase().includes(q);
        const matchCode = (inc.code || '').toLowerCase().includes(q);
        const matchDistrict = (inc.district || '').toLowerCase().includes(q);
        const matchSubDistrict = (inc.subDistrict || '').toLowerCase().includes(q);
        const matchLandmark = (inc.landmark || '').toLowerCase().includes(q);
        const matchDesc = (inc.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDistrict && !matchSubDistrict && !matchLandmark && !matchDesc) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'PRIORITY') {
        const priorityOrder: Record<PriorityLevel, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'WATER_LEVEL') {
        return (b.waterLevelCm || 0) - (a.waterLevelCm || 0);
      }
      // Default: TIME_DESC
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [incidents, activeDistrict, filterType, searchQuery, sortBy]);

  // Metric counts for quick badges
  const metrics = useMemo(() => {
    const list = incidents.filter(i => activeDistrict === 'ALL' || i.district === activeDistrict);
    return {
      total: list.length,
      p1: list.filter(i => i.priority === 'P1').length,
      boats: list.filter(i => i.needsBoat).length,
      pending: list.filter(i => i.status === 'PENDING').length,
      active: list.filter(i => i.status === 'DISPATCHED' || i.status === 'ON_SCENE').length,
      resolved: list.filter(i => i.status === 'RESOLVED').length
    };
  }, [incidents, activeDistrict]);

  const handleFocusOnMap = (incident: Incident) => {
    onSelectIncident(incident);
    onScrollToMap();
  };

  return (
    <div id="realtime-feed-section" className="mt-5 space-y-3.5 scroll-mt-24">
      
      {/* Feed Control Bar & Summary Header */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-750">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  ลำดับการแจ้งเหตุฉุกเฉินแบบ Real-time
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE อัปเดตสด
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeDistrict !== 'ALL' 
                  ? `แสดงลำดับเคสในพื้นที่ อำเภอ${activeDistrict} (${filteredIncidents.length} รายการ)`
                  : `แสดงลำดับเคสศูนย์รวม 9 อำเภอ จังหวัดสระแก้ว (${filteredIncidents.length} รายการ)`}
              </p>
            </div>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              เรียงตาม:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="TIME_DESC">⏱️ ล่าสุดก่อน (เรียลไทม์)</option>
              <option value="PRIORITY">🚨 ความเร่งด่วนสูงสุด (P1 ก่อน)</option>
              <option value="WATER_LEVEL">🌊 ระดับน้ำสูงสุด</option>
            </select>
          </div>
        </div>

        {/* Filter Pills & Search Input Row */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
              }`}
            >
              ทั้งหมด ({metrics.total})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('P1')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition flex items-center gap-1 ${
                filterType === 'P1'
                  ? 'bg-red-600 text-white border-red-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-red-400 border-slate-750 hover:bg-slate-800'
              }`}
            >
              <span>🔴 วิกฤต P1</span>
              <span className="font-mono font-bold">({metrics.p1})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('NEEDS_BOAT')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition flex items-center gap-1 ${
                filterType === 'NEEDS_BOAT'
                  ? 'bg-amber-600 text-white border-amber-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-amber-400 border-slate-750 hover:bg-slate-800'
              }`}
            >
              <Ship className="w-3 h-3" />
              <span>ขอเรือด่วน</span>
              <span className="font-mono font-bold">({metrics.boats})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                filterType === 'PENDING'
                  ? 'bg-amber-600 text-white border-amber-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800'
              }`}
            >
              ⏳ รอส่งเรือ ({metrics.pending})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                filterType === 'ACTIVE'
                  ? 'bg-sky-600 text-white border-sky-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-sky-400 border-slate-750 hover:bg-slate-800'
              }`}
            >
              🚤 กำลังช่วยเหลือ ({metrics.active})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('RESOLVED')}
              className={`px-2.5 py-1 rounded-lg font-medium border transition ${
                filterType === 'RESOLVED'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm'
                  : 'bg-slate-900 text-emerald-400 border-slate-750 hover:bg-slate-800'
              }`}
            >
              ✅ ช่วยแล้ว ({metrics.resolved})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อจุด, รหัสเคส, ตำบล..."
              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

        </div>
      </div>

      {/* Real-time Cards Stream */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center bg-slate-850 border border-slate-750 rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-semibold text-white text-sm">ไม่พบเคสแจ้งเหตุในเงื่อนไขนี้</p>
            <p className="text-xs text-slate-400">
              สถานการณ์ในพื้นที่ {activeDistrict !== 'ALL' ? `อำเภอ${activeDistrict}` : 'จังหวัดสระแก้ว'} ยังไม่มีรายงานเพิ่มเติม
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident, index) => {
            const priorityBadge = getPriorityBadge(incident.priority);
            const statusBadge = getStatusBadge(incident.status);
            const isSelected = selectedIncident?.id === incident.id;
            const timeAgo = formatTimeAgo(incident.createdAt);

            return (
              <div
                key={incident.id}
                className={`bg-slate-850 border rounded-2xl p-4 transition-all duration-200 space-y-3 hover:border-blue-500/80 hover:shadow-lg ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-gradient-to-r from-slate-850 to-blue-950/20' 
                    : incident.priority === 'P1' && incident.status === 'PENDING'
                    ? 'border-red-600/70 shadow-md shadow-red-950/30'
                    : 'border-slate-750'
                }`}
              >
                {/* Top Row: Sequential Rank + Code + Priority + Status + Time */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-sky-300">
                      {incident.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${priorityBadge.color}`}>
                      {priorityBadge.label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-[11px] text-white font-medium">
                      📍 อ.{incident.district} {incident.subDistrict ? `ต.${incident.subDistrict}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{timeAgo}</span>
                    </span>
                  </div>
                </div>

                {/* Main Content Title & Description */}
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white hover:text-blue-400 transition leading-snug">
                    {incident.title}
                  </h4>
                  {incident.description && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>
                  )}
                </div>

                {/* Flood Condition Metrics Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {incident.waterLevelText && (
                    <span className="px-2 py-0.5 bg-blue-950/80 border border-blue-800 rounded-lg text-sky-200">
                      🌊 ระดับน้ำ: <strong>{incident.waterLevelText}</strong>
                    </span>
                  )}

                  {incident.estimatedVictims > 0 && (
                    <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-800 rounded-lg text-amber-200">
                      👥 ผู้ประสบภัย: <strong>{incident.estimatedVictims} คน</strong>
                    </span>
                  )}

                  {incident.needsBoat && (
                    <span className="px-2 py-0.5 bg-red-950/80 border border-red-800 rounded-lg text-red-200 font-bold flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5" />
                      ต้องการเรือท้องแบนด่วน
                    </span>
                  )}

                  {incident.hasBedriddenOrElderly && (
                    <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200 font-semibold flex items-center gap-1">
                      <LifeBuoy className="w-3.5 h-3.5" />
                      มีผู้ป่วยติดเตียง/คนชรา
                    </span>
                  )}

                  {incident.dispatchedUnits && incident.dispatchedUnits.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300">
                      🚤 ส่งเรือแล้ว: {incident.dispatchedUnits.map(u => u.name).join(', ')}
                    </span>
                  )}
                </div>

                {/* Attached Images Preview if any */}
                {incident.images && incident.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Camera className="w-3 h-3 text-blue-400" />
                      <span>ภาพถ่าย ({incident.images.length}):</span>
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {incident.images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="w-14 h-9 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-400 shrink-0 transition"
                          title="แตะเพื่อดูภาพขยาย"
                        >
                          <img src={img} alt={`incident-preview-${i}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-750/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>ผู้แจ้ง: <strong className="text-slate-300">{incident.reporterName}</strong></span>
                    <a
                      href={`tel:${incident.reporterPhone}`}
                      className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      {incident.reporterPhone}
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    {/* Google Maps Turn-by-Turn GPS Navigation */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
                      title="เปิด Google Maps นำทางตรงไปยังจุดเกิดเหตุทันที"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-300" />
                      <span>นำทาง GPS</span>
                    </a>

                    {/* 1-Click Fast Dispatch for Responders */}
                    {(incident.status === 'PENDING' || incident.status === 'VERIFIED') && onQuickDispatch && (
                      <button
                        type="button"
                        onClick={() => onQuickDispatch(incident)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        title="กดรับเรื่องและสั่งการส่งเรือกู้ภัยทันที"
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        <span>รับเรื่องส่งเรือทันที</span>
                      </button>
                    )}

                    {/* 1-Click Quick Resolve */}
                    {(incident.status === 'DISPATCHED' || incident.status === 'ON_SCENE') && onQuickResolve && (
                      <button
                        type="button"
                        onClick={() => onQuickResolve(incident)}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        title="ยืนยันช่วยเหลือผู้ประสบภัยปลอดภัยแล้ว"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ช่วยปลอดภัยแล้ว</span>
                      </button>
                    )}

                    {/* Share Directly to LINE Group */}
                    <a
                      href={`https://line.me/R/msg/text/?${encodeURIComponent(
                        `🚨 แจ้งเหตุน้ำท่วมด่วน สระแก้ว!\nรหัส: ${incident.code} (อ.${incident.district})\nระดับน้ำ: ${incident.waterLevelText || 'ท่วมขัง'}\nจุดสังเกต: ${incident.landmark || incident.title}\nผู้ประสบภัย: ${incident.estimatedVictims} คน ${incident.needsBoat ? '(ต้องการเรือด่วน)' : ''}\nเบอร์โทร: ${incident.reporterPhone}\n📍 นำทาง Google Maps: https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#06C755] border border-[#06C755]/40 rounded-xl text-xs font-medium flex items-center gap-1 transition"
                      title="ส่งพิกัดและข้อมูลเข้ากลุ่ม LINE กู้ภัยทันที"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">ส่ง LINE</span>
                    </a>

                    {/* Focus Map Button */}
                    <button
                      type="button"
                      onClick={() => handleFocusOnMap(incident)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-500 rounded-xl text-xs font-medium flex items-center gap-1 transition shadow-sm"
                      title="ซูมและแสดงตำแหน่งหมุดบนแผนที่ด้านบน"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden md:inline">ดูบนแผนที่</span>
                    </button>

                    {/* Full Detail / Dispatch Button */}
                    <button
                      type="button"
                      onClick={() => onOpenIncidentDetail(incident)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow"
                      title="เปิดหน้าต่างสั่งการเต็มรูปแบบ"
                    >
                      <span>รายละเอียด</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
