import React, { useState } from 'react';
import { FLOOD_CATEGORY_METADATA, PRIORITY_CONFIG, SA_KAEO_DISTRICTS, STATUS_CONFIG } from '../data/saKaeoDistricts';
import { Incident, IncidentStats, SaKaeoDistrict } from '../types/incident';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Ship, 
  MapPin, 
  Download, 
  Printer, 
  Waves,
  LifeBuoy,
  Home,
  Package
} from 'lucide-react';

interface StatsDashboardProps {
  stats: IncidentStats;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  activeDistrict?: string;
  onSelectDistrict?: (d: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  incidents,
  onSelectIncident,
  activeDistrict = 'ALL',
  onSelectDistrict
}) => {
  const [filterDistrict, setFilterDistrict] = useState<string>(activeDistrict);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  React.useEffect(() => {
    if (activeDistrict) {
      setFilterDistrict(activeDistrict);
    }
  }, [activeDistrict]);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterDistrict !== 'ALL' && inc.district !== filterDistrict) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    return true;
  });

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const totalVictimsAssisted = incidents.reduce((acc, curr) => acc + (curr.estimatedVictims || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['รหัสเหตุ', 'หัวข้อ', 'ประเภทน้ำท่วม', 'อำเภอ', 'ระดับน้ำ', 'ความต้องการเรือ', 'จำนวนผู้ประสบภัย', 'สถานะ', 'วันที่แจ้ง'];
    const rows = incidents.map(i => [
      i.code,
      `"${i.title.replace(/"/g, '""')}"`,
      FLOOD_CATEGORY_METADATA[i.category]?.label || i.category,
      i.district,
      `"${i.waterLevelText || ''}"`,
      i.needsBoat ? 'ต้องการเรือ' : 'ไม่ต้องการเรือ',
      i.estimatedVictims,
      STATUS_CONFIG[i.status]?.label || i.status,
      new Date(i.createdAt).toLocaleString('th-TH')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `รายงานสถานการณ์อุทกภัย_สระแก้ว_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">FLOOD SITUATION DASHBOARD</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            แดชบอร์ดสรุปสถานการณ์อุทกภัยและผลการช่วยเหลือ จังหวัดสระแก้ว
          </h2>
          <p className="text-xs text-slate-400">
            ระบบติดตามระดับน้ำลุ่มน้ำคลองพระสะทึง คลองพรมโหด และการจัดส่งเรือกู้ภัย 9 อำเภอ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            ส่งออก CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            พิมพ์รายงานสรุปอุทกภัย
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Points */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">จุดน้ำท่วมในระบบ</span>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">จุดเฝ้าระวังและช่วยเหลือ</div>
        </div>

        {/* Pending */}
        <div className="p-4 bg-slate-900 border border-amber-900/40 rounded-2xl bg-amber-950/10">
          <span className="text-xs text-amber-300 block mb-1">รอส่งเรือ/ตรวจสอบ</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">ต้องการการประเมินด่วน</div>
        </div>

        {/* Active Rescues */}
        <div className="p-4 bg-slate-900 border border-blue-900/40 rounded-2xl bg-blue-950/10">
          <span className="text-xs text-blue-300 block mb-1">กำลังช่วยเหลือ/อพยพ</span>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">
            {stats.dispatched + stats.onScene}
          </div>
          <div className="text-[11px] text-blue-500/80 mt-1">เรือและชุดกู้ภัยในพื้นที่</div>
        </div>

        {/* Resolved */}
        <div className="p-4 bg-slate-900 border border-emerald-900/40 rounded-2xl bg-emerald-950/10">
          <span className="text-xs text-emerald-300 block mb-1">ช่วยเหลือสำเร็จ</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">อัตราสำเร็จ {resolutionRate}%</div>
        </div>

        {/* Critical P1 */}
        <div className="p-4 bg-slate-900 border border-red-900/40 rounded-2xl bg-red-950/10">
          <span className="text-xs text-red-300 block mb-1">จุดวิกฤต P1 (เสี่ยงชีวิต)</span>
          <div className="text-2xl sm:text-3xl font-bold text-red-400">{stats.criticalP1Count}</div>
          <div className="text-[11px] text-red-500/80 mt-1">น้ำหลาก/ผู้ป่วยติดเตียง</div>
        </div>

        {/* Boats Dispatched */}
        <div className="p-4 bg-slate-900 border border-sky-900/40 rounded-2xl bg-sky-950/10">
          <span className="text-xs text-sky-300 block mb-1">เรือกู้ภัยที่ส่งเข้าพื้นที่</span>
          <div className="text-2xl sm:text-3xl font-bold text-sky-400">
            {stats.boatsDispatchedCount} <span className="text-sm font-normal">ลำ</span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1">เรือท้องแบนติดเครื่อง</div>
        </div>
      </div>

      {/* Two Column Layout: District Flood Distribution & Flood Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* District Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              จุดน้ำท่วมจำแนกตามอำเภอในจังหวัดสระแก้ว
            </h3>
            <span className="text-xs text-slate-400">9 อำเภอ</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byDistrict)
              .sort(([, a], [, b]) => b - a)
              .map(([dist, count]) => {
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={dist} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        อ.{dist} <span className="text-[11px] text-slate-500">({SA_KAEO_DISTRICTS[dist as SaKaeoDistrict]?.waterBasin.split('/')[0]})</span>
                      </span>
                      <span className="text-slate-400">
                        <strong className="text-white">{count}</strong> จุด ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, count > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Flood Category Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              การกระจายตัวของประเภทสถานการณ์น้ำท่วม
            </h3>
            <span className="text-xs text-slate-400">สถานการณ์ปัจจุบัน</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byCategory).map(([catKey, count]) => {
              const meta = FLOOD_CATEGORY_METADATA[catKey as keyof typeof FLOOD_CATEGORY_METADATA];
              return (
                <div key={catKey} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="text-[11px] text-slate-400 truncate">{meta?.label.split('/')[0] || catKey}</div>
                  <div className="text-xl font-bold text-white flex items-center justify-between">
                    <span>{count}</span>
                    <span className="text-[11px] font-normal text-slate-500">จุด</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-blue-300 leading-relaxed">
            🌊 <strong>รายงานระดับน้ำลำน้ำสายหลัก:</strong> คลองพระสะทึงระบายน้ำจากเทือกเขาสอยดาวหนุนสูงขึ้นเรื่อยๆ ชุมชนริมน้ำในเขต อ.วังน้ำเย็น และ อ.เมืองสระแก้ว อยู่ในภาวะเฝ้าระวังระดับสีส้ม ส่วนคลองพรมโหด อ.อรัญประเทศ น้ำเริ่มทรงตัว
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-white">รายงานสรุปผลการช่วยเหลือผู้ประสบอุทกภัย</h3>
            <p className="text-xs text-slate-400">คลิกที่แถวรายการเพื่อดูรายละเอียดระดับน้ำ สั่งการเรือ หรือนำทาง GPS</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="ALL">อำเภอ: ทั้งหมด</option>
              {Object.keys(SA_KAEO_DISTRICTS).map((d) => (
                <option key={d} value={d}>
                  อ.{d}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="ALL">สถานะ: ทั้งหมด</option>
              <option value="PENDING">รอรับเรื่อง</option>
              <option value="VERIFIED">ตรวจสอบแล้ว</option>
              <option value="DISPATCHED">ส่งเรือ/กำลังพล</option>
              <option value="ON_SCENE">ถึงจุดน้ำท่วม</option>
              <option value="RESOLVED">ช่วยเหลือสำเร็จ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">รหัสเหตุ</th>
                <th className="py-2.5 px-3">หัวข้อเหตุน้ำท่วม</th>
                <th className="py-2.5 px-3">พื้นที่ / อำเภอ</th>
                <th className="py-2.5 px-3">ระดับน้ำ</th>
                <th className="py-2.5 px-3">เรือกู้ภัย</th>
                <th className="py-2.5 px-3">ผู้ติดค้าง</th>
                <th className="py-2.5 px-3">สถานะ</th>
                <th className="py-2.5 px-3 text-right">เวลาแจ้ง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.map((incident) => {
                const priorityMeta = PRIORITY_CONFIG[incident.priority] || PRIORITY_CONFIG.P3;
                const statusMeta = STATUS_CONFIG[incident.status] || STATUS_CONFIG.PENDING;

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-300">
                      {incident.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">
                      {incident.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      อ.{incident.district}
                    </td>
                    <td className="py-2.5 px-3 text-blue-300 font-medium">
                      {incident.waterLevelText?.split('(')[0] || 'น้ำท่วม'}
                    </td>
                    <td className="py-2.5 px-3">
                      {incident.needsBoat ? (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <Ship className="w-3 h-3" /> ต้องการเรือ
                        </span>
                      ) : (
                        <span className="text-slate-500">รถยกสูง</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-white font-bold">{incident.estimatedVictims} คน</span>
                      {incident.hasBedriddenOrElderly && <span className="text-[10px] text-rose-400 block font-normal">(ติดเตียง)</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusMeta.bg} ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(incident.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
