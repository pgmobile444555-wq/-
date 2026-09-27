import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { Incident, PriorityLevel, SaKaeoDistrict } from '../types/incident';
import { resolveCurrentLocation, getClosestDistrict } from '../utils/locationService';
import { 
  MapPin, 
  Plus, 
  X, 
  LocateFixed, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Building2,
  Smartphone
} from 'lucide-react';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onReportAtCoords?: (coords: { lat: number; lng: number; district?: SaKaeoDistrict }) => void;
  activeDistrict?: string;
  onSelectDistrict?: (d: string) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onReportAtCoords,
  activeDistrict = 'ALL',
  onSelectDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const activePinMarkerRef = useRef<L.Marker | null>(null);

  // User GPS Tracking Refs & State
  const watchIdRef = useRef<number | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);

  const [realtimePin, setRealtimePin] = useState<{ lat: number; lng: number; district: SaKaeoDistrict } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(activeDistrict);

  // Synchronize activeDistrict with map focus
  useEffect(() => {
    if (activeDistrict) {
      setSelectedDistrict(activeDistrict);
      if (activeDistrict !== 'ALL') {
        const d = SA_KAEO_DISTRICTS[activeDistrict as SaKaeoDistrict];
        if (d && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([d.lat, d.lng], 12, { duration: 0.8 });
        }
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([13.780, 102.250], 10, { duration: 0.8 });
      }
    }
  }, [activeDistrict]);

  // Real-time GPS State
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'searching' | 'active' | 'fallback' | 'error'>('idle');
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [userGpsData, setUserGpsData] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    district: SaKaeoDistrict;
    sourceLabel: string;
    updatedAt: string;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.780, 102.250],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    // Clean OpenStreetMap Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Zoom control at bottom-right with margin to avoid overlapping action bars
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const incidentsLayer = L.layerGroup().addTo(map);
    incidentsLayerRef.current = incidentsLayer;
    mapInstanceRef.current = map;

    // Click to pin anywhere
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));
      const district = getClosestDistrict(lat, lng);

      setRealtimePin({ lat, lng, district });

      if (!activePinMarkerRef.current) {
        const pinIcon = L.divIcon({
          html: `
            <div class="flex items-center justify-center cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow flex items-center justify-center text-white text-sm font-bold">
                📍
              </div>
            </div>
          `,
          className: 'active-pin-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const newMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        
        newMarker.on('dragend', (ev) => {
          const pos = ev.target.getLatLng();
          const dLat = Number(pos.lat.toFixed(5));
          const dLng = Number(pos.lng.toFixed(5));
          setRealtimePin({
            lat: dLat,
            lng: dLng,
            district: getClosestDistrict(dLat, dLng)
          });
        });

        activePinMarkerRef.current = newMarker;
      } else {
        activePinMarkerRef.current.setLatLng([lat, lng]);
      }
    });

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Incidents to Map
  useEffect(() => {
    if (!mapInstanceRef.current || !incidentsLayerRef.current) return;

    incidentsLayerRef.current.clearLayers();

    const filtered = incidents.filter((inc) => {
      if (selectedDistrict !== 'ALL' && inc.district !== selectedDistrict) return false;
      return true;
    });

    filtered.forEach((incident) => {
      // Coordinate validity check to prevent Leaflet crash on bad coordinates
      if (
        typeof incident.latitude !== 'number' ||
        typeof incident.longitude !== 'number' ||
        isNaN(incident.latitude) ||
        isNaN(incident.longitude)
      ) {
        return;
      }

      const isSelected = selectedIncident?.id === incident.id;

      const colorMap: Record<PriorityLevel, string> = {
        P1: '#ef4444',
        P2: '#f97316',
        P3: '#eab308',
        P4: '#0284c7'
      };

      const markerColor = incident.status === 'RESOLVED' ? '#10b981' : colorMap[incident.priority] || '#3b82f6';

      const customHtml = `
        <div class="flex items-center justify-center cursor-pointer">
          <div class="w-7 h-7 rounded-full border-2 ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''} flex items-center justify-center shadow transition-transform hover:scale-110" style="background-color: ${markerColor}; border-color: #ffffff;">
            <span class="text-white font-bold text-[10px]">${incident.needsBoat ? '🚤' : '🌊'}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-flood-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([incident.latitude, incident.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-900 font-sans';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">${incident.code}</span>
          <span class="text-[11px] font-bold" style="color: ${markerColor}">${incident.priority}</span>
        </div>
        <h4 class="font-semibold text-xs leading-tight mb-1">${incident.title}</h4>
        <p class="text-[11px] text-slate-600 mb-1">📍 อ.${incident.district} · ${incident.landmark || 'ไม่ระบุ'}</p>
        <div class="p-1.5 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-900 mb-2 space-y-0.5">
          <div>🌊 <b>ระดับน้ำ:</b> ${incident.waterLevelText || 'น้ำท่วม'}</div>
          <div>🚤 <b>เรือ:</b> ${incident.needsBoat ? '<span class="text-red-600 font-bold">ต้องการเรือด่วน</span>' : 'รถยกสูงเข้าถึงได้'}</div>
        </div>
        <button id="view-incident-${incident.id}" class="w-full py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition">
          ดูรายละเอียดและสั่งการ ➔
        </button>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-incident-${incident.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIncident(incident);
          };
        }
      });

      incidentsLayerRef.current?.addLayer(marker);
    });

    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedIncident.latitude, selectedIncident.longitude], 13, {
        duration: 0.8
      });
    }
  }, [incidents, selectedIncident, selectedDistrict]);

  const updateUserLocationMarker = (lat: number, lng: number, accuracy: number, label: string) => {
    if (!mapInstanceRef.current) return;

    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center cursor-pointer">
            <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        className: 'user-live-gps-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.bindPopup(`
        <div class="p-2 text-xs text-slate-800">
          <div class="font-bold text-blue-700">📍 ตำแหน่งของคุณ</div>
          <div>พิกัด: ${lat}, ${lng}</div>
          <div>แหล่งที่มา: ${label}</div>
          <div>ความแม่นยำ: ±${accuracy} ม.</div>
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
    }

    if (!userAccuracyCircleRef.current) {
      userAccuracyCircleRef.current = L.circle([lat, lng], {
        radius: Math.max(accuracy, 20),
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(mapInstanceRef.current);
    } else {
      userAccuracyCircleRef.current.setLatLng([lat, lng]);
      userAccuracyCircleRef.current.setRadius(Math.max(accuracy, 20));
    }
  };

  // Real-Time GPS Tracking
  const startRealtimeGps = async () => {
    setGpsStatus('searching');
    setGpsErrorMsg(null);
    setIsGpsActive(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    let gotGpsFix = false;

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          gotGpsFix = true;
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const accuracy = Math.round(pos.coords.accuracy);
          const district = getClosestDistrict(lat, lng);
          const timeStr = new Date().toLocaleTimeString('th-TH');

          setUserGpsData({
            lat,
            lng,
            accuracy,
            district,
            sourceLabel: 'GPS สด',
            updatedAt: timeStr
          });
          setGpsStatus('active');
          setGpsErrorMsg(null);
          setShowPermissionGuide(false);

          updateUserLocationMarker(lat, lng, accuracy, 'GPS สด');

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.8 });
          }
        },
        async (err) => {
          console.warn('GPS watch warning, activating robust fallback:', err);
          if (!gotGpsFix) {
            if (err.code === 1) {
              setGpsErrorMsg('ยังไม่ได้รับสิทธิ์ GPS');
              setShowPermissionGuide(true);
            }
            try {
              const fallback = await resolveCurrentLocation();
              setUserGpsData({
                lat: fallback.lat,
                lng: fallback.lng,
                accuracy: fallback.accuracy,
                district: fallback.district,
                sourceLabel: fallback.sourceLabel,
                updatedAt: new Date().toLocaleTimeString('th-TH')
              });
              setGpsStatus('fallback');
              updateUserLocationMarker(fallback.lat, fallback.lng, fallback.accuracy, fallback.sourceLabel);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([fallback.lat, fallback.lng], 12, { duration: 0.8 });
              }
            } catch {
              setGpsStatus('error');
              setGpsErrorMsg('ไม่สามารถจับพิกัดได้');
            }
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 8000
        }
      );
    } else {
      const fallback = await resolveCurrentLocation();
      setUserGpsData({
        lat: fallback.lat,
        lng: fallback.lng,
        accuracy: fallback.accuracy,
        district: fallback.district,
        sourceLabel: fallback.sourceLabel,
        updatedAt: new Date().toLocaleTimeString('th-TH')
      });
      setGpsStatus('fallback');
      updateUserLocationMarker(fallback.lat, fallback.lng, fallback.accuracy, fallback.sourceLabel);
    }
  };

  const stopRealtimeGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (mapInstanceRef.current) {
      if (userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current) {
        mapInstanceRef.current.removeLayer(userAccuracyCircleRef.current);
        userAccuracyCircleRef.current = null;
      }
    }

    setIsGpsActive(false);
    setGpsStatus('idle');
    setUserGpsData(null);
    setShowPermissionGuide(false);
  };

  const toggleGps = () => {
    if (isGpsActive) {
      stopRealtimeGps();
    } else {
      startRealtimeGps();
    }
  };

  const selectDistrictDirectly = (d: SaKaeoDistrict) => {
    setSelectedDistrict(d);
    if (onSelectDistrict) onSelectDistrict(d);
    setShowPermissionGuide(false);
    const info = SA_KAEO_DISTRICTS[d];
    if (info && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([info.lat, info.lng], 13, { duration: 0.8 });
      setRealtimePin({ lat: info.lat, lng: info.lng, district: d });
    }
  };

  const handleClearPin = () => {
    if (activePinMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(activePinMarkerRef.current);
      activePinMarkerRef.current = null;
    }
    setRealtimePin(null);
  };

  const handleConfirmReportAtPin = () => {
    if (realtimePin && onReportAtCoords) {
      onReportAtCoords({
        lat: realtimePin.lat,
        lng: realtimePin.lng,
        district: realtimePin.district
      });
      handleClearPin();
    }
  };

  const handleReportAtMyGps = () => {
    if (userGpsData && onReportAtCoords) {
      onReportAtCoords({
        lat: userGpsData.lat,
        lng: userGpsData.lng,
        district: userGpsData.district
      });
    }
  };

  const handleCheckinMobileAndReport = async () => {
    setGpsStatus('searching');
    try {
      const loc = await resolveCurrentLocation();
      setUserGpsData({
        lat: loc.lat,
        lng: loc.lng,
        accuracy: loc.accuracy,
        district: loc.district,
        sourceLabel: loc.sourceLabel,
        updatedAt: new Date().toLocaleTimeString('th-TH')
      });
      setGpsStatus('active');
      updateUserLocationMarker(loc.lat, loc.lng, loc.accuracy, loc.sourceLabel);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
      }
      if (onReportAtCoords) {
        onReportAtCoords({
          lat: loc.lat,
          lng: loc.lng,
          district: loc.district
        });
      }
    } catch (err) {
      console.warn('Checkin mobile failed:', err);
      // Fallback
      if (onReportAtCoords) {
        onReportAtCoords({
          lat: 13.814,
          lng: 102.072,
          district: 'เมืองสระแก้ว'
        });
      }
    }
  };

  return (
    <div id="flood-map-container" className="flex flex-col rounded-2xl overflow-hidden border border-slate-750 bg-slate-950 shadow-xl scroll-mt-20">
      
      {/* Dedicated Top Toolbar: Clean, Non-Overlapping Bar above the map */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-200">
        
        {/* Left: District Scope Indicator & Map Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>พื้นที่แสดงผล:</span>
            <span className="font-semibold text-white">
              {selectedDistrict === 'ALL' ? 'ทุกอำเภอ (ทั่ว จ.สระแก้ว)' : `อ.${selectedDistrict}`}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-slate-400 text-[11px] hidden sm:inline">
            จุดน้ำท่วม: <strong className="text-white">{incidents.filter(i => selectedDistrict === 'ALL' || i.district === selectedDistrict).length}</strong> จุด
          </span>
        </div>

        {/* Right: GPS Controls and Live Status Pill */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* GPS Status Indicator */}
          {gpsStatus === 'searching' && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              กำลังจับสัญญาณดาวเทียม...
            </span>
          )}

          {(gpsStatus === 'active' || gpsStatus === 'fallback') && userGpsData && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-850 border border-slate-750 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>พบพิกัด: <strong>อ.{userGpsData.district}</strong> (±{userGpsData.accuracy} ม.)</span>
              <button
                type="button"
                onClick={handleReportAtMyGps}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[10px] transition"
              >
                แจ้งเหตุตรงนี้
              </button>
            </div>
          )}

          {gpsStatus === 'error' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[11px]">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span>{gpsErrorMsg || 'ไม่พบสัญญาณ GPS'}</span>
            </span>
          )}

          {/* Mobile Check-in & Report Quick Button */}
          <button
            type="button"
            onClick={handleCheckinMobileAndReport}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
            title="เช็คอินตำแหน่งมือถือสดเพื่อแจ้งเหตุน้ำท่วมทันที"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>เช็คอินมือถือแจ้งเหตุ</span>
          </button>

          {/* Toggle GPS Button */}
          <button
            type="button"
            onClick={toggleGps}
            title={isGpsActive ? 'ปิดการติดตามตำแหน่ง' : 'เปิดการค้นหาตำแหน่ง (Real-time)'}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
              isGpsActive
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <LocateFixed className={`w-3.5 h-3.5 ${gpsStatus === 'searching' ? 'animate-spin text-amber-300' : ''}`} />
            <span>{isGpsActive ? 'กำลังติดตาม GPS' : 'ค้นหาตำแหน่ง GPS'}</span>
          </button>
        </div>
      </div>

      {/* Permission Guide Card (clean notification bar above map if permission issue occurs) */}
      {showPermissionGuide && (
        <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-200 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              เบราว์เซอร์ยังไม่ได้เปิดสิทธิ์ GPS: แตะที่ไอคอน 🔒 บนแถบที่อยู่เพื่ออนุญาตสิทธิ์ หรือแตะเลือกอำเภอของคุณ:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {(Object.keys(SA_KAEO_DISTRICTS) as SaKaeoDistrict[]).slice(0, 5).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => selectDistrictDirectly(d)}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded text-[10px]"
              >
                อ.{d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowPermissionGuide(false)}
              className="text-slate-400 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px]">
        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Real-Time Pin Action Bar (Positioned cleanly at bottom center away from zoom buttons) */}
        {realtimePin && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[300] max-w-sm w-[90%] sm:w-auto animate-in slide-in-from-bottom-2 duration-150">
            <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl p-3 flex items-center justify-between gap-3 text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold text-sm">📍</span>
                <div>
                  <span className="font-bold text-sky-300">อ.{realtimePin.district}</span>
                  <span className="text-slate-400 text-[11px] ml-1.5 font-mono hidden sm:inline">
                    ({realtimePin.lat}, {realtimePin.lng})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleConfirmReportAtPin}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>แจ้งน้ำท่วมจุดนี้</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                  title="ยกเลิกหมุด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
