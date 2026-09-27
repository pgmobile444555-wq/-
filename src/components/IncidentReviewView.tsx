import React, { useState } from 'react';
import { SA_KAEO_DISTRICTS, PRIORITY_CONFIG, STATUS_CONFIG } from '../data/saKaeoDistricts';
import { Incident, PriorityLevel, SaKaeoDistrict } from '../types/incident';
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Ship, 
  LifeBuoy, 
  Clock, 
  Filter,
  Check,
  X,
  FileText
} from 'lucide-react';

interface IncidentReviewViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onRefreshData: () => void;
  activeDistrict?: string;
  onSelectDistrict?: (d: string) => void;
}

export const IncidentReviewView: React.FC<IncidentReviewViewProps> = ({
  incidents,
  onSelectIncident,
  onRefreshData,
  activeDistrict = 'ALL',
  onSelectDistrict
}) => {
  const [filterReviewStatus, setFilterReviewStatus] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED' | 'P1_URGENT'>('UNREVIEWED');
  const [districtFilter, setDistrictFilter] = useState<string>(activeDistrict);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (activeDistrict) {
      setDistrictFilter(activeDistrict);
    }
  }, [activeDistrict]);

  // Quick Review Modal State
  const [quickReviewIncident, setQuickReviewIncident] = useState<Incident | null>(null);
  const [decision, setDecision] = useState<'VERIFIED' | 'ADJUSTED_PRIORITY' | 'NEEDS_INFO' | 'DUPLICATE'>('VERIFIED');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('P1');
  const [reviewNote, setReviewNote] = useState('');
  const [contactConfirmed, setContactConfirmed] = useState(true);
  const [locationConfirmed, setLocationConfirmed] = useState(true);
  const [vulnerableConfirmed, setVulnerableConfirmed] = useState(false);
  const [boatNeedConfirmed, setBoatNeedConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered incidents
  const filtered = incidents.filter(inc => {
    const hasReviews = inc.reviews && inc.reviews.length > 0;
    if (filterReviewStatus === 'UNREVIEWED' && hasReviews) return false;
    if (filterReviewStatus === 'REVIEWED' && !hasReviews) return false;
    if (filterReviewStatus === 'P1_URGENT' && inc.priority !== 'P1') return false;

    if (districtFilter !== 'ALL' && inc.district !== districtFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.code.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.reporterName.toLowerCase().includes(q) ||
        inc.reporterPhone.includes(q) ||
        inc.district.toLowerCase().includes(q) ||
        inc.landmark.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreviewedCount = incidents.filter(i => !i.reviews || i.reviews.length === 0).length;
  const p1Count = incidents.filter(i => i.priority === 'P1').length;

  const handleOpenQuickReview = (inc: Incident, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickReviewIncident(inc);
    setNewPriority(inc.priority);
    setVulnerableConfirmed(inc.hasBedriddenOrElderly);
    setBoatNeedConfirmed(inc.needsBoat);
    setContactConfirmed(true);
    setLocationConfirmed(true);
    setDecision(inc.status === 'PENDING' ? 'VERIFIED' : 'ADJUSTED_PRIORITY');
    setReviewNote(
      inc.reviews && inc.reviews.length > 0
        ? ''
        : `โทรตรวจสอบข้อเท็จจริงแล้ว ผู้แจ้งยืนยันระดับน้ำ ${inc.waterLevelText || 'ท่วมขัง'} ต้องการความช่วยเหลือ`
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReviewIncident) return;

    setIsSubmitting(true);
    try {
      const decisionLabels: Record<string, string> = {
        VERIFIED: 'ผ่านการรีวิว (ยืนยันเหตุจริง)',
        ADJUSTED_PRIORITY: `รีวิวปรับความเร่งด่วนเป็น ${newPriority}`,
        NEEDS_INFO: 'รอข้อมูลเพิ่มเติมจากผู้แจ้ง',
        DUPLICATE: 'เหตุซ้ำซ้อน / ยกเลิก'
      };

      const res = await fetch(`/api/incidents/${quickReviewIncident.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          decisionLabel: decisionLabels[decision],
          reviewedBy: 'เจ้าหน้าที่ ปภ. ศูนย์สระแก้ว',
          reviewerAgency: 'สำนักงาน ปภ. จังหวัดสระแก้ว',
          notes: reviewNote.trim() || 'ตรวจสอบข้อมูลเรียบร้อย',
          contactConfirmed,
          locationConfirmed,
          vulnerableConfirmed,
          boatNeedConfirmed,
          previousPriority: quickReviewIncident.priority,
          newPriority: decision === 'ADJUSTED_PRIORITY' ? newPriority : undefined
        })
      });

      const resJson = await res.json();
      if (resJson.success) {
        onRefreshData();
        setQuickReviewIncident(null);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Standard Clean Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              ระบบรีวิวและตรวจสอบรายงานแจ้งเหตุอุทกภัย (Incident Review & Triage)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              ศูนย์ตรวจสอบข้อเท็จจริง ปภ.สระแก้ว: ทวนสอบข้อมูลผู้แจ้ง ประเมินความเร่งด่วน และอนุมัติส่งชุดกู้ภัย
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-amber-900/60 border border-amber-700/80 rounded-lg text-amber-200 font-medium">
              รอรีวิว: {unreviewedCount} รายการ
            </span>
            <span className="text-xs px-2.5 py-1 bg-red-900/60 border border-red-700/80 rounded-lg text-red-200 font-medium">
              วิกฤต P1: {p1Count} รายการ
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/80 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setFilterReviewStatus('UNREVIEWED')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterReviewStatus === 'UNREVIEWED'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              รอรีวิวตรวจสอบ ({unreviewedCount})
            </button>
            <button
              onClick={() => setFilterReviewStatus('REVIEWED')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterReviewStatus === 'REVIEWED'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              รีวิวแล้ว ({incidents.length - unreviewedCount})
            </button>
            <button
              onClick={() => setFilterReviewStatus('P1_URGENT')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterReviewStatus === 'P1_URGENT'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              เคสวิกฤตด่วน P1 ({p1Count})
            </button>
            <button
              onClick={() => setFilterReviewStatus('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filterReviewStatus === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ทั้งหมด ({incidents.length})
            </button>
          </div>

          {/* District Select */}
          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              if (onSelectDistrict) onSelectDistrict(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">ทุกอำเภอ (9 อำเภอ)</option>
            {Object.keys(SA_KAEO_DISTRICTS).map(d => (
              <option key={d} value={d}>อ.{d}</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัส, ชื่อผู้แจ้ง, เบอร์โทร, พิกัด หรือจุดสังเกต..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-slate-300">ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs">ทุกรายงานได้รับการรีวิวหรือไม่มีเหตุค้างในตัวกรองนี้</p>
          </div>
        ) : (
          filtered.map((inc) => {
            const priorityMeta = PRIORITY_CONFIG[inc.priority] || PRIORITY_CONFIG.P3;
            const statusMeta = STATUS_CONFIG[inc.status] || STATUS_CONFIG.PENDING;
            const hasReviews = inc.reviews && inc.reviews.length > 0;
            const latestReview = hasReviews ? inc.reviews![0] : null;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`bg-slate-850 hover:bg-slate-800 border rounded-xl p-4 transition cursor-pointer ${
                  !hasReviews
                    ? 'border-amber-700/60 bg-slate-850/90'
                    : 'border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left Column: Core Info */}
                  <div className="space-y-1.5 flex-1 min-w-[260px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-sky-300">
                        {inc.code}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityMeta.bg} ${priorityMeta.color} ${priorityMeta.border}`}>
                        {priorityMeta.label}
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>

                      {!hasReviews ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-900/50 text-amber-300 border border-amber-700/60 rounded">
                          ⏳ รอรีวิวตรวจสอบ
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> ผ่านการรีวิวแล้ว
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white">
                      {inc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        อ.{inc.district} · {inc.landmark || 'ไม่ระบุจุดสังเกต'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {inc.reporterName} ({inc.reporterPhone})
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(inc.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Operational badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      {inc.waterLevelText && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded">
                          ระดับน้ำ: {inc.waterLevelText}
                        </span>
                      )}
                      {inc.needsBoat && (
                        <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-medium flex items-center gap-1">
                          <Ship className="w-3 h-3" /> ต้องการเรือกู้ภัย
                        </span>
                      )}
                      {inc.hasBedriddenOrElderly && (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-medium flex items-center gap-1">
                          <LifeBuoy className="w-3 h-3" /> มีผู้ป่วยติดเตียง/คนชรา
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded">
                        ผู้ประสบภัย: {inc.estimatedVictims} คน
                      </span>
                    </div>

                    {/* Latest Review Summary Box if available */}
                    {latestReview && (
                      <div className="mt-2 p-2 bg-slate-900 border border-slate-750 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-medium text-emerald-400">
                            ผลรีวิวล่าสุด: {latestReview.decisionLabel}
                          </span>
                          <span>โดย {latestReview.reviewedBy} ({new Date(latestReview.reviewedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.)</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          💬 {latestReview.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-center sm:self-auto">
                    <button
                      type="button"
                      onClick={(e) => handleOpenQuickReview(inc, e)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      {hasReviews ? 'รีวิว/แก้ไขใหม่' : 'ทำการรีวิวตรวจสอบ'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectIncident(inc)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                    >
                      ดูรายละเอียดเต็ม
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Review Modal */}
      {quickReviewIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden text-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm text-white">
                  บันทึกผลการรีวิวและตรวจสอบเหตุ ({quickReviewIncident.code})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickReviewIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target incident summary */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-white">{quickReviewIncident.title}</div>
              <div className="text-slate-400">
                อ.{quickReviewIncident.district} · ผู้แจ้ง: {quickReviewIncident.reporterName} ({quickReviewIncident.reporterPhone})
              </div>
              <div className="text-slate-400">
                ระดับน้ำ: {quickReviewIncident.waterLevelText || 'ไม่ระบุ'} · ผู้ประสบภัย {quickReviewIncident.estimatedVictims} คน
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              {/* Checklist */}
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  รายการตรวจสอบข้อเท็จจริง (Verification Checklist):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactConfirmed}
                      onChange={(e) => setContactConfirmed(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>โทรติดต่อผู้แจ้งสำเร็จ</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationConfirmed}
                      onChange={(e) => setLocationConfirmed(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>ยืนยันพิกัด/จุดน้ำท่วม</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vulnerableConfirmed}
                      onChange={(e) => setVulnerableConfirmed(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>มีผู้ป่วยติดเตียง/คนชราจริง</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boatNeedConfirmed}
                      onChange={(e) => setBoatNeedConfirmed(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>จำเป็นต้องใช้เรือกู้ภัย</span>
                  </label>
                </div>
              </div>

              {/* Review Decision */}
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">ผลการตัดสินใจการรีวิว:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('VERIFIED')}
                    className={`p-2 rounded-lg border text-left transition ${
                      decision === 'VERIFIED'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-medium">✅ ยืนยันเหตุจริง</div>
                    <div className="text-[10px] text-slate-400">ข้อมูลครบถ้วน ส่งชุดกู้ภัย</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('ADJUSTED_PRIORITY')}
                    className={`p-2 rounded-lg border text-left transition ${
                      decision === 'ADJUSTED_PRIORITY'
                        ? 'bg-amber-950 border-amber-600 text-amber-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-medium">⚡ ปรับความเร่งด่วน</div>
                    <div className="text-[10px] text-slate-400">เปลี่ยนระดับความวิกฤต</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('NEEDS_INFO')}
                    className={`p-2 rounded-lg border text-left transition ${
                      decision === 'NEEDS_INFO'
                        ? 'bg-sky-950 border-sky-600 text-sky-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-medium">❓ ขอข้อมูลเพิ่ม</div>
                    <div className="text-[10px] text-slate-400">ยังติดต่อไม่ได้/พิกัดไม่ชัด</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('DUPLICATE')}
                    className={`p-2 rounded-lg border text-left transition ${
                      decision === 'DUPLICATE'
                        ? 'bg-red-950 border-red-600 text-red-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-medium">❌ แจ้งซ้ำ / ยกเลิก</div>
                    <div className="text-[10px] text-slate-400">มีหน่วยงานเข้าแล้วหรือซ้ำ</div>
                  </button>
                </div>
              </div>

              {/* Priority Selector if adjusted */}
              {decision === 'ADJUSTED_PRIORITY' && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                  <label className="block font-medium text-amber-200 mb-1">
                    เลือกระดับความเร่งด่วนใหม่:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="P1">🚨 P1 - วิกฤตคุกคามชีวิต (คนติดค้าง/เสี่ยงจม/ผู้ป่วย)</option>
                    <option value="P2">⚠️ P2 - ด่วนมาก (น้ำท่วมบ้านสูงเกิน 50 ซม./ตัดขาด)</option>
                    <option value="P3">🟡 P3 - ปานกลาง (ขอรับถุงยังชีพ/น้ำดื่ม)</option>
                    <option value="P4">🔵 P4 - เฝ้าระวัง/ทั่วไป (น้ำปริ่มตลิ่ง/ท่อตัน)</option>
                  </select>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  บันทึกผลการรีวิวและข้อคิดเห็นของเจ้าหน้าที่ *:
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="ระบุรายละเอียด เช่น โทรคุยกับผู้ประสบภัยแล้ว น้ำท่วมระดับเอว จัดส่งเรือ 1 ลำเข้าช่วยเหลือ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickReviewIncident(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกผลการรีวิว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
