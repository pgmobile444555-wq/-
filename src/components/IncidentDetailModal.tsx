import React, { useState } from 'react';
import { FLOOD_CATEGORY_METADATA, PRIORITY_CONFIG, SA_KAEO_DISTRICTS, STATUS_CONFIG } from '../data/saKaeoDistricts';
import { Incident, IncidentStatus, Officer, PriorityLevel, UserProfile } from '../types/incident';
import { 
  ClipboardCheck, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  Send, 
  CheckCircle2, 
  Ship, 
  Radio, 
  Navigation, 
  ShieldCheck,
  AlertTriangle,
  LifeBuoy,
  Waves,
  Check,
  X,
  History,
  AlertOctagon,
  Camera,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onStatusUpdated: (updated: Incident) => void;
  onOpenLineSimulator: (incident: Incident) => void;
  officers?: Officer[];
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  currentUser,
  onClose,
  onStatusUpdated,
  onOpenLineSimulator,
  officers = []
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'review' | 'dispatch' | 'timeline'>('info');

  // Status progression state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident?.status || 'PENDING');
  const [assignedOfficer, setAssignedOfficer] = useState(incident?.assignedOfficer || '');

  // Dispatch unit state
  const [unitName, setUnitName] = useState('');
  const [agencyName, setAgencyName] = useState('หน่วยกู้ภัยสว่างสระแก้ว (ชุดกู้ภัยทางน้ำ)');
  const [vehicleType, setVehicleType] = useState('เรือท้องแบนติดเครื่องยนต์');
  const [personnelCount, setPersonnelCount] = useState(4);
  const [dispatching, setDispatching] = useState(false);
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  // Review state
  const [reviewDecision, setReviewDecision] = useState<'VERIFIED' | 'ADJUSTED_PRIORITY' | 'NEEDS_INFO' | 'DUPLICATE'>('VERIFIED');
  const [newPriority, setNewPriority] = useState<PriorityLevel>(incident?.priority || 'P1');
  const [reviewNote, setReviewNote] = useState('');
  const [contactConfirmed, setContactConfirmed] = useState(true);
  const [locationConfirmed, setLocationConfirmed] = useState(true);
  const [vulnerableConfirmed, setVulnerableConfirmed] = useState(incident?.hasBedriddenOrElderly || false);
  const [boatNeedConfirmed, setBoatNeedConfirmed] = useState(incident?.needsBoat || false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Post-rescue review state (for resolved incidents)
  const [actualEvacuated, setActualEvacuated] = useState(incident?.estimatedVictims || 2);
  const [reliefPacks, setReliefPacks] = useState(0);
  const [operationSummary, setOperationSummary] = useState('');
  const [submittingPostRescue, setSubmittingPostRescue] = useState(false);

  // Line Alert
  const [sendingLineAlert, setSendingLineAlert] = useState(false);
  const [lineAlertFeedback, setLineAlertFeedback] = useState<string | null>(null);

  if (!incident) return null;

  const priorityMeta = PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.P3;
  const statusMeta = STATUS_CONFIG[incident.status] || STATUS_CONFIG.PENDING;
  const categoryMeta = FLOOD_CATEGORY_METADATA[incident.category] || FLOOD_CATEGORY_METADATA.COMMUNITY_FLOOD;
  const districtInfo = SA_KAEO_DISTRICTS[incident.district];

  const handleUpdateStatus = async (overrideStatus?: IncidentStatus | unknown) => {
    const targetStatus = typeof overrideStatus === 'string' ? (overrideStatus as IncidentStatus) : selectedStatus;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          assignedOfficer: assignedOfficer || currentUser?.name,
          updaterName: currentUser ? `${currentUser.name} (${currentUser.agency || 'เจ้าหน้าที่อุทกภัย'})` : 'ศูนย์บัญชาการอุทกภัยสระแก้ว',
          updateNote: statusNote.trim() || `ปรับสถานะเป็น ${STATUS_CONFIG[targetStatus]?.label || targetStatus}`
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        onStatusUpdated(resJson.data);
        setStatusNote('');
        setSelectedStatus(targetStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const decisionLabels: Record<string, string> = {
        VERIFIED: 'ผ่านการรีวิว (ยืนยันเหตุจริง)',
        ADJUSTED_PRIORITY: `รีวิวปรับความเร่งด่วนเป็น ${newPriority}`,
        NEEDS_INFO: 'รอข้อมูลเพิ่มเติมจากผู้แจ้ง',
        DUPLICATE: 'เหตุซ้ำซ้อน / ยกเลิก'
      };

      const res = await fetch(`/api/incidents/${incident.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: reviewDecision,
          decisionLabel: decisionLabels[reviewDecision],
          reviewedBy: currentUser?.name || 'เจ้าหน้าที่ศูนย์ ปภ.สระแก้ว',
          reviewerAgency: currentUser?.agency || 'สำนักงาน ปภ. จังหวัดสระแก้ว',
          notes: reviewNote.trim() || 'ตรวจสอบข้อมูลเรียบร้อย',
          contactConfirmed,
          locationConfirmed,
          vulnerableConfirmed,
          boatNeedConfirmed,
          previousPriority: incident.priority,
          newPriority: reviewDecision === 'ADJUSTED_PRIORITY' ? newPriority : undefined
        })
      });

      const resJson = await res.json();
      if (resJson.success) {
        onStatusUpdated(resJson.data);
        setReviewNote('');
        setReviewFeedback('✅ บันทึกผลการรีวิวและตรวจสอบเหตุเรียบร้อยแล้ว');
        setTimeout(() => setReviewFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePostRescueReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPostRescue(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/post-rescue-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualEvacuatedCount: actualEvacuated,
          reliefPacksDistributed: reliefPacks,
          operationStatus: 'SUCCESS',
          operationSummary: operationSummary.trim() || 'ภารกิจช่วยเหลือและอพยพเสร็จสิ้นเรียบร้อย',
          reviewedBy: currentUser?.name || 'หัวหน้าชุดกู้ภัย',
          reviewerAgency: currentUser?.agency || 'ศูนย์สั่งการอุทกภัยสระแก้ว'
        })
      });

      const resJson = await res.json();
      if (resJson.success) {
        onStatusUpdated(resJson.data);
        setReviewFeedback('✅ บันทึกผลสรุปการช่วยเหลือและปิดเคสเรียบร้อยแล้ว');
        setTimeout(() => setReviewFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Failed to save post-rescue review:', err);
    } finally {
      setSubmittingPostRescue(false);
    }
  };

  const handleSendLineAlert = async () => {
    setSendingLineAlert(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}/line-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGroup: `ศูนย์สั่งการเรือและกู้ภัยอุทกภัย อ.${incident.district}`
        })
      });
      const resJson = await response.json();
      if (resJson.success) {
        const getRes = await fetch(`/api/incidents/${incident.id}`);
        const getJson = await getRes.json();
        if (getJson.success) {
          onStatusUpdated(getJson.data);
        }
        setLineAlertFeedback('✅ ส่งการแจ้งเตือน Line OA อุทกภัยสำเร็จแล้ว');
        setTimeout(() => setLineAlertFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Line alert error:', err);
    } finally {
      setSendingLineAlert(false);
    }
  };

  const handleDispatchUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    setDispatching(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: unitName.trim(),
          agency: agencyName,
          vehicleType,
          personnelCount,
          updaterName: currentUser ? `${currentUser.name} (${currentUser.agency || 'ศูนย์สั่งการอุทกภัย'})` : 'ศูนย์สั่งการอุทกภัยสระแก้ว'
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        onStatusUpdated(resJson.data);
        setUnitName('');
        setShowDispatchForm(false);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  const hasReviews = incident.reviews && incident.reviews.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden text-slate-100">
        
        {/* Top Header - Clean, Standard */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-sky-300">
              {incident.code}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${priorityMeta.bg} ${priorityMeta.color} ${priorityMeta.border}`}>
              {priorityMeta.label}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenLineSimulator(incident)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-[#06C755] border border-[#06C755]/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Radio className="w-3.5 h-3.5" />
              จำลอง Line OA
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation inside Modal */}
        <div className="px-5 bg-slate-950 border-b border-slate-800 flex items-center gap-1 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2.5 border-b-2 font-medium transition shrink-0 ${
              activeTab === 'info'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ข้อมูลเหตุการณ์ & ผู้ประสบภัย
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-2.5 border-b-2 font-medium transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            การรีวิวและตรวจสอบข้อเท็จจริง {hasReviews ? `(${incident.reviews?.length})` : '(รอรีวิว)'}
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-3 py-2.5 border-b-2 font-medium transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dispatch'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            เรือกู้ภัย & กำลังพล ({incident.dispatchedUnits.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2.5 border-b-2 font-medium transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            ไทม์ไลน์สถานะ ({incident.timeline.length})
          </button>
        </div>

        {/* Feedback alert */}
        {reviewFeedback && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-950 border border-emerald-800 rounded-lg text-xs text-emerald-200 font-medium">
            {reviewFeedback}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* FAST ACTION EMERGENCY COMMAND BAR (เข้าช่วยเหลือแบบทันท่วงที) */}
          <div className="p-3 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-600/60 rounded-xl space-y-2 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ปฏิบัติการเข้าช่วยเหลือด่วน (Fast Response Actions)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                พิกัด: {incident.latitude}, {incident.longitude}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Direct GPS Turn-by-turn Navigation */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[130px] py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                <span>🧭 นำทาง Google Maps</span>
              </a>

              {/* 1-Click Quick Dispatch if Pending or Verified */}
              {(incident.status === 'PENDING' || incident.status === 'VERIFIED') && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('DISPATCHED')}
                  disabled={updatingStatus}
                  className="flex-1 min-w-[140px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>⚡ รับเรื่อง & ส่งเรือช่วยทันที</span>
                </button>
              )}

              {/* 1-Click Quick Resolve if on scene */}
              {(incident.status === 'DISPATCHED' || incident.status === 'ON_SCENE') && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={updatingStatus}
                  className="flex-1 min-w-[130px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✅ ช่วยเหลือสำเร็จแล้ว</span>
                </button>
              )}

              {/* Direct Call to victim */}
              <a
                href={`tel:${incident.reporterPhone}`}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>โทร {incident.reporterPhone}</span>
              </a>

              {/* Share to Line */}
              <a
                href={`https://line.me/R/msg/text/?${encodeURIComponent(
                  `🚨 แจ้งเหตุน้ำท่วมด่วน สระแก้ว!\nรหัส: ${incident.code} (อ.${incident.district})\nระดับน้ำ: ${incident.waterLevelText || 'ท่วมขัง'}\nจุดสังเกต: ${incident.landmark || incident.title}\nผู้ประสบภัย: ${incident.estimatedVictims} คน ${incident.needsBoat ? '(ต้องการเรือด่วน)' : ''}\nเบอร์โทร: ${incident.reporterPhone}\n📍 นำทาง Google Maps: https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <span>LINE กลุ่มกู้ภัย</span>
              </a>
            </div>
          </div>
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Title & Category */}
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="text-blue-300 font-medium">{categoryMeta.label}</span>
                  <span>·</span>
                  <span>อ.{incident.district} {incident.subDistrict ? `(ต.${incident.subDistrict})` : ''}</span>
                  <span>·</span>
                  <span>ลุ่มน้ำ: {districtInfo?.waterBasin || 'คลองพระสะทึง'}</span>
                  <span>·</span>
                  <span>แจ้งเมื่อ: {new Date(incident.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                </div>
                
                <h1 className="text-lg font-bold text-white">
                  {incident.title}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {incident.waterLevelText && (
                    <span className="px-2 py-0.5 bg-slate-800 text-blue-300 border border-slate-700 rounded text-xs font-medium flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-blue-400" />
                      ระดับน้ำ: {incident.waterLevelText}
                    </span>
                  )}
                  {incident.needsBoat && (
                    <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded text-xs font-semibold flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5 text-red-400" />
                      ต้องการเรือกู้ภัย/เรือท้องแบน
                    </span>
                  )}
                  {incident.hasBedriddenOrElderly && (
                    <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-xs font-semibold flex items-center gap-1">
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                      มีผู้ป่วยติดเตียง / คนชราติดค้าง
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs">
                    ผู้ประสบภัย: <strong>{incident.estimatedVictims}</strong> คน
                  </span>
                </div>

                <div className="mt-2.5 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {incident.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </div>

                {/* Attached Incident Images (3 slots) */}
                {incident.images && incident.images.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>รูปภาพแนบจากพื้นที่ ({incident.images.length} รูป)</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        แตะเพื่อดูภาพขยาย
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {incident.images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative aspect-video rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500 bg-slate-900 block transition"
                        >
                          <img
                            src={img}
                            alt={`incident-attachment-${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>ดูรูปขยาย</span>
                          </div>
                          <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-slate-200 text-[10px] font-medium backdrop-blur-xs">
                            ภาพที่ {i + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Quick Action Navigation Bar */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">จุดสังเกต/จุดนัดพบเรือ:</span> {incident.landmark || 'ไม่ระบุ'}
                    <div className="text-[11px] text-slate-400">
                      พิกัด: {incident.latitude}, {incident.longitude} · สถานีตำรวจ: {districtInfo?.policeStation} · รพ.: {districtInfo?.mainHospital}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    นำทาง GPS
                  </a>
                  <a
                    href={`tel:${incident.reporterPhone}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    โทรหาผู้แจ้ง ({incident.reporterPhone})
                  </a>
                </div>
              </div>

              {/* Status Update Section */}
              <div className="p-4 bg-slate-850 border border-slate-750 rounded-lg space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  ควบคุมสถานะการช่วยเหลือ (เจ้าหน้าที่ศูนย์ ปภ.)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(['PENDING', 'VERIFIED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED'] as IncidentStatus[]).map((st) => {
                    const isSelected = selectedStatus === st;
                    const isCurrent = incident.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(st)}
                        className={`p-2 rounded-lg text-center border text-xs transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold border-blue-500'
                            : isCurrent
                            ? 'bg-slate-800 border-slate-600 text-slate-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>{STATUS_CONFIG[st].label}</div>
                        {isCurrent && <div className="text-[10px] text-amber-300">● ปัจจุบัน</div>}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">บันทึกความคืบหน้า</label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="เช่น อพยพขึ้นเรือแล้ว หรือกำลังสูบน้ำ..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ผู้รับผิดชอบเคส</label>
                    <input
                      type="text"
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      placeholder="เช่น นายชลิต ศรีสุข (ปภ.สระแก้ว)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendLineAlert}
                      disabled={sendingLineAlert}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-[#06C755] border border-[#06C755]/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3 h-3" />
                      {sendingLineAlert ? 'กำลังส่ง...' : 'แจ้งเตือน Line OA สู่ชุดกู้ภัย'}
                    </button>
                    {lineAlertFeedback && (
                      <span className="text-xs text-emerald-400">{lineAlertFeedback}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    {updatingStatus ? 'กำลังบันทึก...' : 'บันทึกการปรับสถานะ'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEW (REVAMPED REVIEW SYSTEM) */}
          {activeTab === 'review' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-850 border border-slate-750 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-amber-400" />
                      แบบฟอร์มบันทึกผลการรีวิวและตรวจสอบเหตุ (Incident Review Form)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      เจ้าหน้าที่ตรวจสอบข้อเท็จจริง ทวนสอบผู้แจ้ง ยืนยันพิกัด และประเมินความเร่งด่วนใหม่
                    </p>
                  </div>

                  {hasReviews ? (
                    <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-700 rounded text-emerald-300 font-medium">
                      ผ่านการรีวิวแล้ว ({incident.reviews?.length} ครั้ง)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-950 border border-amber-700 rounded text-amber-300 font-medium">
                      ยังไม่ได้รับการรีวิว
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {/* Verification Checklist */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      เช็คลิสต์การตรวจสอบข้อเท็จจริง (Verification Checklist):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={contactConfirmed}
                          onChange={(e) => setContactConfirmed(e.target.checked)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>โทรยืนยันกับผู้แจ้ง ({incident.reporterPhone})</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={locationConfirmed}
                          onChange={(e) => setLocationConfirmed(e.target.checked)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>ตรวจสอบพิกัดและระดับน้ำในพื้นที่ อ.{incident.district}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={vulnerableConfirmed}
                          onChange={(e) => setVulnerableConfirmed(e.target.checked)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>มีผู้ป่วยติดเตียง / คนชราติดค้างจริง</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={boatNeedConfirmed}
                          onChange={(e) => setBoatNeedConfirmed(e.target.checked)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span>ยืนยันความจำเป็นต้องใช้เรือกู้ภัย</span>
                      </label>
                    </div>
                  </div>

                  {/* Review Decision Buttons */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      ผลการตัดสินใจการรีวิว *:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewDecision('VERIFIED')}
                        className={`p-2 rounded-lg border text-left transition ${
                          reviewDecision === 'VERIFIED'
                            ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>✅ ยืนยันเหตุจริง</div>
                        <div className="text-[10px] text-slate-400">ผ่านการรีวิว</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewDecision('ADJUSTED_PRIORITY')}
                        className={`p-2 rounded-lg border text-left transition ${
                          reviewDecision === 'ADJUSTED_PRIORITY'
                            ? 'bg-amber-950 border-amber-600 text-amber-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>⚡ ปรับความเร่งด่วน</div>
                        <div className="text-[10px] text-slate-400">เปลี่ยนเป็น P1-P4</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewDecision('NEEDS_INFO')}
                        className={`p-2 rounded-lg border text-left transition ${
                          reviewDecision === 'NEEDS_INFO'
                            ? 'bg-sky-950 border-sky-600 text-sky-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>❓ ขอข้อมูลเพิ่ม</div>
                        <div className="text-[10px] text-slate-400">ยังติดต่อไม่ได้</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewDecision('DUPLICATE')}
                        className={`p-2 rounded-lg border text-left transition ${
                          reviewDecision === 'DUPLICATE'
                            ? 'bg-red-950 border-red-600 text-red-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>❌ แจ้งซ้ำ / ยกเลิก</div>
                        <div className="text-[10px] text-slate-400">ยกเลิกเคสนี้</div>
                      </button>
                    </div>
                  </div>

                  {/* Priority selector if adjusted */}
                  {reviewDecision === 'ADJUSTED_PRIORITY' && (
                    <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                      <label className="block font-medium text-amber-200 mb-1">
                        เลือกระดับความเร่งด่วนใหม่ตามการประเมิน:
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

                  {/* Notes textarea */}
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      บันทึกข้อคิดเห็นและผลการตรวจสอบของเจ้าหน้าที่ *:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="เช่น สอบถามผู้ประสบภัยแล้ว น้ำท่วมระดับเอว อาศัยอยู่ 2 คน มีผู้สูงอายุ 1 คน สั่งการส่งเรือ 1 ลำเข้าช่วยเหลือ..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {submittingReview ? 'กำลังบันทึก...' : 'บันทึกผลการรีวิว'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Review History Logs */}
              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  ประวัติการรีวิวและผลการตรวจสอบย้อนหลัง ({incident.reviews?.length || 0})
                </h4>

                {!incident.reviews || incident.reviews.length === 0 ? (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-center">
                    ยังไม่มีประวัติการรีวิวสำหรับเหตุการณ์นี้
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incident.reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-400">
                            {rev.decisionLabel}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(rev.reviewedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })} น.
                          </span>
                        </div>
                        <p className="text-slate-300">
                          {rev.notes}
                        </p>
                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-850 flex items-center justify-between">
                          <span>ผู้รีวิว: {rev.reviewedBy} ({rev.reviewerAgency || 'ปภ.สระแก้ว'})</span>
                          {rev.newPriority && (
                            <span className="text-amber-400 font-medium">ปรับความเร่งด่วน: {rev.newPriority}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Post-Rescue Review for Resolved Cases */}
              <div className="bg-slate-850 border border-slate-750 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  การรีวิวและประเมินผลหลังการช่วยเหลือเสร็จสิ้น (Post-Rescue Review & Closing)
                </h4>

                {incident.postRescueReview ? (
                  <div className="p-3 bg-slate-950 border border-emerald-800/60 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-emerald-300 font-semibold">
                      <span>สถานะ: ช่วยเหลือและปิดเคสเรียบร้อยแล้ว</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(incident.postRescueReview.reviewedAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>อพยพผู้ประสบภัยได้จริง: <strong>{incident.postRescueReview.actualEvacuatedCount}</strong> คน</div>
                      <div>มอบถุงยังชีพ/น้ำดื่ม: <strong>{incident.postRescueReview.reliefPacksDistributed}</strong> ชุด</div>
                    </div>
                    <p className="text-slate-300 text-xs">
                      สรุปผลการปฏิบัติการ: {incident.postRescueReview.operationSummary}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      บันทึกโดย: {incident.postRescueReview.reviewedBy} ({incident.postRescueReview.reviewerAgency})
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePostRescueReview} className="space-y-3">
                    <p className="text-slate-400 text-[11px]">
                      เมื่อภารกิจช่วยเหลือในพื้นที่เสร็จสิ้น ให้บันทึกยอดผู้ที่ได้รับการอพยพจริง และจำนวนถุงยังชีพที่ส่งมอบ
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">ยอดผู้ประสบภัยที่อพยพได้จริง (คน)</label>
                        <input
                          type="number"
                          min={0}
                          value={actualEvacuated}
                          onChange={(e) => setActualEvacuated(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">จำนวนถุงยังชีพ/น้ำดื่มที่มอบ (ชุด)</label>
                        <input
                          type="number"
                          min={0}
                          value={reliefPacks}
                          onChange={(e) => setReliefPacks(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">สรุปผลการปฏิบัติการและข้อคิดเห็น</label>
                      <textarea
                        rows={2}
                        value={operationSummary}
                        onChange={(e) => setOperationSummary(e.target.value)}
                        placeholder="เช่น อพยพผู้ป่วยติดเตียงส่ง รพ. ปลอดภัยเรียบร้อย ระดับน้ำเริ่มลดลง..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingPostRescue}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                      >
                        {submittingPostRescue ? 'กำลังบันทึก...' : 'บันทึกผลการช่วยเหลือและปิดเคส'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH UNITS */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-blue-400" />
                  เรือกู้ภัยและกำลังพลที่ส่งเข้าพื้นที่ ({incident.dispatchedUnits.length} ชุด)
                </h3>
                <button
                  onClick={() => setShowDispatchForm(!showDispatchForm)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition"
                >
                  {showDispatchForm ? 'ยกเลิก' : '+ สั่งการส่งเรือ/กำลังพลเพิ่ม'}
                </button>
              </div>

              {/* Add Dispatch Unit Form */}
              {showDispatchForm && (
                <form onSubmit={handleDispatchUnit} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="font-semibold text-blue-300">ระบุรายละเอียดการส่งเรือ/ทีมกู้ภัยอุทกภัย</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">ชื่อรหัสชุดปฏิบัติการ / รหัสเรือ *</label>
                      <input
                        type="text"
                        required
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                        placeholder="เช่น สว่างสระแก้ว เรือท้องแบน 02"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">สังกัดหน่วยงาน</label>
                      <select
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="หน่วยกู้ภัยสว่างสระแก้ว (ชุดกู้ภัยทางน้ำ)">หน่วยกู้ภัยสว่างสระแก้ว (ชุดกู้ภัยทางน้ำ)</option>
                        <option value="หน่วยกู้ภัยร่วมกตัญญู สระแก้ว">หน่วยกู้ภัยร่วมกตัญญู สระแก้ว</option>
                        <option value="สำนักงาน ปภ. จังหวัดสระแก้ว">สำนักงาน ปภ. จังหวัดสระแก้ว</option>
                        <option value="รพ.สมเด็จพระยุพราชสระแก้ว (EMS 1669)">รพ.สมเด็จพระยุพราชสระแก้ว (EMS 1669)</option>
                        <option value="กองทัพบก / ทหารช่าง / ตชด.">กองทัพบก / ทหารช่าง / ตชด.</option>
                        <option value="เหล่ากาชาดจังหวัดสระแก้ว (ถุงยังชีพ)">เหล่ากาชาดจังหวัดสระแก้ว (ถุงยังชีพ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">ประเภทยานพาหนะทางน้ำ / รถยกสูง</label>
                      <input
                        type="text"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        placeholder="เช่น เรือท้องแบนติดเครื่องยนต์, รถบรรทุกยกสูง"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">จำนวนเจ้าหน้าที่กู้ภัย (นาย)</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={personnelCount}
                        onChange={(e) => setPersonnelCount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={dispatching}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    ยืนยันการสั่งการเรือและแจ้งเตือน Line OA
                  </button>
                </form>
              )}

              {/* List of active dispatched units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {incident.dispatchedUnits.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-blue-400" />
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.agency} · {u.vehicleType}</div>
                      <div className="text-[10px] text-slate-400">
                        กำลังพล {u.personnelCount} นาย · สั่งการเมื่อ {new Date(u.dispatchedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.status === 'on_scene' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                      u.status === 'cleared' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {u.status === 'on_scene' ? 'ถึงจุดน้ำท่วม' : u.status === 'cleared' ? 'ภารกิจสำเร็จ' : 'กำลังนำเรือไป'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-semibold text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                ประวัติไทม์ไลน์และลำดับเหตุการณ์
              </h3>

              <div className="space-y-2 border-l-2 border-slate-700 pl-3 ml-2">
                {incident.timeline.map((item) => (
                  <div key={item.id} className="relative space-y-0.5 pb-2">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-900" />
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-200">{item.status}</span>
                      <span>{new Date(item.updatedAt).toLocaleTimeString('th-TH')} น.</span>
                    </div>
                    <p className="text-slate-300">{item.note}</p>
                    <div className="text-[10px] text-slate-400">โดย: {item.updatedBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
