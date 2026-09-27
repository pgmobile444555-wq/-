export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
// P1: วิกฤตคุกคามชีวิต (น้ำหลากเชี่ยว / คนติดค้างเสี่ยงจมน้ำ / ผู้ป่วยติดเตียง)
// P2: ด่วนมาก (น้ำท่วมบ้านสูงเกิน 50 ซม. / ถนนตัดขาด / ต้องอพยพ)
// P3: ปานกลาง (น้ำท่วมขังพื้นที่ / ขอรับถุงยังชีพ น้ำดื่ม เครื่องอุปโภค)
// P4: เฝ้าระวัง/ทั่วไป (น้ำปริ่มตลิ่ง / ท่อระบายน้ำอุดตัน / เตรียมกระสอบทราย)

export type IncidentStatus = 
  | 'PENDING'       // รอรับเรื่อง
  | 'VERIFIED'      // ยืนยันข้อมูล/รับเรื่องแล้ว
  | 'DISPATCHED'    // ส่งกำลังพล/เรือกู้ภัยเข้าพื้นที่
  | 'ON_SCENE'      // กำลังช่วยเหลือ ณ จุดน้ำท่วม
  | 'RESOLVED'      // อพยพ/ช่วยเหลือสำเร็จ
  | 'CANCELLED';    // ยกเลิก/แจ้งซ้ำ

export type FloodCategory = 
  | 'FLASH_FLOOD'       // น้ำป่าไหลหลาก / น้ำหลากฉับพลัน
  | 'TRAPPED_EVAC'      // คนติดค้างในบ้าน / ต้องการเรืออพยพด่วน
  | 'ROAD_CUTOFF'       // น้ำท่วมถนน / สะพานขาด / สัญจรไม่ได้
  | 'COMMUNITY_FLOOD'   // น้ำท่วมขังบ้านเรือน / ชุมชนริมน้ำ
  | 'RIVER_OVERFLOW'    // คลองพระสะทึง / คลองพรมโหด ล้นตลิ่ง
  | 'RELIEF_SUPPLIES'   // ขอรับถุงยังชีพ / น้ำดื่มสะอาด / ยารักษาโรค
  | 'LIVESTOCK_FARM'    // พืชผลเกษตร / สัตว์เลี้ยง ปศุสัตว์ติดน้ำท่วม
  | 'DRAINAGE_PUMP';    // ขยะอุดตันทางน้ำ / ต้องการเครื่องสูบน้ำ

export type IncidentCategory = FloodCategory;

export type SaKaeoDistrict =
  | 'เมืองสระแก้ว'
  | 'อรัญประเทศ'
  | 'วังน้ำเย็น'
  | 'วัฒนานคร'
  | 'ตาพระยา'
  | 'เขาฉกรรจ์'
  | 'โคกสูง'
  | 'คลองหาด'
  | 'วังสมบูรณ์';

export interface DispatchUnit {
  id: string;
  name: string;
  agency: string;
  vehicleType: string; // e.g. เรือท้องแบนติดเครื่องยนต์, รถยกสูง ปภ., เรือพายกู้ภัย
  contactNumber: string;
  dispatchedAt: string;
  status: 'en_route' | 'on_scene' | 'cleared';
  personnelCount: number;
}

export interface StatusTimeline {
  id: string;
  status: IncidentStatus;
  updatedAt: string;
  updatedBy: string;
  note: string;
}

export interface AITriageResult {
  priority: PriorityLevel;
  priorityLabel: string;
  urgencyScore: number; // 0-100
  summary: string;
  casualtyRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  recommendedAgencies: string[];
  recommendedEquipment: string[]; // e.g. เรือท้องแบน, เสื้อชูชีพ, รถกู้ภัยยกสูง, เชือกกู้ภัยทางน้ำ
  citizenImmediateAdvice: string;
  dangerFactors: string[];
  waterDepthEstimate?: string;
  analyzedAt: string;
}

export interface IncidentReview {
  id: string;
  decision: 'VERIFIED' | 'ADJUSTED_PRIORITY' | 'NEEDS_INFO' | 'DUPLICATE' | 'REJECTED';
  decisionLabel: string;
  reviewedBy: string;
  reviewerAgency?: string;
  reviewedAt: string;
  notes: string;
  contactConfirmed: boolean;
  locationConfirmed: boolean;
  vulnerableConfirmed: boolean;
  boatNeedConfirmed: boolean;
  previousPriority?: PriorityLevel;
  newPriority?: PriorityLevel;
}

export interface PostRescueReview {
  reviewedAt: string;
  reviewedBy: string;
  reviewerAgency?: string;
  actualEvacuatedCount: number;
  reliefPacksDistributed: number;
  operationStatus: 'SUCCESS' | 'PARTIAL' | 'TRANSFERRED';
  operationSummary: string;
  followUpRequired?: boolean;
}

export interface Incident {
  id: string;
  code: string; // e.g. FL-SK-2026-0042
  title: string;
  description: string;
  category: FloodCategory;
  district: SaKaeoDistrict;
  subDistrict?: string;
  landmark: string;
  waterLevelText?: string; // e.g. "ระดับอก (ประมาณ 1.2 เมตร)", "ท่วมมิดล้อรถ (50 ซม.)"
  waterLevelCm?: number;
  latitude: number;
  longitude: number;
  reporterName: string;
  reporterPhone: string;
  reporterNationalId?: string;
  reporterUserId?: string;
  status: IncidentStatus;
  priority: PriorityLevel;
  estimatedVictims: number; // จำนวนผู้ติดค้าง/ผู้ประสบภัย
  needsBoat: boolean; // ต้องการเรือกู้ภัยเข้าพื้นที่หรือไม่
  hasBedriddenOrElderly: boolean; // มีผู้ป่วยติดเตียง/คนชราหรือไม่
  images: string[];
  audioNoteUrl?: string;
  aiTriage?: AITriageResult;
  assignedOfficer?: string;
  dispatchedUnits: DispatchUnit[];
  timeline: StatusTimeline[];
  lineAlertsSent: {
    sentAt: string;
    targetGroup: string;
    messageSummary: string;
  }[];
  reviews?: IncidentReview[];
  postRescueReview?: PostRescueReview;
  createdAt: string;
  updatedAt: string;
}

export type OfficerDutyStatus = 'on_duty' | 'standby' | 'dispatched' | 'off_duty';

export type OfficerRole = 
  | 'commander'      // ผู้บัญชาการเหตุการณ์ / นายอำเภอ / หน.ปภ.
  | 'officer'        // เจ้าหน้าที่ปฏิบัติการ ปภ. / อำเภอ
  | 'boat_pilot'     // ผู้ควบคุมเรือท้องแบน / คนขับเรือกู้ภัย
  | 'rescue_diver'   // นักประดาน้ำ / กู้ภัยทางน้ำ
  | 'ems_paramedic'  // ทีมแพทย์ฉุกเฉิน / กู้ชีพ 1669
  | 'logistics';     // ฝ่ายส่งกำลังบำรุง / แจกถุงยังชีพ / สูบน้ำ

export interface Officer {
  id: string;
  name: string;
  phone: string;
  role: OfficerRole;
  roleLabel: string;
  agency: string;
  badgeNumber: string;
  callSign?: string;
  district: SaKaeoDistrict | 'ทุกอำเภอ (ส่วนกลาง)';
  skills: string[];
  status: OfficerDutyStatus;
  activeIncidentCount?: number;
  assignedIncidentCodes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  role: 'citizen' | 'officer' | 'commander';
  agency?: string;
  badgeNumber?: string;
  isVerified: boolean;
}

export interface IncidentStats {
  total: number;
  pending: number;
  dispatched: number;
  onScene: number;
  resolved: number;
  criticalP1Count: number;
  boatsDispatchedCount: number;
  avgResponseTimeMinutes: number;
  byDistrict: Record<SaKaeoDistrict, number>;
  byCategory: Record<FloodCategory, number>;
}
