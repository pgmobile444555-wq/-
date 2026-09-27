import React, { useEffect, useRef, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { IncidentListView } from './components/IncidentListView';
import { IncidentReviewView } from './components/IncidentReviewView';
import { IncidentMap } from './components/IncidentMap';
import { LineOaSimulatorModal } from './components/LineOaSimulatorModal';
import { OfficerManagementView } from './components/OfficerManagementView';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { StatsDashboard } from './components/StatsDashboard';
import { DistrictHubView } from './components/DistrictHubView';
import { UrgentAlertCenterModal } from './components/UrgentAlertCenterModal';
import { UrgentAlertTicker } from './components/UrgentAlertTicker';
import { RealtimeIncidentFeedUnderMap } from './components/RealtimeIncidentFeedUnderMap';
import { playEmergencyAlertTone } from './utils/soundAlert';
import { SA_KAEO_DISTRICTS } from './data/saKaeoDistricts';
import { Incident, IncidentStats, Officer, SaKaeoDistrict, UserProfile } from './types/incident';
import { 
  Waves, 
  Map, 
  ListFilter, 
  BarChart3, 
  Radio, 
  Plus, 
  Bell, 
  RefreshCw,
  ClipboardCheck,
  Users,
  Building2,
  ShieldAlert,
  Navigation,
  Zap,
  Phone,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'review' | 'districts' | 'stats' | 'officers'>('map');
  
  // District-separated operational access
  const [activeDistrict, setActiveDistrict] = useState<string>(() => {
    return localStorage.getItem('sa_kaeo_district') || 'ALL';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'off-01',
    name: 'นายชลิต ศรีสุข',
    phone: '084-555-1784',
    role: 'officer',
    agency: 'สำนักงาน ปภ. จังหวัดสระแก้ว (ศูนย์ช่วยเหลืออุทกภัย)',
    badgeNumber: 'DDPM-SK-08',
    isVerified: true
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLineSimulatorOpen, setIsLineSimulatorOpen] = useState(false);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [lineModalIncident, setLineModalIncident] = useState<Incident | null>(null);
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number; district?: SaKaeoDistrict } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Immediate Alert for incoming incident so responders see it instantly
  const [incomingAlert, setIncomingAlert] = useState<Incident | null>(null);
  const knownIncidentIdsRef = useRef<Set<string>>(new Set());

  // Fetch initial data & live polling
  const fetchData = async () => {
    try {
      const [incRes, statsRes, offRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/stats'),
        fetch('/api/officers')
      ]);

      const incData = await incRes.json();
      const statsData = await statsRes.json();
      const offData = await offRes.json();

      if (incData.success && Array.isArray(incData.data)) {
        const fetchedList: Incident[] = incData.data;

        // Detect newly arrived incidents for instant responder alerting
        if (knownIncidentIdsRef.current.size > 0) {
          const newArrivals = fetchedList.filter(
            i => !knownIncidentIdsRef.current.has(i.id) && i.status !== 'RESOLVED'
          );
          if (newArrivals.length > 0) {
            const latestNew = newArrivals[0];
            setIncomingAlert(latestNew);
            if (soundEnabled) {
              playEmergencyAlertTone();
            }
          }
        }

        // Populate known IDs
        fetchedList.forEach(i => knownIncidentIdsRef.current.add(i.id));
        setIncidents(fetchedList);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
      if (offData.success) {
        setOfficers(offData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDistrictChange = (d: string) => {
    setActiveDistrict(d);
    localStorage.setItem('sa_kaeo_district', d);
    if (d !== 'ALL') {
      setNotificationToast(`🏛️ สลับพื้นที่ปฏิบัติการ: อำเภอ${d}`);
      setTimeout(() => setNotificationToast(null), 3500);
    } else {
      setNotificationToast('🏛️ สลับโหมดการทำงาน: ส่วนกลาง (ทุกอำเภอ)');
      setTimeout(() => setNotificationToast(null), 3000);
    }
  };

  const handleIncidentCreated = (newIncident: Incident) => {
    knownIncidentIdsRef.current.add(newIncident.id);
    setIncidents([newIncident, ...incidents]);
    setIncomingAlert(newIncident);
    fetchData();

    // Play synthesized emergency alert tone for P1 / Boat cases
    if (soundEnabled) {
      playEmergencyAlertTone();
    }

    setNotificationToast(`🚨 ได้รับแจ้งเหตุด่วน (${newIncident.code}): ${newIncident.title} (อ.${newIncident.district})`);
    setTimeout(() => setNotificationToast(null), 5000);
  };

  const handleStatusUpdated = (updated: Incident) => {
    setIncidents(incidents.map(i => i.id === updated.id ? updated : i));
    setSelectedIncident(updated);
    fetchData();
    setNotificationToast(`อัปเดตสถานะสำเร็จ (${updated.code}): ${updated.status}`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // 1-Click Fast Dispatch for Responders (เข้าช่วยเหลือแบบทันท่วงที)
  const handleQuickDispatch = async (incident: Incident) => {
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DISPATCHED',
          updaterName: currentUser?.name || 'ศูนย์กู้ภัยสระแก้ว (สั่งการด่วน)',
          updateNote: 'กดรับเรื่องด่วน ส่งทีมเรือกู้ภัยและเจ้าหน้าที่เข้าพื้นที่ทันที'
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        handleStatusUpdated(resJson.data);
        if (incomingAlert?.id === incident.id) {
          setIncomingAlert(null);
        }
        setNotificationToast(`⚡ สั่งการด่วนสำเร็จ (${incident.code}): ชุดเรือกู้ภัยกำลังเดินทางเข้าช่วยเหลือ`);
        setTimeout(() => setNotificationToast(null), 5000);
      }
    } catch (err) {
      console.error('Quick dispatch failed:', err);
    }
  };

  // 1-Click Quick Resolve
  const handleQuickResolve = async (incident: Incident) => {
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          updaterName: currentUser?.name || 'เจ้าหน้าที่ชุดกู้ภัยสระแก้ว',
          updateNote: 'ช่วยเหลือผู้ประสบภัยปลอดภัยเรียบร้อยแล้ว'
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        handleStatusUpdated(resJson.data);
        setNotificationToast(`✅ บันทึกสำเร็จ (${incident.code}): ช่วยเหลือผู้ประสบภัยปลอดภัยแล้ว`);
        setTimeout(() => setNotificationToast(null), 4000);
      }
    } catch (err) {
      console.error('Quick resolve failed:', err);
    }
  };

  const handleReportAtCoords = (coords: { lat: number; lng: number; district?: SaKaeoDistrict }) => {
    setReportCoords(coords);
    setIsReportOpen(true);
  };

  const handleOpenLineSimulator = (inc: Incident) => {
    setLineModalIncident(inc);
    setIsLineSimulatorOpen(true);
  };

  const unreviewedCount = incidents.filter(i => !i.reviews || i.reviews.length === 0).length;
  
  // Urgent cases count (P1 or boat requests not yet resolved)
  const urgentCasesCount = incidents.filter(i => {
    const isUrgent = (i.priority === 'P1' || i.needsBoat) && i.status !== 'RESOLVED';
    if (!isUrgent) return false;
    if (activeDistrict !== 'ALL' && i.district !== activeDistrict) return false;
    return true;
  }).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header - Streamlined, Non-Overlapping */}
      <header className="sticky top-0 z-30 bg-slate-850 border-b border-slate-750 shadow-md">
        
        {/* Main Row: Branding + Urgent Alert Button + District Selector + User + Actions */}
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-500 flex items-center justify-center text-white shrink-0">
              <Waves className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white truncate leading-tight flex items-center gap-1.5">
                  <span className="text-white font-extrabold tracking-tight">สระแก้วช่วยด้วย</span>
                  <span className="text-[11px] font-normal text-slate-300 hidden md:inline">· ศูนย์แจ้งเหตุน้ำท่วมและช่วยเหลือฉุกเฉิน</span>
                </h1>
                {activeDistrict !== 'ALL' ? (
                  <span className="px-2 py-0.5 rounded bg-blue-600/90 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    อ.{activeDistrict}
                  </span>
                ) : (
                  <span className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 shrink-0">
                    ส่วนกลาง (9 อำเภอ)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: Urgent Bell Channel + District Scope Selector & User Profile & Report Button */}
          <div className="flex items-center gap-2 ml-auto">
            
            {/* CORE FEATURE: Urgent Status Notification Button */}
            <button
              type="button"
              onClick={() => setIsAlertCenterOpen(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border shrink-0 ${
                urgentCasesCount > 0
                  ? 'bg-red-950/90 text-red-200 border-red-700 hover:bg-red-900/90 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="เปิดช่องการแจ้งเตือนสถานะเคสเร่งด่วน (Urgent Alerts Channel)"
            >
              <Bell className={`w-3.5 h-3.5 ${urgentCasesCount > 0 ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">เตือนเคสด่วน</span>
              {urgentCasesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
                  {urgentCasesCount}
                </span>
              )}
            </button>

            {/* Direct District Selector Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={activeDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">🏛️ ทุกอำเภอ (ส่วนกลาง)</option>
                {Object.keys(SA_KAEO_DISTRICTS).map(d => (
                  <option key={d} value={d} className="bg-slate-900 text-white">📍 อ.{d}</option>
                ))}
              </select>
            </div>

            {/* User Profile Toggle */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs transition"
              title="เข้าสู่ระบบ / สลับบัญชี"
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                {currentUser?.role === 'commander' ? 'ผบ' : currentUser?.role === 'officer' ? 'ปภ' : 'ปช'}
              </div>
              <span className="text-slate-200 font-medium text-xs hidden sm:inline max-w-[90px] truncate">
                {currentUser?.name || 'เข้าสู่ระบบ'}
              </span>
            </button>

            {/* Quick Report Button */}
            <button
              onClick={() => {
                setReportCoords(null);
                setIsReportOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-1 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>แจ้งน้ำท่วม</span>
            </button>
          </div>
        </div>

        {/* Live Urgent Alert Ticker - Automatically shows if there are active P1/Urgent cases */}
        <UrgentAlertTicker
          incidents={incidents}
          activeDistrict={activeDistrict}
          onOpenAlertCenter={() => setIsAlertCenterOpen(true)}
          onSelectIncident={(inc) => {
            setSelectedIncident(inc);
            setActiveTab('map');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />

        {/* Navigation Tabs Bar - Flat, Clean, No Vertical Sprawl */}
        <div className="border-t border-slate-750/80 bg-slate-900 px-3 sm:px-5">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-thin">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>แผนที่ {activeDistrict !== 'ALL' ? `(อ.${activeDistrict})` : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>รายการเหตุ ({incidents.filter(i => activeDistrict === 'ALL' || i.district === activeDistrict).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'review'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-850'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>รีวิวและตรวจสอบ</span>
              {unreviewedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  activeTab === 'review' ? 'bg-amber-800 text-white' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {unreviewedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('districts')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'districts'
                  ? 'bg-blue-600 text-white'
                  : 'text-sky-400 hover:text-sky-300 hover:bg-slate-850'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>แยกตาม 9 อำเภอ</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>สรุปสถิติ</span>
            </button>

            <button
              onClick={() => setActiveTab('officers')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                activeTab === 'officers'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>เจ้าหน้าที่ ({officers.length})</span>
            </button>

            <button
              onClick={() => {
                if (incidents.length > 0) {
                  handleOpenLineSimulator(incidents[0]);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 text-[#06C755] hover:bg-slate-800 border border-[#06C755]/30 transition ml-auto"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>จำลอง Line OA</span>
            </button>
          </div>
        </div>
      </header>

      {/* High-Visibility Incoming Emergency Alert Banner for Responders (คนรับแจ้งเห็นทันที ไม่พลาดแม้แต่วินาทีเดียว) */}
      {incomingAlert && (
        <div className="sticky top-[95px] sm:top-[105px] z-20 bg-gradient-to-r from-red-600 via-rose-700 to-amber-600 text-white px-4 py-3 shadow-2xl border-y-2 border-amber-300 animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shrink-0 animate-bounce">
                🚨
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/40">
                    {incomingAlert.code}
                  </span>
                  <span className="font-bold text-sm text-white">
                    มีผู้แจ้งขอน้ำท่วมใหม่! (อ.{incomingAlert.district})
                  </span>
                  {incomingAlert.needsBoat && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-red-700 text-xs font-bold flex items-center gap-1 shadow-sm">
                      🚤 ขอเรือด่วน
                    </span>
                  )}
                  {incomingAlert.hasBedriddenOrElderly && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-300 text-white text-xs font-medium">
                      มีผู้ป่วยติดเตียง
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/90 line-clamp-1 mt-0.5">
                  {incomingAlert.title} · จุดสังเกต: {incomingAlert.landmark || 'ไม่ระบุ'} · ผู้แจ้ง: {incomingAlert.reporterName} ({incomingAlert.reporterPhone})
                </p>
              </div>
            </div>

            {/* Immediate Action Buttons (เข้าช่วยเหลือแบบทันท่วงที) */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {/* 1-Click Dispatch & Accept */}
              <button
                type="button"
                onClick={() => handleQuickDispatch(incomingAlert)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition"
                title="กดรับเรื่องและสั่งการส่งเรือช่วยเหลือทันที"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>⚡ รับเรื่อง & ส่งเรือช่วยทันที</span>
              </button>

              {/* 1-Click GPS Navigation */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${incomingAlert.latitude},${incomingAlert.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition"
                title="เปิด Google Maps นำทางตรงไปยังจุดเกิดเหตุทันที"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                <span>🧭 นำทาง Google Maps</span>
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${incomingAlert.reporterPhone}`}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition"
                title="กดโทรคุยกับผู้แจ้งทันที"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>โทร {incomingAlert.reporterPhone}</span>
              </a>

              {/* Dismiss / Close Alert */}
              <button
                type="button"
                onClick={() => setIncomingAlert(null)}
                className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition"
                title="ปิดการแจ้งเตือนนี้"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast - Placed at bottom-right so it NEVER overlaps navigation */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-[10000] bg-slate-850 border border-slate-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <Bell className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="text-xs leading-snug">{notificationToast}</div>
          <button onClick={() => setNotificationToast(null)} className="ml-auto text-slate-400 hover:text-white p-0.5">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">กำลังเชื่อมต่อข้อมูลศูนย์บัญชาการอุทกภัยจังหวัดสระแก้ว...</p>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <div className="space-y-4">
                <IncidentMap
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onReportAtCoords={handleReportAtCoords}
                  activeDistrict={activeDistrict}
                  onSelectDistrict={handleDistrictChange}
                />

                {/* Real-time Incident Feed Directly Under Map */}
                <RealtimeIncidentFeedUnderMap
                  incidents={incidents}
                  selectedIncident={selectedIncident}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onOpenIncidentDetail={(inc) => setSelectedIncident(inc)}
                  onOpenLineSimulator={handleOpenLineSimulator}
                  onScrollToMap={() => {
                    const el = document.getElementById('flood-map-container');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  onQuickDispatch={handleQuickDispatch}
                  onQuickResolve={handleQuickResolve}
                  activeDistrict={activeDistrict}
                />
              </div>
            )}

            {activeTab === 'list' && (
              <IncidentListView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onOpenLineSimulator={handleOpenLineSimulator}
                onOpenReportModal={() => {
                  setReportCoords(null);
                  setIsReportOpen(true);
                }}
                onOpenReviewTab={() => setActiveTab('review')}
                activeDistrict={activeDistrict}
                onSelectDistrict={handleDistrictChange}
              />
            )}

            {activeTab === 'review' && (
              <IncidentReviewView
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onRefreshData={fetchData}
                activeDistrict={activeDistrict}
                onSelectDistrict={handleDistrictChange}
              />
            )}

            {activeTab === 'districts' && (
              <DistrictHubView
                incidents={incidents}
                officers={officers}
                activeDistrict={activeDistrict}
                onSelectDistrict={handleDistrictChange}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'stats' && stats && (
              <StatsDashboard
                stats={stats}
                incidents={incidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                activeDistrict={activeDistrict}
                onSelectDistrict={handleDistrictChange}
              />
            )}

            {activeTab === 'officers' && (
              <OfficerManagementView
                officers={officers}
                currentUser={currentUser}
                onRefreshOfficers={fetchData}
                activeDistrict={activeDistrict}
                onSelectDistrict={handleDistrictChange}
                onSwitchUser={(officer) => {
                  setCurrentUser({
                    id: officer.id,
                    name: officer.name,
                    phone: officer.phone,
                    role: officer.role === 'commander' ? 'commander' : 'officer',
                    agency: officer.agency,
                    badgeNumber: officer.badgeNumber,
                    isVerified: true
                  });
                  setNotificationToast(`สลับบัญชีเป็น: ${officer.name}`);
                  setTimeout(() => setNotificationToast(null), 3500);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Standard Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-850 px-4 py-2 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            สระแก้วช่วยด้วย - ศูนย์บัญชาการเหตุการณ์อุทกภัยและน้ำท่วมฉุกเฉิน จังหวัดสระแก้ว (ครอบคลุม 9 อำเภอ)
          </span>
          <span className="text-slate-400">
            {activeDistrict !== 'ALL' ? `พื้นที่ปัจจุบัน: อ.${activeDistrict}` : 'โหมดควบคุมส่วนกลาง: 9 อำเภอ'}
          </span>
        </div>
      </footer>

      {/* Modals - Clean Overlay and Non-Colliding Z-Index */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        officers={officers}
        activeDistrict={activeDistrict}
        onOpenOfficerManagement={() => {
          setIsAuthOpen(false);
          setActiveTab('officers');
        }}
        onLogin={(user, district) => {
          setCurrentUser(user);
          if (district) {
            handleDistrictChange(district);
          }
          setNotificationToast(
            `เข้าสู่ระบบสำเร็จ: ${user.name} ${district && district !== 'ALL' ? `(ประจำ อ.${district})` : '(ส่วนกลาง 9 อำเภอ)'}`
          );
          setTimeout(() => setNotificationToast(null), 3500);
        }}
        onClose={() => setIsAuthOpen(false)}
      />

      <ReportIncidentModal
        isOpen={isReportOpen}
        currentUser={currentUser}
        initialCoords={
          reportCoords || (activeDistrict !== 'ALL' ? {
            lat: SA_KAEO_DISTRICTS[activeDistrict as SaKaeoDistrict].lat,
            lng: SA_KAEO_DISTRICTS[activeDistrict as SaKaeoDistrict].lng,
            district: activeDistrict as SaKaeoDistrict
          } : null)
        }
        onIncidentCreated={handleIncidentCreated}
        onClose={() => {
          setIsReportOpen(false);
          setReportCoords(null);
        }}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        currentUser={currentUser}
        officers={officers}
        onClose={() => setSelectedIncident(null)}
        onStatusUpdated={handleStatusUpdated}
        onOpenLineSimulator={handleOpenLineSimulator}
      />

      <LineOaSimulatorModal
        isOpen={isLineSimulatorOpen}
        incident={lineModalIncident || (incidents[0] ?? null)}
        onClose={() => {
          setIsLineSimulatorOpen(false);
          setLineModalIncident(null);
        }}
      />

      {/* CORE MODAL: Urgent Status Case Alert Center */}
      <UrgentAlertCenterModal
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        incidents={incidents}
        activeDistrict={activeDistrict}
        onSelectIncident={(inc) => {
          setSelectedIncident(inc);
        }}
        onOpenLineSimulator={handleOpenLineSimulator}
        onNavigateToMap={(inc) => {
          if (inc) setSelectedIncident(inc);
          setActiveTab('map');
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onPlayAlertSound={() => playEmergencyAlertTone()}
      />
    </div>
  );
}
