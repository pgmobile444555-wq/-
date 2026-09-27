import React, { useState, useEffect } from 'react';
import { Incident, PriorityLevel, SaKaeoDistrict, UserProfile } from '../types/incident';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { 
  AlertTriangle, 
  Bell, 
  X, 
  MapPin, 
  Ship, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Filter, 
  ShieldAlert,
  Send,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface UrgentAlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  activeDistrict: string;
  onSelectIncident: (incident: Incident) => void;
  onOpenLineSimulator: (incident: Incident) => void;
  onNavigateToMap: (incident?: Incident) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayAlertSound: () => void;
}

export const UrgentAlertCenterModal: React.FC<UrgentAlertCenterModalProps> = ({
  isOpen,
  onClose,
  incidents,
  activeDistrict,
  onSelectIncident,
  onOpenLineSimulator,
  onNavigateToMap,
  soundEnabled,
  onToggleSound,
  onPlayAlertSound
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVED'>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>(activeDistrict);
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P1' | 'NEEDS_BOAT'>('ALL');

  useEffect(() => {
    if (activeDistrict) {
      setDistrictFilter(activeDistrict);
    }
  }, [activeDistrict, isOpen]);

  if (!isOpen) return null;

  // Filter urgent cases: Priority P1, P2, or needs boat
  const urgentIncidents = incidents.filter((inc) => {
    // Basic urgency check: P1, P2 or requesting boat
    const isUrgent = inc.priority === 'P1' || inc.priority === 'P2' || inc.needsBoat;
    if (!isUrgent) return false;

    // Filter by district
    if (districtFilter !== 'ALL' && inc.district !== districtFilter) return false;

    // Filter by status
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    // Filter by priority
    if (priorityFilter === 'P1' && inc.priority !== 'P1') return false;
    if (priorityFilter === 'NEEDS_BOAT' && !inc.needsBoat) return false;

    return true;
  });

  // Calculate metrics
  const totalP1 = incidents.filter(i => i.priority === 'P1' && (districtFilter === 'ALL' || i.district === districtFilter)).length;
  const pendingBoats = incidents.filter(i => i.needsBoat && i.status === 'PENDING' && (districtFilter === 'ALL' || i.district === districtFilter)).length;
  const inProgressCount = incidents.filter(i => (i.status === 'DISPATCHED' || i.status === 'ON_SCENE') && (districtFilter === 'ALL' || i.district === districtFilter)).length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED' && (districtFilter === 'ALL' || i.district === districtFilter)).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: '⏳ รอส่งเรือช่วยเหลือ', bg: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      case 'VERIFIED':
        return { label: '📋 ตรวจสอบรับเรื่องแล้ว', bg: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'DISPATCHED':
        return { label: '🚤 ชุดเรือกำลังเดินทาง', bg: 'bg-sky-950/80 text-sky-300 border-sky-800' };
      case 'ON_SCENE':
        return { label: '🌊 กำลังช่วยเหลือในพื้นที่', bg: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'RESOLVED':
        return { label: '✅ ช่วยเหลือสำเร็จปลอดภัย', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header - Urgent Red Theme */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border-b border-red-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  ช่องการแจ้งเตือนสถานะเคสเร่งด่วน (Urgent Case Alerts)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ศูนย์ติดตามสถานการณ์และแจ้งเตือนเคสวิกฤต P1 / ขอเรือกู้ภัยฉุกเฉิน จังหวัดสระแก้ว
              </p>
            </div>
          </div>

          {/* Sound Toggle & Close */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onToggleSound}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
                soundEnabled
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{soundEnabled ? 'เสียงเตือน: เปิด' : 'เสียงเตือน: ปิด'}</span>
            </button>

            {soundEnabled && (
              <button
                type="button"
                onClick={onPlayAlertSound}
                className="px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 rounded-lg text-[11px] font-medium transition"
              >
                ทดสอบเสียง
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Urgent Metrics Dashboard */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-red-950/40 border border-red-900/60 rounded-xl">
            <div className="text-[11px] text-red-300 font-medium">เคสวิกฤต P1</div>
            <div className="text-xl font-bold text-red-400">{totalP1} <span className="text-xs font-normal">จุด</span></div>
          </div>

          <div className="p-2 bg-amber-950/40 border border-amber-900/60 rounded-xl">
            <div className="text-[11px] text-amber-300 font-medium">รอเรือช่วยเหลือ</div>
            <div className="text-xl font-bold text-amber-400">{pendingBoats} <span className="text-xs font-normal">จุด</span></div>
          </div>

          <div className="p-2 bg-sky-950/40 border border-sky-900/60 rounded-xl">
            <div className="text-[11px] text-sky-300 font-medium">เรือกำลังปฏิบัติการ</div>
            <div className="text-xl font-bold text-sky-400">{inProgressCount} <span className="text-xs font-normal">จุด</span></div>
          </div>

          <div className="p-2 bg-emerald-950/40 border border-emerald-900/60 rounded-xl">
            <div className="text-[11px] text-emerald-300 font-medium">ช่วยเหลือปลอดภัย</div>
            <div className="text-xl font-bold text-emerald-400">{resolvedCount} <span className="text-xs font-normal">จุด</span></div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] hidden sm:inline">สถานะ:</span>
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'PENDING', label: 'รอส่งเรือ' },
              { id: 'DISPATCHED', label: 'เรือออกแล้ว' },
              { id: 'RESOLVED', label: 'ช่วยแล้ว' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  statusFilter === st.id
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* District Filter & Urgency Filter */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Urgency Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="ALL">ความเร่งด่วน: ทั้งหมด</option>
              <option value="P1">🔴 วิกฤต P1 เท่านั้น</option>
              <option value="NEEDS_BOAT">🚤 ต้องการเรือด่วน</option>
            </select>

            {/* District Select */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="ALL">ทุกอำเภอ (9 อำเภอ)</option>
              {Object.keys(SA_KAEO_DISTRICTS).map((d) => (
                <option key={d} value={d}>อ.{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Urgent Incidents Feed List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
          {urgentIncidents.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white text-sm">ไม่มีเคสเร่งด่วนคั่งค้างในตัวกรองนี้</p>
              <p className="text-xs text-slate-400">
                สถานการณ์ในพื้นที่ {districtFilter === 'ALL' ? 'ทุกอำเภอ' : `อ.${districtFilter}`} อยู่ภายใต้การควบคุม
              </p>
            </div>
          ) : (
            urgentIncidents.map((incident) => {
              const statusBadge = getStatusBadge(incident.status);
              const isP1 = incident.priority === 'P1';

              return (
                <div
                  key={incident.id}
                  className={`p-3.5 bg-slate-950/90 border rounded-xl transition space-y-2.5 ${
                    isP1 && incident.status === 'PENDING'
                      ? 'border-red-600/80 shadow-md shadow-red-950/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Line: Code, Priority, District, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-sky-300">
                        {incident.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        isP1 ? 'bg-red-950 text-red-300 border-red-800' : 'bg-orange-950 text-orange-300 border-orange-800'
                      }`}>
                        {incident.priority} {isP1 ? 'วิกฤตสูงสุด' : 'เร่งด่วนสูง'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-[11px] text-white font-medium">
                        📍 อ.{incident.district}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                  </div>

                  {/* Title & Key Urgent Detail */}
                  <div>
                    <h4 className="font-bold text-sm text-white leading-snug">
                      {incident.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {incident.description}
                    </p>
                  </div>

                  {/* Highlights Bar: Water Depth, Victims, Boats */}
                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="px-2 py-0.5 bg-blue-950/70 border border-blue-900 rounded text-sky-200">
                      🌊 ระดับน้ำ: <strong>{incident.waterLevelText || 'น้ำท่วมสูง'}</strong>
                    </span>

                    {incident.estimatedVictims > 0 && (
                      <span className="px-2 py-0.5 bg-amber-950/70 border border-amber-900 rounded text-amber-200">
                        👥 ผู้ประสบภัย: <strong>{incident.estimatedVictims} ราย</strong>
                      </span>
                    )}

                    {incident.hasBedriddenOrElderly && (
                      <span className="px-2 py-0.5 bg-rose-950/80 border border-rose-800 rounded text-rose-200 font-semibold">
                        ⚠️ มีผู้ป่วยติดเตียง/คนชรา
                      </span>
                    )}

                    {incident.needsBoat && (
                      <span className="px-2 py-0.5 bg-red-950/80 border border-red-800 rounded text-red-200 font-bold flex items-center gap-1">
                        <Ship className="w-3 h-3" />
                        ต้องการเรือท้องแบนด่วน
                      </span>
                    )}

                    {incident.dispatchedUnits && incident.dispatchedUnits.length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-950/70 border border-emerald-800 rounded text-emerald-300">
                        🚤 ส่งเรือแล้ว: {incident.dispatchedUnits.length} ชุด ({incident.dispatchedUnits.map(u => u.name).join(', ')})
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>ผู้แจ้ง: {incident.reporterName}</span>
                      <a href={`tel:${incident.reporterPhone}`} className="text-sky-400 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {incident.reporterPhone}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToMap(incident);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>ดูจุดบนแผนที่</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenLineSimulator(incident)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[#06C755] border border-[#06C755]/30 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>แจ้งเตือน Line OA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectIncident(incident);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow"
                      >
                        <span>จัดการสั่งการ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Channels & Guidelines */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>วิทยุสื่อสารฉุกเฉิน ปภ.สระแก้ว: <strong>162.300 MHz</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">สายด่วนช่วยเหลือฉุกเฉิน: ปภ. 1784 · กู้ชีพ 1669</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
