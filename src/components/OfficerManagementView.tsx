import React, { useState } from 'react';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { Officer, OfficerDutyStatus, OfficerRole, SaKaeoDistrict, UserProfile } from '../types/incident';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Shield, 
  Ship, 
  LifeBuoy, 
  Radio, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Download, 
  MapPin, 
  Sparkles, 
  UserCheck, 
  Flame,
  X,
  Plus,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  Zap
} from 'lucide-react';

interface OfficerManagementViewProps {
  officers: Officer[];
  currentUser: UserProfile | null;
  onRefreshOfficers: () => void;
  onSwitchUser: (officer: Officer) => void;
  onViewIncidentsOfOfficer?: (officer: Officer) => void;
  activeDistrict?: string;
  onSelectDistrict?: (d: string) => void;
}

const ROLE_OPTIONS: { role: OfficerRole; label: string; icon: string }[] = [
  { role: 'commander', label: 'ผู้บัญชาการเหตุการณ์ / นายอำเภอ / หน.ปภ.', icon: '🛡️' },
  { role: 'officer', label: 'เจ้าหน้าที่ ปภ. / ฝ่ายความมั่นคงอำเภอ', icon: '📋' },
  { role: 'boat_pilot', label: 'ผู้ควบคุมเรือท้องแบน / คนขับเรือกู้ภัย', icon: '🚤' },
  { role: 'rescue_diver', label: 'นักประดาน้ำ / ชุดกู้ภัยทางน้ำเชี่ยว', icon: '🤿' },
  { role: 'ems_paramedic', label: 'พยาบาลกู้ชีพฉุกเฉินทางน้ำ (EMS 1669)', icon: '🚑' },
  { role: 'logistics', label: 'ฝ่ายส่งกำลังบำรุง / เครื่องสูบน้ำ / ถุงยังชีพ', icon: '📦' }
];

const PRESET_AGENCIES = [
  'สำนักงาน ปภ. จังหวัดสระแก้ว (ศูนย์บัญชาการอุทกภัย)',
  'หน่วยกู้ภัยสว่างสระแก้ว ธรรมสถาน (ชุดกู้ภัยทางน้ำ)',
  'มูลนิธิร่วมกตัญญู จังหวัดสระแก้ว',
  'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว (EMS 1669)',
  'ตำรวจภูธรจังหวัดสระแก้ว (191)',
  'กองกำกับการตำรวจตระเวนชายแดนที่ 12 (ตชด.12)',
  'เทศบาลเมืองสระแก้ว (ฝ่ายป้องกันฯ)',
  'เทศบาลเมืองอรัญประเทศ (ฝ่ายป้องกันฯ)',
  'ที่ทำการปกครองอำเภอ / อส. สระแก้ว'
];

const COMMON_SKILLS = [
  'ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์',
  'กู้ชีพฉุกเฉินทางน้ำ ACLS',
  'ประดาน้ำค้นหาใต้น้ำ',
  'โดรนสำรวจระดับน้ำมุมสูง',
  'ผู้ควบคุมเครื่องสูบน้ำขนาดใหญ่',
  'ตัดต้นไม้ขวางทางน้ำ',
  'วิทยุสื่อสารฉุกเฉิน',
  'รถยกสูง 4WD กู้ภัย',
  'เคลื่อนย้ายผู้ป่วยติดเตียงทางน้ำ'
];

// Quick templates for fast 1-click add
const QUICK_TEMPLATES = [
  {
    title: '🚤 ชุดเรือกู้ภัยท้องแบน',
    role: 'boat_pilot' as OfficerRole,
    roleLabel: 'ผู้ควบคุมเรือท้องแบนกู้ภัย',
    agency: 'หน่วยกู้ภัยสว่างสระแก้ว ธรรมสถาน (ชุดกู้ภัยทางน้ำ)',
    skills: ['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'กู้ชีพฉุกเฉินทางน้ำ ACLS', 'สวมใส่ชุดชูชีพชำนาญการ'],
    defaultName: 'นายศักดิ์สิทธิ์ วารีเจริญ'
  },
  {
    title: '🚑 ทีมกู้ชีพ EMS 1669',
    role: 'ems_paramedic' as OfficerRole,
    roleLabel: 'พยาบาลวิชาชีพกู้ชีพฉุกเฉินทางน้ำ',
    agency: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว (EMS 1669)',
    skills: ['กู้ชีพฉุกเฉินทางน้ำ ACLS', 'เคลื่อนย้ายผู้ป่วยติดเตียงทางน้ำ', 'ออกซิเจนเคลื่อนที่'],
    defaultName: 'พว. กัลยา นฤเบศร์'
  },
  {
    title: '🛡️ เจ้าหน้าที่ ปภ. สระแก้ว',
    role: 'officer' as OfficerRole,
    roleLabel: 'นายช่างปฏิบัติการ ปภ.',
    agency: 'สำนักงาน ปภ. จังหวัดสระแก้ว (ศูนย์บัญชาการอุทกภัย)',
    skills: ['รถยกสูง 4WD กู้ภัย', 'วิทยุสื่อสารฉุกเฉิน', 'โดรนสำรวจระดับน้ำมุมสูง'],
    defaultName: 'นายธีรภัทร ชลิตพงษ์'
  },
  {
    title: '🤿 นักประดาน้ำ ตชด. 12',
    role: 'rescue_diver' as OfficerRole,
    roleLabel: 'ชุดเคลื่อนที่เร็วกู้ภัยทางน้ำ',
    agency: 'กองกำกับการตำรวจตระเวนชายแดนที่ 12 (ตชด.12)',
    skills: ['ประดาน้ำค้นหาใต้น้ำ', 'ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'วิทยุสื่อสารฉุกเฉิน'],
    defaultName: 'ส.ต.อ. ธนดล มุ่งเจริญ'
  },
  {
    title: '📦 ฝ่ายสูบน้ำ/ถุงยังชีพ',
    role: 'logistics' as OfficerRole,
    roleLabel: 'ฝ่ายบรรเทาสาธารณภัยเทศบาล',
    agency: 'เทศบาลเมืองสระแก้ว (ฝ่ายป้องกันฯ)',
    skills: ['ผู้ควบคุมเครื่องสูบน้ำขนาดใหญ่', 'ตัดต้นไม้ขวางทางน้ำ'],
    defaultName: 'นายสุวิทย์ มั่นคง'
  }
];

export const OfficerManagementView: React.FC<OfficerManagementViewProps> = ({
  officers,
  currentUser,
  onRefreshOfficers,
  onSwitchUser,
  onViewIncidentsOfOfficer,
  activeDistrict = 'ALL',
  onSelectDistrict
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(activeDistrict);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  React.useEffect(() => {
    if (activeDistrict) {
      setSelectedDistrict(activeDistrict);
    }
  }, [activeDistrict]);
  
  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // In-App Deletion state (safe inside iframe without window.confirm)
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  // Batch deletion state
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<Set<string>>(new Set());
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<OfficerRole>('officer');
  const [formRoleLabel, setFormRoleLabel] = useState('');
  const [formAgency, setFormAgency] = useState(PRESET_AGENCIES[0]);
  const [formCustomAgency, setFormCustomAgency] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formCallSign, setFormCallSign] = useState('');
  const [formDistrict, setFormDistrict] = useState<SaKaeoDistrict | 'ทุกอำเภอ (ส่วนกลาง)'>('ทุกอำเภอ (ส่วนกลาง)');
  const [formSkills, setFormSkills] = useState<string[]>(['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [formStatus, setFormStatus] = useState<OfficerDutyStatus>('on_duty');

  // Filter officers
  const filteredOfficers = officers.filter(o => {
    const matchSearch = 
      !searchTerm ||
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.callSign && o.callSign.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.roleLabel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDistrict = 
      selectedDistrict === 'ALL' || 
      o.district === selectedDistrict || 
      o.district === 'ทุกอำเภอ (ส่วนกลาง)';

    const matchStatus = 
      selectedStatus === 'ALL' || 
      o.status === selectedStatus;

    return matchSearch && matchDistrict && matchStatus;
  });

  // Officer status counts
  const totalCount = officers.length;
  const onDutyCount = officers.filter(o => o.status === 'on_duty').length;
  const standbyCount = officers.filter(o => o.status === 'standby').length;
  const dispatchedCount = officers.filter(o => o.status === 'dispatched' || (o.activeIncidentCount || 0) > 0).length;
  const offDutyCount = officers.filter(o => o.status === 'off_duty').length;

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingOfficer(null);
    setFormError(null);
    setFormName('');
    setFormPhone('');
    setFormRole('boat_pilot');
    setFormRoleLabel('ผู้ควบคุมเรือท้องแบนกู้ภัย');
    setFormAgency(PRESET_AGENCIES[1]);
    setFormCustomAgency('');
    setFormBadge(`SK-${Math.floor(100 + Math.random() * 900)}`);
    setFormCallSign('');
    setFormDistrict('เมืองสระแก้ว');
    setFormSkills(['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'กู้ชีพฉุกเฉินทางน้ำ ACLS']);
    setFormStatus('on_duty');
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setEditingOfficer(null);
    setFormError(null);
    setFormName(tpl.defaultName);
    setFormPhone(`08${Math.floor(10000000 + Math.random() * 90000000)}`);
    setFormRole(tpl.role);
    setFormRoleLabel(tpl.roleLabel);
    setFormAgency(tpl.agency);
    setFormCustomAgency('');
    setFormBadge(`SK-${Math.floor(100 + Math.random() * 900)}`);
    setFormCallSign(`วารี ${Math.floor(10 + Math.random() * 90)}`);
    setFormDistrict('เมืองสระแก้ว');
    setFormSkills(tpl.skills);
    setFormStatus('on_duty');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormError(null);
    setFormName(officer.name);
    setFormPhone(officer.phone);
    setFormRole(officer.role);
    setFormRoleLabel(officer.roleLabel);
    if (PRESET_AGENCIES.includes(officer.agency)) {
      setFormAgency(officer.agency);
      setFormCustomAgency('');
    } else {
      setFormAgency('OTHER');
      setFormCustomAgency(officer.agency);
    }
    setFormBadge(officer.badgeNumber);
    setFormCallSign(officer.callSign || '');
    setFormDistrict(officer.district);
    setFormSkills(officer.skills || []);
    setFormStatus(officer.status);
    setIsModalOpen(true);
  };

  const handleToggleSkill = (skill: string) => {
    if (formSkills.includes(skill)) {
      setFormSkills(formSkills.filter(s => s !== skill));
    } else {
      setFormSkills([...formSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !formSkills.includes(trimmed)) {
      setFormSkills([...formSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  // Save (Create or Update)
  const handleSaveOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('กรุณาระบุชื่อ-นามสกุลของเจ้าหน้าที่');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('กรุณาระบุเบอร์โทรศัพท์ติดต่อด่วน');
      return;
    }

    setIsSubmitting(true);
    const agencyToSave = formAgency === 'OTHER' ? (formCustomAgency.trim() || 'หน่วยงานบรรเทาสาธารณภัย') : formAgency;

    try {
      if (editingOfficer) {
        // Update existing officer
        const res = await fetch(`/api/officers/${editingOfficer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            phone: formPhone.trim(),
            role: formRole,
            roleLabel: formRoleLabel.trim() || ROLE_OPTIONS.find(r => r.role === formRole)?.label,
            agency: agencyToSave,
            badgeNumber: formBadge.trim() || editingOfficer.badgeNumber,
            callSign: formCallSign.trim() || undefined,
            district: formDistrict,
            skills: formSkills,
            status: formStatus
          })
        });
        const json = await res.json();
        if (json.success) {
          showFeedback(`✅ อัปเดตข้อมูลเจ้าหน้าที่ "${formName}" เรียบร้อยแล้ว`);
          setIsModalOpen(false);
          onRefreshOfficers();
        } else {
          setFormError(json.message || 'ไม่สามารถบันทึกข้อมูลได้');
        }
      } else {
        // Create new officer (unlimited)
        const res = await fetch('/api/officers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            phone: formPhone.trim(),
            role: formRole,
            roleLabel: formRoleLabel.trim() || ROLE_OPTIONS.find(r => r.role === formRole)?.label,
            agency: agencyToSave,
            badgeNumber: formBadge.trim() || `SK-${Math.floor(100 + Math.random() * 900)}`,
            callSign: formCallSign.trim() || undefined,
            district: formDistrict,
            skills: formSkills,
            status: formStatus
          })
        });
        const json = await res.json();
        if (json.success) {
          showFeedback(`🎉 เพิ่มเจ้าหน้าที่ "${formName}" เข้าระบบศูนย์อุทกภัยสระแก้วเรียบร้อย`);
          setIsModalOpen(false);
          onRefreshOfficers();
        } else {
          setFormError(json.message || 'ไม่สามารถเพิ่มเจ้าหน้าที่ได้');
        }
      }
    } catch (err: unknown) {
      console.error('Failed to save officer:', err);
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Delete Confirmation Action (Safe in-app modal)
  const handleConfirmSingleDelete = async () => {
    if (!officerToDelete) return;

    setIsDeletingSingle(true);
    try {
      const res = await fetch(`/api/officers/${officerToDelete.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`🗑️ ลบเจ้าหน้าที่ "${officerToDelete.name}" ออกจากระบบเรียบร้อยแล้ว`);
        // Remove from selection if was selected
        setSelectedOfficerIds(prev => {
          const next = new Set(prev);
          next.delete(officerToDelete.id);
          return next;
        });
        setOfficerToDelete(null);
        onRefreshOfficers();
      } else {
        showFeedback(`⚠️ ${json.message || 'ลบไม่สำเร็จ'}`);
      }
    } catch (err) {
      console.error('Delete officer error:', err);
      showFeedback('เกิดข้อผิดพลาดในการลบเจ้าหน้าที่');
    } finally {
      setIsDeletingSingle(false);
    }
  };

  // Batch Delete Confirmation Action
  const handleConfirmBatchDelete = async () => {
    if (selectedOfficerIds.size === 0) return;

    setIsDeletingBatch(true);
    const ids = Array.from(selectedOfficerIds);

    try {
      const res = await fetch('/api/officers/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`🗑️ ลบเจ้าหน้าที่จำนวน ${ids.length} นาย ออกจากระบบเรียบร้อย`);
        setSelectedOfficerIds(new Set());
        setIsBatchDeleteModalOpen(false);
        onRefreshOfficers();
      } else {
        showFeedback(`⚠️ ${json.message || 'ลบไม่สำเร็จ'}`);
      }
    } catch (err) {
      console.error('Batch delete error:', err);
      showFeedback('เกิดข้อผิดพลาดในการลบเจ้าหน้าที่');
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const handleToggleDutyStatus = async (officer: Officer) => {
    try {
      const res = await fetch(`/api/officers/${officer.id}/toggle-duty`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        showFeedback(`🔄 เปลี่ยนสถานะ ${officer.name} เป็น ${json.data.status}`);
        onRefreshOfficers();
      }
    } catch (err) {
      console.error('Toggle duty error:', err);
    }
  };

  // Checkbox toggle
  const handleToggleSelectOfficer = (id: string) => {
    setSelectedOfficerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedOfficerIds.size === filteredOfficers.length) {
      setSelectedOfficerIds(new Set());
    } else {
      setSelectedOfficerIds(new Set(filteredOfficers.map(o => o.id)));
    }
  };

  const exportOfficersToCSV = () => {
    const headers = ['รหัส', 'ชื่อ-นามสกุล', 'เบอร์โทร', 'สังกัด', 'ตำแหน่ง', 'อำเภอรับผิดชอบ', 'นามเรียกขาน', 'สถานะ', 'ทักษะความชำนาญ'];
    const rows = filteredOfficers.map(o => [
      `"${o.badgeNumber}"`,
      `"${o.name}"`,
      `"${o.phone}"`,
      `"${o.agency}"`,
      `"${o.roleLabel}"`,
      `"${o.district}"`,
      `"${o.callSign || '-'}"`,
      `"${o.status}"`,
      `"${o.skills.join(', ')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sa-kaeo-flood-officers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Toast Alert */}
      {feedbackMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-blue-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner & Summary Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ระบบบริหารจัดการเจ้าหน้าที่และทีมกู้ภัยอุทกภัย (ลบและเพิ่มได้ไม่จำกัด)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                  ลบ-เพิ่มได้อิสระ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                เพิ่มเจ้าหน้าที่ใหม่ได้ทันที และสามารถกดลบเจ้าหน้าที่เดี่ยวหรือลบทีละหลายคนได้สะดวกรวดเร็ว
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={exportOfficersToCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              title="ส่งออกรายชื่อเจ้าหน้าที่เป็นไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มเจ้าหน้าที่ใหม่</span>
            </button>
          </div>
        </div>

        {/* Quick Add Templates Bar (1-Click Presets) */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">แม่แบบด่วน (กดเพื่อเปิดฟอร์มพร้อมข้อมูลสำเร็จ):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-blue-950/60 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-blue-600/50 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-1.5 group shrink-0"
              >
                <span>{tpl.title}</span>
                <span className="text-[10px] text-blue-400 group-hover:translate-x-0.5 transition">+ เพิ่ม</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Metrics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">เจ้าหน้าที่ทั้งหมดในระบบ</div>
            <div className="text-xl font-bold text-white mt-0.5 font-mono">{totalCount} นาย</div>
            <div className="text-[10px] text-blue-400 mt-0.5">ลบหรือเพิ่มได้ตลอดเวลา</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-900/40">
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              เข้าเวร / พร้อมออกเรือ
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5 font-mono">{onDutyCount} นาย</div>
            <div className="text-[10px] text-slate-400 mt-0.5">พร้อมสั่งการทันที</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/40">
            <div className="text-[11px] text-indigo-400 flex items-center gap-1">
              <Ship className="w-3 h-3 text-indigo-400" />
              กำลังช่วยเหลือน้ำท่วม
            </div>
            <div className="text-xl font-bold text-indigo-300 mt-0.5 font-mono">{dispatchedCount} นาย</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ปฏิบัติการในพื้นที่</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              สแตนด์บาย / พักเวร
            </div>
            <div className="text-xl font-bold text-slate-300 mt-0.5 font-mono">{standbyCount + offDutyCount} นาย</div>
            <div className="text-[10px] text-slate-500 mt-0.5">เตรียมสับเปลี่ยนกำลัง</div>
          </div>
        </div>
      </div>

      {/* Filter, Search & Batch Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, เบอร์โทร, สังกัด, รหัสประจำตัว, หรือนามเรียกขาน..."
            className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Select All Toggle */}
        <button
          onClick={handleSelectAll}
          className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-750 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
        >
          {selectedOfficerIds.size === filteredOfficers.length && filteredOfficers.length > 0 ? (
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{selectedOfficerIds.size === filteredOfficers.length && filteredOfficers.length > 0 ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}</span>
        </button>

        {/* Batch delete trigger if any selected */}
        {selectedOfficerIds.size > 0 && (
          <button
            onClick={() => setIsBatchDeleteModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition animate-in fade-in"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ลบที่เลือก ({selectedOfficerIds.size} นาย)</span>
          </button>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {/* District selector */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">📍 ทุกอำเภอในสระแก้ว ({totalCount})</option>
            {Object.keys(SA_KAEO_DISTRICTS).map((dist) => (
              <option key={dist} value={dist}>
                อ.{dist}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="on_duty">🟢 เข้าเวร / พร้อมปฏิบัติการ</option>
            <option value="dispatched">🔵 ปฏิบัติการในพื้นที่</option>
            <option value="standby">🟡 สแตนด์บาย</option>
            <option value="off_duty">⚪ ออกเวร / พัก</option>
          </select>
        </div>
      </div>

      {/* Officers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredOfficers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">ไม่พบรายชื่อเจ้าหน้าที่ที่ตรงกับเงื่อนไขการค้นหา</p>
            <p className="text-xs text-slate-500 mt-1">กดปุ่ม "+ เพิ่มเจ้าหน้าที่ใหม่" หรือเลือกแม่แบบด่วนด้านบนเพื่อเพิ่มเจ้าหน้าที่</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มเจ้าหน้าที่ใหม่ตอนนี้</span>
            </button>
          </div>
        ) : (
          filteredOfficers.map((officer) => {
            const isCurrentActive = currentUser?.name === officer.name || currentUser?.badgeNumber === officer.badgeNumber;
            const roleInfo = ROLE_OPTIONS.find(r => r.role === officer.role);
            const isSelected = selectedOfficerIds.has(officer.id);

            return (
              <div
                key={officer.id}
                className={`bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition hover:border-slate-750 relative ${
                  isSelected
                    ? 'border-rose-500/80 bg-rose-950/10 ring-1 ring-rose-500/30'
                    : isCurrentActive 
                    ? 'border-blue-500/80 bg-gradient-to-b from-blue-950/20 to-slate-900 ring-1 ring-blue-500/30' 
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header: Checkbox, Role & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Checkbox for batch selection */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOfficer(officer.id)}
                        className="text-slate-400 hover:text-white"
                        title="เลือกสำหรับลบหลายรายการ"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <span className="text-base" title={officer.roleLabel}>{roleInfo?.icon || '🛡️'}</span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        {officer.badgeNumber}
                      </span>
                      {officer.callSign && (
                        <span className="text-[10px] text-amber-300 bg-amber-950/70 border border-amber-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5" />
                          {officer.callSign}
                        </span>
                      )}
                    </div>

                    {/* Duty Status Badge / Quick Toggle */}
                    <button
                      onClick={() => handleToggleDutyStatus(officer)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                        officer.status === 'on_duty'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                          : officer.status === 'dispatched'
                          ? 'bg-blue-950/90 text-blue-300 border-blue-700 hover:bg-blue-900'
                          : officer.status === 'standby'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-700 hover:bg-amber-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                      title="กดเพื่อสลับสถานะเวรปฏิบัติการ"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        officer.status === 'on_duty' ? 'bg-emerald-400' :
                        officer.status === 'dispatched' ? 'bg-blue-400' :
                        officer.status === 'standby' ? 'bg-amber-400' : 'bg-slate-400'
                      }`} />
                      {officer.status === 'on_duty' ? 'เข้าเวร' :
                       officer.status === 'dispatched' ? 'ออกเรือ' :
                       officer.status === 'standby' ? 'สแตนด์บาย' : 'ออกเวร'}
                    </button>
                  </div>

                  {/* Name & Title */}
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{officer.name}</span>
                      {isCurrentActive && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-blue-600 text-white rounded font-medium">
                          บัญชีปัจจุบัน
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-sky-400 font-medium mt-0.5">
                      {officer.roleLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                      {officer.agency}
                    </div>
                  </div>

                  {/* District & Phone */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      {officer.district.startsWith('ทุก') ? officer.district : `อ.${officer.district}`}
                    </span>

                    <a
                      href={`tel:${officer.phone}`}
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono font-medium px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-900/60 transition"
                      title="โทรออกทันที"
                    >
                      <Phone className="w-3 h-3" />
                      {officer.phone}
                    </a>
                  </div>

                  {/* Skills tags */}
                  {officer.skills && officer.skills.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {officer.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded text-[10px]"
                        >
                          {skill}
                        </span>
                      ))}
                      {officer.skills.length > 3 && (
                        <span className="px-1 py-0.5 text-[10px] text-slate-500">
                          +{officer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Assigned Incidents Alert */}
                  {officer.activeIncidentCount && officer.activeIncidentCount > 0 ? (
                    <div className="mt-2.5 px-2.5 py-1 bg-blue-950/50 border border-blue-800/60 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-blue-300 flex items-center gap-1 font-medium">
                        <Ship className="w-3 h-3 text-blue-400" />
                        รับผิดชอบ {officer.activeIncidentCount} จุดน้ำท่วม
                      </span>
                      {officer.assignedIncidentCodes && (
                        <span className="text-[10px] font-mono text-sky-400">
                          {officer.assignedIncidentCodes.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Bottom Actions: Switch, Edit, Delete */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => onSwitchUser(officer)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      isCurrentActive
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>{isCurrentActive ? 'ใช้งานอยู่' : 'สลับโปรไฟล์'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(officer)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition"
                    title="แก้ไขข้อมูลเจ้าหน้าที่"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button (Opens In-App Confirmation Modal) */}
                  <button
                    onClick={() => setOfficerToDelete(officer)}
                    className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/60 rounded-xl transition text-xs flex items-center gap-1 font-medium"
                    title="ลบเจ้าหน้าที่รายนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Bar when items are selected */}
      {selectedOfficerIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-rose-500/80 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <CheckSquare className="w-4 h-4 text-rose-400" />
            <span>เลือกอยู่ {selectedOfficerIds.size} นาย</span>
          </div>

          <button
            onClick={() => setIsBatchDeleteModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ยืนยันลบที่เลือก ({selectedOfficerIds.size} นาย)</span>
          </button>

          <button
            onClick={() => setSelectedOfficerIds(new Set())}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            ยกเลิกการเลือก
          </button>
        </div>
      )}

      {/* SINGLE OFFICER DELETE CONFIRMATION MODAL (In-App, No browser confirm) */}
      {officerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-800/70 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-white">
                  ยืนยันการลบเจ้าหน้าที่
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ท่านแน่ใจหรือไม่ว่าต้องการลบเจ้าหน้าที่รายนี้ออกจากทำเนียบศูนย์อุทกภัยสระแก้ว?
                </p>
              </div>
            </div>

            {/* Officer details card preview */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{officerToDelete.name}</span>
                <span className="font-mono text-[10px] text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {officerToDelete.badgeNumber}
                </span>
              </div>
              <div className="text-slate-400">{officerToDelete.roleLabel} · {officerToDelete.agency}</div>
              <div className="text-[11px] text-slate-500">โทร {officerToDelete.phone} · {officerToDelete.district}</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingSingle}
                onClick={() => setOfficerToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-medium transition"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={isDeletingSingle}
                onClick={handleConfirmSingleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingSingle ? 'กำลังลบ...' : 'ยืนยันลบเจ้าหน้าที่'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-800/70 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-white">
                  ยืนยันการลบเจ้าหน้าที่หลายคน
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ท่านกำลังจะลบเจ้าหน้าที่จำนวน <span className="font-bold text-rose-400">{selectedOfficerIds.size} นาย</span> ออกจากระบบศูนย์อุทกภัยสระแก้ว
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              ข้อมูลเจ้าหน้าที่ที่ถูกเลือกจะถูกลบออกจากฐานข้อมูลกลางทันที
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-medium transition"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={isDeletingBatch}
                onClick={handleConfirmBatchDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingBatch ? 'กำลังลบ...' : `ยืนยันลบ ${selectedOfficerIds.size} นาย`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Officer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  {editingOfficer ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {editingOfficer ? `แก้ไขข้อมูลเจ้าหน้าที่ (${editingOfficer.name})` : 'เพิ่มเจ้าหน้าที่กู้ภัยใหม่ (ไม่จำกัดจำนวน)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    บันทึกข้อมูลและทักษะความชำนาญเพื่อสั่งการเรือและระดมกำลังพลใน จ.สระแก้ว
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Error banner inside modal (No browser alert) */}
            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveOfficer} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อ - นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น นายชลิต ศรีสุข"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    เบอร์โทรศัพท์ติดต่อด่วน *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="เช่น 084-555-1784"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ประเภทบทบาท / ภารกิจหลัก
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => {
                        setFormRole(opt.role);
                        if (!formRoleLabel || formRoleLabel.includes('ผู้ควบคุม') || formRoleLabel.includes('เจ้าหน้าที่') || formRoleLabel.includes('สารวัตร')) {
                          setFormRoleLabel(opt.label.split('/')[0].trim());
                        }
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition flex items-center gap-2 ${
                        formRole === opt.role
                          ? 'bg-blue-600/30 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm">{opt.icon}</span>
                      <span className="text-[11px] leading-tight line-clamp-1">{opt.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Custom Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อตำแหน่งเฉพาะทาง / หน้าที่
                  </label>
                  <input
                    type="text"
                    value={formRoleLabel}
                    onChange={(e) => setFormRoleLabel(e.target.value)}
                    placeholder="เช่น หัวหน้าชุดกู้ภัยทางน้ำ / ผู้ควบคุมเรือท้องแบน 01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    รหัสประจำตัว / ปภ.
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="เช่น SWS-BOAT-02"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Agency & Radio Call Sign */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    สังกัดหน่วยงาน *
                  </label>
                  <select
                    value={formAgency}
                    onChange={(e) => setFormAgency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-1.5"
                  >
                    {PRESET_AGENCIES.map((ag) => (
                      <option key={ag} value={ag}>
                        {ag}
                      </option>
                    ))}
                    <option value="OTHER">-- ระบุหน่วยงานอื่น --</option>
                  </select>

                  {formAgency === 'OTHER' && (
                    <input
                      type="text"
                      required
                      value={formCustomAgency}
                      onChange={(e) => setFormCustomAgency(e.target.value)}
                      placeholder="ระบุชื่อสังกัดหน่วยงาน หรือ เทศบาล/อบต."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    นามเรียกขานวิทยุสื่อสาร
                  </label>
                  <input
                    type="text"
                    value={formCallSign}
                    onChange={(e) => setFormCallSign(e.target.value)}
                    placeholder="เช่น สว่างวารี 02"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* District & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    พื้นที่รับผิดชอบหลักในสระแก้ว
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ทุกอำเภอ (ส่วนกลาง)">ทุกอำเภอ (ส่วนกลาง / ปภ.จังหวัด)</option>
                    {Object.keys(SA_KAEO_DISTRICTS).map((dist) => (
                      <option key={dist} value={dist}>
                        อำเภอ{dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    สถานะเวรปฏิบัติการ
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OfficerDutyStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="on_duty">🟢 เข้าเวร / พร้อมออกเรือและช่วยเหลือ</option>
                    <option value="dispatched">🔵 ออกปฏิบัติการช่วยเหลือในพื้นที่แล้ว</option>
                    <option value="standby">🟡 สแตนด์บาย รอรับคำสั่ง</option>
                    <option value="off_duty">⚪ ออกเวร / พักผ่อน</option>
                  </select>
                </div>
              </div>

              {/* Skills Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ทักษะและความชำนาญการกู้ภัยอุทกภัย (เลือกได้หลายข้อ)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_SKILLS.map((skill) => {
                    const isSelected = formSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                          isSelected
                            ? 'bg-blue-600/40 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {skill}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Skill input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    placeholder="พิมพ์ทักษะพิเศษอื่น แล้วกดเพิ่ม..."
                    className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl border border-slate-700"
                  >
                    เพิ่มทักษะ
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-medium transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingOfficer ? 'บันทึกการแก้ไข' : 'บันทึกเจ้าหน้าที่ใหม่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
