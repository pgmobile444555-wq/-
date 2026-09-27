import React, { useState, useEffect } from 'react';
import { Officer, UserProfile, SaKaeoDistrict } from '../types/incident';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { 
  Shield, 
  User, 
  Phone, 
  CheckCircle2, 
  Building2, 
  KeyRound, 
  Waves, 
  Ship, 
  UserPlus,
  MapPin,
  Search,
  Check
} from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile, district?: string) => void;
  onClose: () => void;
  isOpen: boolean;
  officers?: Officer[];
  onOpenOfficerManagement?: () => void;
  activeDistrict?: string;
}

const PRESET_CITIZEN: UserProfile = {
  id: 'cit-01',
  name: 'นายสมหวัง แก้วสระ',
  phone: '081-234-5678',
  nationalId: '1-2704-00381-92-1',
  role: 'citizen',
  isVerified: true
};

export const AuthModal: React.FC<AuthModalProps> = ({ 
  currentUser, 
  onLogin, 
  onClose, 
  isOpen, 
  officers = [],
  onOpenOfficerManagement,
  activeDistrict = 'ALL'
}) => {
  const [tab, setTab] = useState<'citizen' | 'officer'>('officer');
  
  // Citizen form state
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  
  // Officer district separation state
  const [selectedOfficerDistrict, setSelectedOfficerDistrict] = useState<string>(activeDistrict);
  const [officerSearch, setOfficerSearch] = useState('');
  const [liveOfficers, setLiveOfficers] = useState<Officer[]>(officers);

  // Sync activeDistrict from parent when opening
  useEffect(() => {
    if (activeDistrict) {
      setSelectedOfficerDistrict(activeDistrict);
    }
  }, [activeDistrict, isOpen]);

  useEffect(() => {
    if (officers && officers.length > 0) {
      setLiveOfficers(officers);
    } else if (isOpen) {
      fetch('/api/officers')
        .then(r => r.json())
        .then(j => {
          if (j.success && Array.isArray(j.data)) {
            setLiveOfficers(j.data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, officers]);

  if (!isOpen) return null;

  const handleCitizenFastLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    const user: UserProfile = {
      id: `cit-${Date.now()}`,
      name: name.trim() || 'ประชาชนผู้ประสบอุทกภัย (สระแก้ว)',
      phone: phone.trim(),
      nationalId: nationalId.trim() || undefined,
      role: 'citizen',
      isVerified: true
    };
    onLogin(user);
    onClose();
  };

  const handleSelectOfficer = (officer: Officer) => {
    const user: UserProfile = {
      id: officer.id,
      name: officer.name,
      phone: officer.phone,
      role: officer.role === 'commander' ? 'commander' : 'officer',
      agency: officer.agency,
      badgeNumber: officer.badgeNumber,
      isVerified: true
    };

    // Auto-switch district to officer's designated district
    const targetDistrict = officer.district === 'ทุกอำเภอ (ส่วนกลาง)' ? 'ALL' : officer.district;
    onLogin(user, targetDistrict);
    onClose();
  };

  const handleSelectCitizenPreset = () => {
    onLogin(PRESET_CITIZEN);
    onClose();
  };

  // Filter officers by both District and Search Query
  const filteredOfficers = liveOfficers.filter(o => {
    // 1. District match: if specific district is selected, show officers of that district or central
    if (selectedOfficerDistrict !== 'ALL') {
      const matchDistrict = o.district === selectedOfficerDistrict || o.district === 'ทุกอำเภอ (ส่วนกลาง)';
      if (!matchDistrict) return false;
    }

    // 2. Query search
    if (officerSearch.trim()) {
      const q = officerSearch.toLowerCase();
      const matchQuery = 
        o.name.toLowerCase().includes(q) ||
        o.agency.toLowerCase().includes(q) ||
        o.badgeNumber.toLowerCase().includes(q) ||
        (o.district && o.district.toLowerCase().includes(q)) ||
        (o.callSign && o.callSign.toLowerCase().includes(q));
      if (!matchQuery) return false;
    }

    return true;
  });

  const districtMeta = selectedOfficerDistrict !== 'ALL' 
    ? SA_KAEO_DISTRICTS[selectedOfficerDistrict as SaKaeoDistrict] 
    : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-950/80 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-white">
                  สระแก้วช่วยด้วย | เข้าสู่ระบบเจ้าหน้าที่
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบศูนย์บัญชาการเหตุการณ์อุทกภัย 9 อำเภอ จ.สระแก้ว
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex p-1 mt-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTab('officer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition font-medium ${
                tab === 'officer'
                  ? 'bg-blue-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              <span>เจ้าหน้าที่ประจำอำเภอ / ชุดเรือกู้ภัย</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('citizen')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition font-medium ${
                tab === 'citizen'
                  ? 'bg-blue-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>ประชาชนทั่วไป (แจ้งน้ำท่วม)</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4">
          
          {tab === 'officer' ? (
            <div className="space-y-3.5">
              
              {/* DISTRICT SELECTOR SECTION - CORE REQUIREMENT */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>เลือกอำเภอที่ปฏิบัติการ / ประจำการ:</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedOfficerDistrict === 'ALL' ? 'ส่วนกลาง 9 อำเภอ' : `อ.${selectedOfficerDistrict}`}
                  </span>
                </div>

                {/* District Quick Pills */}
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedOfficerDistrict('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      selectedOfficerDistrict === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                        : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    🏛️ ส่วนกลาง (ทั้งหมด)
                  </button>

                  {(Object.keys(SA_KAEO_DISTRICTS) as SaKaeoDistrict[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedOfficerDistrict(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        selectedOfficerDistrict === d
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-sm'
                          : 'bg-slate-900 text-slate-300 border-slate-750 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* District Operational Info Callout */}
                {districtMeta && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-1.5 bg-blue-950/40 p-2 rounded-lg">
                    <div>
                      <span className="font-bold text-sky-300">ศูนย์ปฏิบัติการ อ.{districtMeta.name}:</span>{' '}
                      <span>{districtMeta.rescueUnit}</span>
                    </div>
                    <div className="text-amber-300 font-mono text-[10px]">
                      📞 {districtMeta.emergencyHotline}
                    </div>
                  </div>
                )}
              </div>

              {/* Search & Actions Header */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300 font-medium">
                  รายชื่อเจ้าหน้าที่ในพื้นที่ ({filteredOfficers.length} นาย):
                </span>
                {onOpenOfficerManagement && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOfficerManagement();
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>จัดการ/เพิ่มเจ้าหน้าที่</span>
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, สังกัด หรือรหัสเจ้าหน้าที่..."
                  className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Officer List Filtered by District */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {filteredOfficers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                    <p className="font-medium text-slate-300">ไม่พบเจ้าหน้าที่ในอำเภอนี้</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      สามารถคลิก "จัดการ/เพิ่มเจ้าหน้าที่" เพื่อเพิ่มกำลังพลประจำอำเภอ{selectedOfficerDistrict} ได้ทันที
                    </p>
                  </div>
                ) : (
                  filteredOfficers.map((officer) => (
                    <button
                      key={officer.id}
                      type="button"
                      onClick={() => handleSelectOfficer(officer)}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition flex items-center gap-1.5 truncate">
                          <span>{officer.name}</span>
                          <span className="font-mono text-[10px] text-sky-300 bg-slate-800 px-1.5 py-0.2 rounded shrink-0">
                            {officer.badgeNumber}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-950 border border-blue-800 text-blue-300 font-medium shrink-0">
                            อ.{officer.district}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{officer.roleLabel} · {officer.agency}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          โทร {officer.phone} {officer.callSign ? `· ว.เรียกขาน: ${officer.callSign}` : ''}
                        </div>
                      </div>

                      <span className="text-xs text-blue-400 font-medium px-2.5 py-1 bg-blue-950/60 border border-blue-800/40 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                        เข้าใช้งาน ➔
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCitizenFastLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เบอร์โทรศัพท์มือถือ (สำหรับติดต่อกลับเพื่อส่งเรือกู้ภัย) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อ - นามสกุล ผู้ประสบภัย
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี (หรือเว้นว่างเพื่อแจ้งเร่งด่วน)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  เลขบัตรประจำตัวประชาชน 13 หลัก (ทางเลือกเพื่อยืนยันสิทธิเงินช่วยเหลือ)
                </label>
                <input
                  type="text"
                  maxLength={17}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="เช่น 1-2704-xxxxx-xx-x"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                เข้าสู่ระบบประชาชนและแจ้งเหตุ
              </button>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSelectCitizenPreset}
                  className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-750 rounded-xl text-xs text-slate-300 flex items-center justify-between transition"
                >
                  <span>👤 ทดสอบด้วยโปรไฟล์: นายสมหวัง แก้วสระ (081-234-5678)</span>
                  <span className="text-blue-400">เลือกด่วน</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
