import React, { useState } from 'react';
import { FLOOD_CATEGORY_METADATA, PRIORITY_CONFIG, SA_KAEO_DISTRICTS, STATUS_CONFIG } from '../data/saKaeoDistricts';
import { Incident, FloodCategory, PriorityLevel, SaKaeoDistrict } from '../types/incident';
import { 
  Search, 
  MapPin, 
  Phone, 
  Ship, 
  Waves, 
  LifeBuoy, 
  ClipboardCheck,
  Check,
  Plus,
  Clock,
  ArrowRight
} from 'lucide-react';

interface IncidentListViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenLineSimulator: (incident: Incident) => void;
  onOpenReportModal: () => void;
  onOpenReviewTab?: () => void;
  activeDistrict?: string;
  onSelectDistrict?: (d: string) => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenLineSimulator,
  onOpenReportModal,
  onOpenReviewTab,
  activeDistrict = 'ALL',
  onSelectDistrict
}) => {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState<string>(activeDistrict);
  const [status, setStatus] = useState<string>('ALL');
  const [priority, setPriority] = useState<string>('ALL');
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED'>('ALL');

  React.useEffect(() => {
    if (activeDistrict) {
      setDistrict(activeDistrict);
    }
  }, [activeDistrict]);

  const filtered = incidents.filter((inc) => {
    if (district !== 'ALL' && inc.district !== district) return false;
    if (status !== 'ALL' && inc.status !== status) return false;
    if (priority !== 'ALL' && inc.priority !== priority) return false;

    const hasReviews = inc.reviews && inc.reviews.length > 0;
    if (reviewFilter === 'UNREVIEWED' && hasReviews) return false;
    if (reviewFilter === 'REVIEWED' && !hasReviews) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.code.toLowerCase().includes(q) ||
        inc.district.toLowerCase().includes(q) ||
        inc.landmark.toLowerCase().includes(q) ||
        inc.reporterPhone.includes(q)
      );
    }
    return true;
  });

  const unreviewedCount = incidents.filter(i => !i.reviews || i.reviews.length === 0).length;

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Header Bar - Clean Standard Style */}
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาจุดน้ำท่วม, รหัส FL-..., อำเภอ, หรือเบอร์โทร..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {onOpenReviewTab && (
              <button
                onClick={onOpenReviewTab}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-600"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>รีวิวตรวจสอบ ({unreviewedCount})</span>
              </button>
            )}

            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>แจ้งเหตุน้ำท่วม</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Review Filter */}
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">สถานะรีวิว: ทั้งหมด</option>
            <option value="UNREVIEWED">⏳ รอรีวิวตรวจสอบ ({unreviewedCount})</option>
            <option value="REVIEWED">✅ ผ่านการรีวิวแล้ว ({incidents.length - unreviewedCount})</option>
          </select>

          {/* District Select */}
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              if (onSelectDistrict) onSelectDistrict(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">ทุกอำเภอในสระแก้ว (9 อำเภอ)</option>
            {Object.keys(SA_KAEO_DISTRICTS).map((d) => (
              <option key={d} value={d}>
                อ.{d}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">ทุกสถานะการช่วยเหลือ</option>
            {Object.entries(STATUS_CONFIG).map(([st, meta]) => (
              <option key={st} value={st}>
                {meta.label}
              </option>
            ))}
          </select>

          {/* Priority Select */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">ทุกลำดับความเร่งด่วน</option>
            {Object.entries(PRIORITY_CONFIG).map(([pr, meta]) => (
              <option key={pr} value={pr}>
                {meta.label} ({pr})
              </option>
            ))}
          </select>

          <span className="text-slate-400 text-xs ml-auto">
            แสดงผล {filtered.length} จาก {incidents.length} เหตุการณ์
          </span>
        </div>
      </div>

      {/* Incidents List - Clean Standard Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium text-slate-300">ไม่พบรายการจุดน้ำท่วมที่ค้นหา</p>
            <p className="text-xs">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหาด้านบน</p>
          </div>
        ) : (
          filtered.map((inc) => {
            const priorityMeta = PRIORITY_CONFIG[inc.priority] || PRIORITY_CONFIG.P3;
            const statusMeta = STATUS_CONFIG[inc.status] || STATUS_CONFIG.PENDING;
            const categoryMeta = FLOOD_CATEGORY_METADATA[inc.category] || FLOOD_CATEGORY_METADATA.COMMUNITY_FLOOD;
            const hasReviews = inc.reviews && inc.reviews.length > 0;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 transition cursor-pointer text-slate-100 space-y-2.5"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-sky-300">
                      {inc.code}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityMeta.bg} ${priorityMeta.color} ${priorityMeta.border}`}>
                      {priorityMeta.label}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>

                    {/* Review Badge */}
                    {hasReviews ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> ผ่านการรีวิวแล้ว
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-900/60 text-amber-300 border border-amber-700/60 rounded">
                        ⏳ รอรีวิวตรวจสอบ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(inc.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} น.</span>
                  </div>
                </div>

                {/* Title & Info */}
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {inc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      อ.{inc.district} · จุดสังเกต: {inc.landmark || 'ไม่ระบุ'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {inc.reporterName} ({inc.reporterPhone})
                    </span>
                    <span className="text-slate-400">
                      หมวด: {categoryMeta.label}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Badges & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/80 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {inc.waterLevelText && (
                      <span className="px-2 py-0.5 bg-slate-900 text-blue-300 border border-slate-700 rounded">
                        ระดับน้ำ: {inc.waterLevelText}
                      </span>
                    )}
                    {inc.needsBoat && (
                      <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-medium flex items-center gap-1">
                        <Ship className="w-3 h-3 text-red-400" /> ต้องการเรือกู้ภัย
                      </span>
                    )}
                    {inc.hasBedriddenOrElderly && (
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-medium flex items-center gap-1">
                        <LifeBuoy className="w-3 h-3 text-rose-400" /> มีผู้ป่วยติดเตียง
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 rounded">
                      ผู้ประสบภัย: {inc.estimatedVictims} คน
                    </span>
                    {inc.dispatchedUnits.length > 0 && (
                      <span className="px-2 py-0.5 bg-slate-900 text-sky-300 border border-slate-700 rounded">
                        ส่งเรือ {inc.dispatchedUnits.length} ชุด
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-650 text-slate-200 border border-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
                      {hasReviews ? 'แก้ไขการรีวิว' : 'รีวิวเคส'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
