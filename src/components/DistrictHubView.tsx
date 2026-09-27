import React from 'react';
import { SA_KAEO_DISTRICTS, DistrictInfo } from '../data/saKaeoDistricts';
import { Incident, Officer, SaKaeoDistrict } from '../types/incident';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Ship, 
  AlertTriangle, 
  LifeBuoy, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Waves,
  ShieldCheck,
  Search
} from 'lucide-react';

interface DistrictHubViewProps {
  incidents: Incident[];
  officers: Officer[];
  activeDistrict: string;
  onSelectDistrict: (district: string) => void;
  onNavigateToTab: (tab: 'map' | 'list' | 'review' | 'stats' | 'officers') => void;
}

export const DistrictHubView: React.FC<DistrictHubViewProps> = ({
  incidents,
  officers,
  activeDistrict,
  onSelectDistrict,
  onNavigateToTab
}) => {
  const [search, setSearch] = React.useState('');

  const districtList = Object.entries(SA_KAEO_DISTRICTS).map(([name, info]) => {
    const districtIncidents = incidents.filter(i => i.district === name);
    const criticalP1 = districtIncidents.filter(i => i.priority === 'P1').length;
    const boatsDispatched = districtIncidents.reduce((acc, curr) => acc + curr.dispatchedUnits.filter(u => u.vehicleType.includes('เรือ')).length, 0);
    const pendingCases = districtIncidents.filter(i => i.status === 'PENDING').length;
    const resolvedCases = districtIncidents.filter(i => i.status === 'RESOLVED').length;
    const districtOfficers = officers.filter(o => o.district === name || o.district === 'ทุกอำเภอ (ส่วนกลาง)');

    return {
      name: name as SaKaeoDistrict,
      info,
      totalIncidents: districtIncidents.length,
      criticalP1,
      boatsDispatched,
      pendingCases,
      resolvedCases,
      officersCount: districtOfficers.length
    };
  });

  const filteredDistricts = districtList.filter(d => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.info.nameEn.toLowerCase().includes(q) ||
        d.info.waterBasin.toLowerCase().includes(q) ||
        d.info.rescueUnit.toLowerCase().includes(q) ||
        d.info.subDistricts.some(sub => sub.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleEnterDistrict = (districtName: string) => {
    onSelectDistrict(districtName);
    onNavigateToTab('map');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner - Standard Clean UI */}
      <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              ศูนย์ปฏิบัติการอุทกภัยแยกตาม 9 อำเภอ (District Command Hubs)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              เลือกระดับการเข้าใช้งาน: เข้าสู่ศูนย์สั่งการเฉพาะอำเภอ เพื่อโฟกัสข้อมูล การสั่งการเรือ และการช่วยเหลือในพื้นที่
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeDistrict !== 'ALL' ? (
              <div className="flex items-center gap-2 bg-blue-950 border border-blue-700 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-blue-300">กำลังใช้งานโหมด: <strong>อ.{activeDistrict}</strong></span>
                <button
                  onClick={() => onSelectDistrict('ALL')}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold"
                >
                  กลับสู่ส่วนกลาง (ทุกอำเภอ)
                </button>
              </div>
            ) : (
              <span className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300">
                สถานะ: <strong>ส่วนกลาง (ควบคุม 9 อำเภอพร้อมกัน)</strong>
              </span>
            )}
          </div>
        </div>

        {/* Search bar & All-districts button */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/80 text-xs">
          <button
            onClick={() => onSelectDistrict('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium border transition ${
              activeDistrict === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            🏛️ ส่วนกลาง (ทุกอำเภอ - {incidents.length} เหตุการณ์)
          </button>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่ออำเภอ, ตำบล, ลุ่มน้ำ, หรือหน่วยกู้ภัย..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of 9 Districts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDistricts.map((item) => {
          const isCurrentActive = activeDistrict === item.name;

          return (
            <div
              key={item.name}
              className={`bg-slate-800 border rounded-xl p-4 transition flex flex-col justify-between space-y-3 ${
                isCurrentActive
                  ? 'border-blue-500 ring-1 ring-blue-500 bg-slate-800'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-900/60 border border-blue-700 text-blue-300 flex items-center justify-center font-bold text-xs">
                      {item.name.slice(0, 2)}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>อำเภอ{item.name}</span>
                        <span className="text-[11px] font-normal text-slate-400 font-sans">({item.info.nameEn})</span>
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Waves className="w-3 h-3 text-sky-400" />
                        <span>ลุ่มน้ำ: {item.info.waterBasin}</span>
                      </div>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold">
                      ใช้งานอยู่
                    </span>
                  )}
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-xs">
                  <div className="p-1.5 bg-slate-900 border border-slate-750 rounded-lg">
                    <div className="text-slate-400 text-[10px]">เหตุน้ำท่วม</div>
                    <div className="font-bold text-white text-sm">{item.totalIncidents}</div>
                  </div>

                  <div className={`p-1.5 rounded-lg border ${
                    item.criticalP1 > 0 ? 'bg-red-950/60 border-red-800' : 'bg-slate-900 border-slate-750'
                  }`}>
                    <div className={`text-[10px] ${item.criticalP1 > 0 ? 'text-red-300' : 'text-slate-400'}`}>วิกฤต P1</div>
                    <div className={`font-bold text-sm ${item.criticalP1 > 0 ? 'text-red-400' : 'text-slate-300'}`}>{item.criticalP1}</div>
                  </div>

                  <div className="p-1.5 bg-slate-900 border border-slate-750 rounded-lg">
                    <div className="text-slate-400 text-[10px]">เรือในพื้นที่</div>
                    <div className="font-bold text-sky-300 text-sm">{item.boatsDispatched}</div>
                  </div>

                  <div className="p-1.5 bg-slate-900 border border-slate-750 rounded-lg">
                    <div className="text-slate-400 text-[10px]">ช่วยแล้ว</div>
                    <div className="font-bold text-emerald-400 text-sm">{item.resolvedCases}</div>
                  </div>
                </div>
              </div>

              {/* District Contacts & Operational Info */}
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-750 text-[11px] space-y-1 text-slate-300">
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span><strong>หน่วยกู้ภัย:</strong> {item.info.rescueUnit}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>สายด่วนอำเภอ:</strong> {item.info.emergencyHotline}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>รพ./สภ.:</strong> {item.info.mainHospital} · {item.info.policeStation}</span>
                </div>
              </div>

              {/* Subdistricts Pills */}
              <div>
                <div className="text-[10px] text-slate-400 mb-1">
                  ตำบลในเขต ({item.info.subDistricts.length} ตำบล):
                </div>
                <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                  {item.info.subDistricts.slice(0, 6).map(sub => (
                    <span key={sub} className="px-1.5 py-0.2 bg-slate-900 text-slate-400 rounded text-[10px] border border-slate-750">
                      ต.{sub}
                    </span>
                  ))}
                  {item.info.subDistricts.length > 6 && (
                    <span className="px-1.5 py-0.2 bg-slate-900 text-slate-500 rounded text-[10px]">
                      +{item.info.subDistricts.length - 6} ตำบล
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleEnterDistrict(item.name)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    isCurrentActive
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white'
                  }`}
                >
                  <span>{isCurrentActive ? 'ดูแผนที่อำเภอนี้' : 'เข้าสู่ศูนย์ อ.' + item.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
