import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { FloodCategory, SaKaeoDistrict, UserProfile } from '../types/incident';
import { resolveCurrentLocation, getClosestDistrict } from '../utils/locationService';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  Waves, 
  MapPin, 
  Phone, 
  LifeBuoy, 
  AlertOctagon, 
  Home, 
  Package, 
  CheckCircle2, 
  Ship, 
  LocateFixed, 
  X, 
  ClipboardCheck, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Check, 
  HelpCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Smartphone
} from 'lucide-react';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onIncidentCreated: (newIncident: any) => void;
  initialCoords?: { lat: number; lng: number; district?: SaKaeoDistrict } | null;
}

const CATEGORIES: { id: FloodCategory; label: string; icon: React.ElementType }[] = [
  { id: 'TRAPPED_EVAC', label: 'คนติดค้างในบ้าน / ขอเรือด่วน', icon: LifeBuoy },
  { id: 'COMMUNITY_FLOOD', label: 'น้ำท่วมขังบ้านเรือน/ชุมชน', icon: Home },
  { id: 'ROAD_CUTOFF', label: 'น้ำป่าไหลหลาก / ถนนสะพานขาด', icon: AlertOctagon },
  { id: 'RELIEF_SUPPLIES', label: 'ขอถุงยังชีพ / น้ำดื่มสะอาด', icon: Package }
];

const WATER_DEPTH_OPTIONS = [
  'ระดับเข่า (30-50 ซม.)',
  'ระดับเอว (50-80 ซม.)',
  'ระดับอก (90-120 ซม.)',
  'มิดชั้น 1 (เกิน 1.5 ม.)'
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514668814759-9b48f9888636?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1455380594633-a204ef6cb730?auto=format&fit=crop&w=800&q=80'
];

const IMAGE_SLOT_DESCRIPTIONS = [
  { title: 'ช่องที่ 1: สภาพน้ำท่วม / ระดับน้ำ', hint: 'ถ่ายให้เห็นระดับน้ำเทียบกับตัวบ้าน เสา หรือถนน' },
  { title: 'ช่องที่ 2: จุดสังเกต / ทางเข้าจุดเกิดเหตุ', hint: 'ถ่ายทางเข้า สะพาน ซอย หรือจุดเด่นเพื่อให้เรือเข้าถูก' },
  { title: 'ช่องที่ 3: ผู้ประสบภัย / สภาพแวดล้อม', hint: 'ถ่ายบริเวณที่ผู้ประสบภัยอยู่ หรือของใช้จำเป็นที่ต้องการ' }
];

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onIncidentCreated,
  initialCoords
}) => {
  // Step state: 'form' | 'review' | 'success'
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  const [category, setCategory] = useState<FloodCategory>('COMMUNITY_FLOOD');
  const [district, setDistrict] = useState<SaKaeoDistrict>(initialCoords?.district || 'เมืองสระแก้ว');
  const [waterDepth, setWaterDepth] = useState(WATER_DEPTH_OPTIONS[1]);
  const [landmark, setLandmark] = useState('');
  const [needsBoat, setNeedsBoat] = useState<boolean>(true);
  const [hasBedriddenOrElderly, setHasBedriddenOrElderly] = useState<boolean>(false);
  const [reporterPhone, setReporterPhone] = useState(currentUser?.phone || '');
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [victimCount, setVictimCount] = useState<number>(2);

  // 3-SLOT IMAGE ATTACHMENT STATE
  const [images, setImages] = useState<string[]>(['', '', '']);

  // Real-time coordinates
  const [latitude, setLatitude] = useState<number>(initialCoords?.lat || SA_KAEO_DISTRICTS['เมืองสระแก้ว'].lat);
  const [longitude, setLongitude] = useState<number>(initialCoords?.lng || SA_KAEO_DISTRICTS['เมืองสระแก้ว'].lng);
  
  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'active' | 'error'>('idle');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Mobile Check-in State (อ้างอิงจากตำแหน่งมือถือการเช็คอิน)
  const [checkinInfo, setCheckinInfo] = useState<{
    isChecking: boolean;
    isSuccess: boolean;
    accuracy: number | null;
    sourceLabel: string;
    time: string;
    isCustomPinned: boolean;
    error: string | null;
  }>({
    isChecking: false,
    isSuccess: false,
    accuracy: null,
    sourceLabel: '',
    time: '',
    isCustomPinned: false,
    error: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Mobile Check-in Logic
  const handleMobileCheckin = async (isAuto = false) => {
    setCheckinInfo(prev => ({ ...prev, isChecking: true, error: null }));
    setGpsStatus('searching');

    try {
      const loc = await resolveCurrentLocation();
      const dLat = loc.lat;
      const dLng = loc.lng;
      const dDist = loc.district;
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      setLatitude(dLat);
      setLongitude(dLng);
      setDistrict(dDist);
      setGpsAccuracy(loc.accuracy);
      setGpsStatus('active');

      setCheckinInfo({
        isChecking: false,
        isSuccess: true,
        accuracy: loc.accuracy,
        sourceLabel: loc.sourceLabel,
        time: timeStr,
        isCustomPinned: false,
        error: null
      });

      updatePinPosition(dLat, dLng, 14, loc.accuracy);
    } catch (err: unknown) {
      console.warn('Mobile checkin failed:', err);
      setCheckinInfo(prev => ({
        ...prev,
        isChecking: false,
        error: 'ไม่สามารถอ่านพิกัดมือถือได้ กรุณากดอนุญาตการเข้าถึงตำแหน่ง หรือเลือกบนแผนที่'
      }));
      setGpsStatus('error');
    }
  };

  // Sync initialCoords or trigger auto mobile check-in
  useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
      if (initialCoords.district) {
        setDistrict(initialCoords.district);
      } else {
        setDistrict(getClosestDistrict(initialCoords.lat, initialCoords.lng));
      }
      setCheckinInfo({
        isChecking: false,
        isSuccess: true,
        accuracy: 10,
        sourceLabel: 'พิกัดที่ระบุจากการคลิกแผนที่',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isCustomPinned: true,
        error: null
      });
    }
  }, [initialCoords]);

  // Reset step & trigger mobile check-in when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSubmittedData(null);
      setErrorMsg('');

      // Auto check-in mobile location if opened without a pre-pinned coordinate
      if (!initialCoords) {
        handleMobileCheckin(true);
      }
    }
  }, [isOpen]);

  // Mini-map initialization (only in 'form' step)
  useEffect(() => {
    if (!isOpen || step !== 'form') return;

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      if (!miniMapInstanceRef.current) {
        const map = L.map(miniMapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 13,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        const pinIcon = L.divIcon({
          html: `
            <div class="flex items-center justify-center cursor-pointer">
              <div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold shadow-blue-900/60 animate-bounce">
                📱
              </div>
            </div>
          `,
          className: 'modal-pin-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([latitude, longitude], {
          icon: pinIcon,
          draggable: true
        }).addTo(map);

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(5));
          const dLng = Number(pos.lng.toFixed(5));
          setLatitude(dLat);
          setLongitude(dLng);
          setDistrict(getClosestDistrict(dLat, dLng));
          setCheckinInfo(prev => ({ ...prev, isCustomPinned: true }));
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          const dLat = Number(e.latlng.lat.toFixed(5));
          const dLng = Number(e.latlng.lng.toFixed(5));
          marker.setLatLng([dLat, dLng]);
          setLatitude(dLat);
          setLongitude(dLng);
          setDistrict(getClosestDistrict(dLat, dLng));
          setCheckinInfo(prev => ({ ...prev, isCustomPinned: true }));
        });

        miniMapInstanceRef.current = map;
        pinMarkerRef.current = marker;
      } else {
        miniMapInstanceRef.current.invalidateSize();
        miniMapInstanceRef.current.setView([latitude, longitude], 13);
        if (pinMarkerRef.current) {
          pinMarkerRef.current.setLatLng([latitude, longitude]);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, step]);

  // Clean up
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  const updatePinPosition = (lat: number, lng: number, zoom = 13, accuracy?: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setDistrict(getClosestDistrict(lat, lng));
    if (miniMapInstanceRef.current && pinMarkerRef.current) {
      pinMarkerRef.current.setLatLng([lat, lng]);
      miniMapInstanceRef.current.setView([lat, lng], zoom);

      if (accuracy) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle([lat, lng], {
            radius: Math.max(accuracy, 15),
            color: '#3b82f6',
            fillColor: '#60a5fa',
            fillOpacity: 0.15,
            weight: 1
          }).addTo(miniMapInstanceRef.current);
        } else {
          accuracyCircleRef.current.setLatLng([lat, lng]);
          accuracyCircleRef.current.setRadius(Math.max(accuracy, 15));
        }
      }
    }
  };

  const handleDistrictChange = (d: SaKaeoDistrict) => {
    setDistrict(d);
    const info = SA_KAEO_DISTRICTS[d];
    if (info) {
      updatePinPosition(info.lat, info.lng, 12);
    }
  };

  const startRealtimeGps = async () => {
    setGpsStatus('searching');
    setGpsErrorMsg(null);
    setIsGpsTracking(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    let gotGps = false;

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          gotGps = true;
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const acc = Math.round(pos.coords.accuracy);

          setGpsAccuracy(acc);
          setGpsStatus('active');
          setGpsErrorMsg(null);
          updatePinPosition(lat, lng, 14, acc);
        },
        async (err) => {
          console.warn('GPS error, switching to IP fallback:', err);
          if (!gotGps) {
            setGpsErrorMsg('กำลังใช้ตำแหน่งสำรองผ่านเครือข่าย');
            try {
              const fallback = await resolveCurrentLocation();
              setGpsAccuracy(fallback.accuracy);
              setGpsStatus('active');
              updatePinPosition(fallback.lat, fallback.lng, 13, fallback.accuracy);
            } catch {
              setGpsStatus('error');
              setGpsErrorMsg('ไม่สามารถรับพิกัดได้ กรุณาแตะเลือกบนแผนที่');
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
        }
      );
    } else {
      const fallback = await resolveCurrentLocation();
      setGpsAccuracy(fallback.accuracy);
      setGpsStatus('active');
      setGpsErrorMsg(null);
      updatePinPosition(fallback.lat, fallback.lng, 13, fallback.accuracy);
    }
  };

  const stopRealtimeGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (accuracyCircleRef.current && miniMapInstanceRef.current) {
      miniMapInstanceRef.current.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }
    setIsGpsTracking(false);
    setGpsStatus('idle');
    setGpsAccuracy(null);
  };

  const toggleRealtimeGps = () => {
    if (isGpsTracking) {
      stopRealtimeGps();
    } else {
      startRealtimeGps();
    }
  };

  // Image Upload Handlers for 3 slots with automatic compression
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์รูปภาพเกิน 15MB กรุณาเลือกภาพที่มีขนาดเล็กกว่า');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 1280, 0.8);
      setImages(prev => {
        const next = [...prev];
        next[index] = compressedDataUrl;
        return next;
      });
    } catch (err) {
      console.warn('Compression failed, falling back to direct reader:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImages(prev => {
          const next = [...prev];
          next[index] = dataUrl;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  };

  const handleSetSamplePhoto = (index: number, url: string) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterPhone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์สำหรับติดต่อกลับ');
      return;
    }
    setErrorMsg('');
    setStep('review');
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const selectedCat = CATEGORIES.find(c => c.id === category);
    const autoTitle = `${selectedCat?.label || 'เหตุน้ำท่วม'} ${landmark ? `(${landmark})` : ''} อ.${district}`;

    // Clean up empty image slots
    const validImages = images.filter(img => Boolean(img && img.trim()));

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          description: `แจ้งเหตุน้ำท่วม อ.${district} ${landmark ? `จุดสังเกต: ${landmark}` : ''} ระดับน้ำ: ${waterDepth} ${hasBedriddenOrElderly ? '(มีผู้ป่วยติดเตียง)' : ''} ${needsBoat ? '(ต้องการเรือด่วน)' : ''}`,
          category,
          district,
          landmark,
          waterLevelText: waterDepth,
          latitude,
          longitude,
          reporterName: reporterName.trim() || 'ประชาชนผู้ประสบอุทกภัย',
          reporterPhone: reporterPhone.trim(),
          estimatedVictims: victimCount,
          needsBoat,
          hasBedriddenOrElderly,
          images: validImages
        })
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || 'ส่งข้อมูลไม่สำเร็จ');
      }

      setSubmittedData(resJson.data);
      onIncidentCreated(resJson.data);
      setStep('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-xl shadow-xl overflow-hidden text-slate-100">
        
        {/* Clean Standard Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm text-white">
              {step === 'form' && 'สระแก้วช่วยด้วย | แจ้งเหตุน้ำท่วมและขอความช่วยเหลือ'}
              {step === 'review' && 'สระแก้วช่วยด้วย | ตรวจสอบข้อมูลก่อนส่งเรื่อง'}
              {step === 'success' && 'สระแก้วช่วยด้วย | บันทึกการแจ้งเหตุเรียบร้อย'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border-b border-red-800 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <form onSubmit={handleGoToReview} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
            
            {/* Category Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ประเภทเหตุการณ์และลักษณะความช่วยเหลือที่ต้องการ *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition ${
                        isSelected
                          ? 'bg-blue-950/80 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-xs leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Check-in & Pinning (การปักหมุดอ้างอิงจากตำแหน่งมือถือการเช็คอิน) */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-sky-800/60 bg-gradient-to-r from-sky-950/70 via-slate-900 to-slate-950 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>ปักหมุดอ้างอิงตำแหน่งมือถือ (Mobile Check-in)</span>
                        <span className="px-1.5 py-0.2 rounded bg-sky-600 text-white text-[9px] font-bold">
                          AUTO
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        ดึงพิกัดจากโทรศัพท์มือถือปัจจุบันของคุณ เพื่อให้ชุดกู้ภัยเข้าช่วยเหลือตรงจุด
                      </p>
                    </div>
                  </div>

                  {/* Re-checkin button */}
                  <button
                    type="button"
                    onClick={() => handleMobileCheckin(false)}
                    disabled={checkinInfo.isChecking}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    title="แตะเพื่อดึงพิกัดมือถือปัจจุบันใหม่อีกครั้ง"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${checkinInfo.isChecking ? 'animate-spin text-amber-300' : ''}`} />
                    <span>{checkinInfo.isChecking ? 'กำลังเช็คอิน...' : 'เช็คอินตำแหน่งมือถือ'}</span>
                  </button>
                </div>

                {/* Status Bar */}
                {checkinInfo.isChecking ? (
                  <div className="p-2 bg-sky-950/80 border border-sky-800 rounded-lg text-xs text-sky-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                    <span>กำลังค้นหาและตรวจจับพิกัดดาวเทียมจากโทรศัพท์มือถือของคุณ...</span>
                  </div>
                ) : checkinInfo.isSuccess ? (
                  <div className="p-2 bg-emerald-950/70 border border-emerald-800/80 rounded-lg text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        เช็คอินจากมือถือสำเร็จ: <strong>อ.{district}</strong> ({latitude}, {longitude})
                        {checkinInfo.isCustomPinned ? ' (ขยับหมุดด้วยมือ)' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300/80 font-mono">
                      ±{checkinInfo.accuracy || 10} ม. · {checkinInfo.time} น.
                    </span>
                  </div>
                ) : checkinInfo.error ? (
                  <div className="p-2 bg-amber-950/70 border border-amber-800 rounded-lg text-xs text-amber-200 flex items-center justify-between">
                    <span>⚠️ {checkinInfo.error}</span>
                    <button
                      type="button"
                      onClick={() => handleMobileCheckin(false)}
                      className="text-sky-400 hover:underline font-medium text-[11px] ml-2 shrink-0"
                    >
                      ลองใหม่
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Mini Map */}
              <div
                ref={miniMapContainerRef}
                className="w-full h-40 rounded-xl border border-slate-700 overflow-hidden shadow-inner"
              />
              
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>📱 พิกัดหมุด: <strong>{latitude}, {longitude}</strong> (อ.{district})</span>
                <span className="text-slate-500 text-[10px]">💡 สามารถแตะลากหมุดบนแผนที่เพื่อปรับจุดได้</span>
              </div>

              {/* Quick District Picker Pills */}
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>📍 หรือเลือกอำเภอของคุณด่วน (แตะเพื่อสลับพื้นที่):</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(SA_KAEO_DISTRICTS) as SaKaeoDistrict[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDistrictChange(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                        district === d
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Landmark / Address input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                จุดสังเกต / หมู่บ้าน / จุดนัดพบเรือกู้ภัย
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="เช่น คุ้มริมน้ำ ใกล้วัดโคกปี่ฆ้อง, ปากซอยเทศบาล 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            {/* Water Depth & Victim count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ระดับความสูงของน้ำท่วม
                </label>
                <select
                  value={waterDepth}
                  onChange={(e) => setWaterDepth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {WATER_DEPTH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  จำนวนผู้ประสบภัยที่ต้องการความช่วยเหลือ (คน)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={victimCount}
                  onChange={(e) => setVictimCount(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Emergency Checkboxes */}
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={needsBoat}
                  onChange={(e) => setNeedsBoat(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="flex items-center gap-1.5 font-medium text-red-300">
                  <Ship className="w-3.5 h-3.5 text-red-400" />
                  ต้องการเรือท้องแบน / เรือกู้ภัยเข้าพื้นที่ (น้ำเชี่ยวหรือระดับสูง)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={hasBedriddenOrElderly}
                  onChange={(e) => setHasBedriddenOrElderly(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="flex items-center gap-1.5 font-medium text-rose-300">
                  <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                  มีผู้ป่วยติดเตียง / เด็กเล็ก / ผู้สูงอายุติดค้างในบ้าน
                </span>
              </label>
            </div>

            {/* 3 IMAGE ATTACHMENT SLOTS (ช่องแนบรูปภาพ 3 ช่อง) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>แนบรูปภาพประกอบเหตุการณ์ (3 ช่อง):</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {images.filter(Boolean).length}/3 ภาพ
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                แนบภาพถ่ายสภาพน้ำท่วม จุดสังเกต หรือผู้ประสบภัย เพื่อให้ชุดกู้ภัยประเมินเรือและอุปกรณ์ได้ตรงจุด
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[0, 1, 2].map((idx) => {
                  const meta = IMAGE_SLOT_DESCRIPTIONS[idx];
                  const img = images[idx];

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-750 bg-slate-950 p-2.5 flex flex-col justify-between overflow-hidden group hover:border-slate-600 transition"
                    >
                      <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span className="truncate">{meta.title}</span>
                        {img ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-normal">ว่าง</span>
                        )}
                      </div>

                      {img ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-900 group">
                          <img
                            src={img}
                            alt={`slot-${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-500 shadow transition"
                            title="ลบภาพนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-video rounded-lg border-2 border-dashed border-slate-800 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900/90 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center">
                          <Camera className="w-5 h-5 text-slate-400 group-hover:text-blue-400 mb-1 transition" />
                          <span className="text-[11px] font-medium text-slate-300">
                            + แตะแนบรูปภาพ
                          </span>
                          <span className="text-[9px] text-slate-500 mt-0.5">
                            กล้อง หรือ คลังรูปภาพ
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      )}

                      {/* Quick helper / Sample button */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 truncate mr-1">{meta.hint}</span>
                        {!img && (
                          <button
                            type="button"
                            onClick={() => handleSetSamplePhoto(idx, SAMPLE_PHOTOS[idx])}
                            className="text-sky-400 hover:text-sky-300 hover:underline shrink-0 font-medium"
                          >
                            + ตัวอย่าง
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reporter Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เบอร์โทรศัพท์ติดต่อกลับ *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อ-สกุล ผู้แจ้งเหตุ
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ ใจดี"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>ตรวจสอบและรีวิวข้อมูลก่อนส่ง</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW BEFORE SUBMIT */}
        {step === 'review' && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-200">
              <span className="font-semibold block mb-0.5">🔍 ตรวจสอบความถูกต้องของข้อมูล (Review Summary):</span>
              กรุณาตรวจทานข้อมูล เบอร์โทรศัพท์ และรูปภาพ เพื่อให้ศูนย์บัญชาการส่งชุดกู้ภัยเข้าช่วยเหลือได้อย่างแม่นยำ
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">ประเภทเหตุการณ์:</span>
                <span className="font-semibold text-white">
                  {CATEGORIES.find(c => c.id === category)?.label}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">พื้นที่:</span>
                <span className="font-semibold text-white">อ.{district}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">จุดสังเกต/จุดนัดพบ:</span>
                <span className="font-semibold text-white">{landmark || 'ไม่ระบุ'}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">พิกัดจุดเกิดเหตุ:</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-300">{latitude}, {longitude}</span>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                    <Smartphone className="w-3 h-3" />
                    <span>
                      {checkinInfo.isSuccess 
                        ? `เช็คอินจากมือถือ (±${checkinInfo.accuracy || 10} ม.)`
                        : 'พิกัดที่ระบุบนแผนที่'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">ระดับน้ำ:</span>
                <span className="font-semibold text-blue-300">{waterDepth}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">ผู้ประสบภัย:</span>
                <span className="font-semibold text-white">{victimCount} คน</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">ต้องการเรือกู้ภัย:</span>
                <span className={`font-semibold ${needsBoat ? 'text-red-400' : 'text-slate-400'}`}>
                  {needsBoat ? 'ต้องการเรือท้องแบนด่วน' : 'ไม่ต้องการเรือ'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <span className="text-slate-400">กลุ่มเปราะบาง:</span>
                <span className={`font-semibold ${hasBedriddenOrElderly ? 'text-rose-400' : 'text-slate-400'}`}>
                  {hasBedriddenOrElderly ? 'มีผู้ป่วยติดเตียง/คนชรา' : 'ไม่มี'}
                </span>
              </div>

              {/* Photos Attached in Review */}
              <div className="pb-2 border-b border-slate-850 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">รูปภาพแนบ ({images.filter(Boolean).length} ภาพ):</span>
                </div>
                {images.filter(Boolean).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {images.map((img, idx) => {
                      if (!img) return null;
                      return (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                          <img src={img} alt={`attached-${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">ไม่มีรูปภาพแนบ</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">ผู้แจ้งและเบอร์โทร:</span>
                <span className="font-bold text-emerald-400">
                  {reporterName || 'ประชาชน'} ({reporterPhone})
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับไปแก้ไข</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันส่งเรื่องแจ้งเหตุ'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && submittedData && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-white">บันทึกข้อมูลแจ้งเหตุสำเร็จ</h3>
              <p className="text-xs text-slate-400 mt-1">
                รหัสเคส: <span className="font-mono text-sky-400 font-bold">{submittedData.code}</span>
              </p>
              <p className="text-xs text-slate-300 mt-2">
                ระบบได้ส่งสัญญาณแจ้งเตือนไปยัง <strong>ศูนย์สั่งการกู้ภัย อ.{submittedData.district}</strong> และเจ้าหน้าที่กำลังประสานงานจัดส่งเรือกู้ภัยเข้าพื้นที่
              </p>
            </div>

            {/* Attached Photos Badge in Success */}
            {submittedData.images && submittedData.images.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="text-xs text-slate-300 font-medium text-left">
                  รูปภาพที่แนบ ({submittedData.images.length} รูป):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {submittedData.images.map((img: string, i: number) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <img src={img} alt={`uploaded-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">ระดับความเร่งด่วน:</span>
                <span className="font-bold text-red-400">{submittedData.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">สถานะ:</span>
                <span className="font-bold text-amber-400">รอรับเรื่อง / สั่งการเรือ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">สายด่วน ปภ. สระแก้ว:</span>
                <span className="font-bold text-sky-300">1784 (ตลอด 24 ชม.)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              เสร็จสิ้นและกลับสู่หน้าหลัก
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
