import { FloodCategory, PriorityLevel, SaKaeoDistrict } from '../types/incident';

export interface DistrictInfo {
  name: SaKaeoDistrict;
  nameEn: string;
  lat: number;
  lng: number;
  emergencyHotline: string;
  policeStation: string;
  mainHospital: string;
  rescueUnit: string;
  waterBasin: string; // ลุ่มน้ำสำคัญ
  subDistricts: string[];
}

export const SA_KAEO_DISTRICTS: Record<SaKaeoDistrict, DistrictInfo> = {
  'เมืองสระแก้ว': {
    name: 'เมืองสระแก้ว',
    nameEn: 'Mueang Sa Kaeo',
    lat: 13.824,
    lng: 102.064,
    emergencyHotline: '037-241-111 (ศูนย์ ปภ.เมืองสระแก้ว)',
    policeStation: 'สภ.เมืองสระแก้ว (191)',
    mainHospital: 'รพ.สมเด็จพระยุพราชสระแก้ว (EMS 1669)',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดเมือง/ชุดกู้ภัยทางน้ำ)',
    waterBasin: 'คลองพระสะทึง / คลองไทรงาม',
    subDistricts: ['สระแก้ว', 'สระขวัญ', 'หนองบอน', 'ท่าแยก', 'โคกปี่ฆ้อง', 'ศาลาลำดวน', 'บ้านแก้ง', 'ท่าเกษม']
  },
  'อรัญประเทศ': {
    name: 'อรัญประเทศ',
    nameEn: 'Aranyaprathet',
    lat: 13.689,
    lng: 102.502,
    emergencyHotline: '037-231-191 (ศูนย์ช่วยเหลืออุทกภัยอรัญประเทศ)',
    policeStation: 'สภ.อรัญประเทศ / สภ.คลองลึก',
    mainHospital: 'รพ.อรัญประเทศ',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดอรัญประเทศ/เรือท้องแบน)',
    waterBasin: 'คลองพรมโหด / ตลาดโรงเกลือระบายลงกัมพูชา',
    subDistricts: ['อรัญประเทศ', 'เมืองไผ่', 'หานทราย', 'คลองน้ำใส', 'ท่าข้าม', 'ป่าไร่', 'ทับพริก', 'บ้านด่าน', 'คลองทับจันทร์', 'หนองสังข์']
  },
  'วังน้ำเย็น': {
    name: 'วังน้ำเย็น',
    nameEn: 'Wang Nam Yen',
    lat: 13.501,
    lng: 102.181,
    emergencyHotline: '037-251-191 (ศูนย์รับมือน้ำป่าหลากวังน้ำเย็น)',
    policeStation: 'สภ.วังน้ำเย็น',
    mainHospital: 'รพ.วังน้ำเย็น',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดวังน้ำเย็น)',
    waterBasin: 'คลองตาสุม / ต้นน้ำคลองพระสะทึงจากเขาสอยดาว',
    subDistricts: ['วังน้ำเย็น', 'ตาหลังใน', 'คลองหินปูน', 'ทุ่งมหาเจริญ']
  },
  'วัฒนานคร': {
    name: 'วัฒนานคร',
    nameEn: 'Watthana Nakhon',
    lat: 13.748,
    lng: 102.308,
    emergencyHotline: '037-261-191',
    policeStation: 'สภ.วัฒนานคร',
    mainHospital: 'รพ.วัฒนานคร',
    rescueUnit: 'หน่วยกู้ภัยร่วมกตัญญู (จุดวัฒนานคร)',
    waterBasin: 'อ่างเก็บน้ำพระปรง / คลองพรมโหดตอนบน',
    subDistricts: ['วัฒนานคร', 'ท่าเกวียน', 'ผักขะ', 'โนนหมากมุ่น', 'ช่องกุ่ม', 'หนองแวง', 'แซร์ออ', 'หนองหมากฝ้าย', 'หนองตะเคียนบอน', 'ห้วยโจด', 'หนองน้ำใส']
  },
  'ตาพระยา': {
    name: 'ตาพระยา',
    nameEn: 'Ta Phraya',
    lat: 14.004,
    lng: 102.805,
    emergencyHotline: '037-248-191',
    policeStation: 'สภ.ตาพระยา / สภ.บ้านทัพไทย',
    mainHospital: 'รพ.ตาพระยา',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดตาพระยา)',
    waterBasin: 'น้ำหลากเทือกเขาบรรทัด / อ่างเก็บน้ำห้วยยาง',
    subDistricts: ['ตาพระยา', 'ทัพเสด็จ', 'ทัพราช', 'ทัพไทย', 'โคคลาน']
  },
  'เขาฉกรรจ์': {
    name: 'เขาฉกรรจ์',
    nameEn: 'Khao Chakan',
    lat: 13.655,
    lng: 102.086,
    emergencyHotline: '037-243-191',
    policeStation: 'สภ.เขาฉกรรจ์',
    mainHospital: 'รพ.เขาฉกรรจ์',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดเขาฉกรรจ์)',
    waterBasin: 'คลองพระสะทึงช่วงล่าง / ห้วยพระปรง',
    subDistricts: ['เขาฉกรรจ์', 'หนองหว้า', 'พระเพลิง', 'เขาสามสิบ']
  },
  'โคกสูง': {
    name: 'โคกสูง',
    nameEn: 'Khok Sung',
    lat: 13.828,
    lng: 102.613,
    emergencyHotline: '037-249-191',
    policeStation: 'สภ.โคกสูง',
    mainHospital: 'รพ.โคกสูง',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดโคกสูง)',
    waterBasin: 'คลองพรมโหดฝั่งเหนือ / ห้วยยาง',
    subDistricts: ['โคกสูง', 'หนองม่วง', 'หนองแวง', 'โนนหมากมุ่น']
  },
  'คลองหาด': {
    name: 'คลองหาด',
    nameEn: 'Khlong Hat',
    lat: 13.447,
    lng: 102.308,
    emergencyHotline: '037-246-191',
    policeStation: 'สภ.คลองหาด',
    mainHospital: 'รพ.คลองหาด',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดคลองหาด)',
    waterBasin: 'น้ำหลากเขาล้อม / คลองหาด',
    subDistricts: ['คลองหาด', 'ไทยอุดม', 'ซับมะนาว', 'ไทรเดี่ยว', 'คลองไก่เถื่อน', 'เบญจขร', 'ไทรทอง']
  },
  'วังสมบูรณ์': {
    name: 'วังสมบูรณ์',
    nameEn: 'Wang Sombun',
    lat: 13.407,
    lng: 102.138,
    emergencyHotline: '037-244-191',
    policeStation: 'สภ.วังสมบูรณ์',
    mainHospital: 'รพ.วังสมบูรณ์',
    rescueUnit: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดวังสมบูรณ์)',
    waterBasin: 'ลำห้วยเทือกเขาสอยดาวตอนบน',
    subDistricts: ['วังสมบูรณ์', 'วังใหม่', 'วังทอง']
  }
};

export const FLOOD_CATEGORY_METADATA: Record<FloodCategory, { label: string; icon: string; description: string; defaultColor: string }> = {
  FLASH_FLOOD: {
    label: 'น้ำป่าไหลหลาก / น้ำหลากฉับพลัน',
    icon: 'Waves',
    description: 'กระแสน้ำไหลเชี่ยวรุนแรงจากภูเขา ระดับน้ำสูงขึ้นอย่างรวดเร็ว',
    defaultColor: '#ef4444'
  },
  TRAPPED_EVAC: {
    label: 'ติดค้างในบ้าน / ต้องการเรืออพยพด่วน',
    icon: 'LifeBuoy',
    description: 'มีผู้ติดค้าง เด็ก คนชรา หรือผู้ป่วยติดเตียง ต้องการเรือและกำลังพลเข้าช่วย',
    defaultColor: '#dc2626'
  },
  ROAD_CUTOFF: {
    label: 'น้ำท่วมถนน / สะพานขาด / สัญจรไม่ได้',
    icon: 'AlertOctagon',
    description: 'เส้นทางคมนาคมถูกตัดขาด รถทุกชนิดผ่านไม่ได้ ต้องการป้ายเตือนและเรือข้ามฟาก',
    defaultColor: '#f97316'
  },
  COMMUNITY_FLOOD: {
    label: 'น้ำท่วมขังบ้านเรือน / ชุมชนริมน้ำ',
    icon: 'Home',
    description: 'น้ำท่วมเข้าบ้านเรือน ทรัพย์สินเสียหาย ต้องการการสูบน้ำและกระสอบทราย',
    defaultColor: '#0ea5e9'
  },
  RIVER_OVERFLOW: {
    label: 'คลองพระสะทึง / คลองพรมโหด ล้นตลิ่ง',
    icon: 'Activity',
    description: 'ระดับน้ำในลำน้ำสายหลักล้นคันกั้นน้ำเข้าท่วมพื้นที่สองฝั่งคลอง',
    defaultColor: '#3b82f6'
  },
  RELIEF_SUPPLIES: {
    label: 'ขอรับถุงยังชีพ / น้ำดื่มสะอาด / ยารักษาโรค',
    icon: 'Package',
    description: 'ขาดแคลนน้ำดื่ม อาหารปรุงสุก หรือยาสามัญประจำบ้านสำหรับผู้ประสบอุทกภัย',
    defaultColor: '#eab308'
  },
  LIVESTOCK_FARM: {
    label: 'พืชผลเกษตร / ปศุสัตว์ติดน้ำท่วม',
    icon: 'Warehouse',
    description: 'ไร่อ้อย สวนกล้วย แปลงเกษตร หรือคอกวัวควายสัตว์เลี้ยงเสี่ยงจมน้ำ',
    defaultColor: '#84cc16'
  },
  DRAINAGE_PUMP: {
    label: 'ขยะอุดตันทางน้ำ / ต้องการเครื่องสูบน้ำ',
    icon: 'Wrench',
    description: 'เศษสวะขวางประตูระบายน้ำ ท่อระบายน้ำอุดตัน ต้องการรถดูดโคลนหรือเครื่องสูบน้ำขนาดใหญ่',
    defaultColor: '#64748b'
  }
};

export const CATEGORY_METADATA = FLOOD_CATEGORY_METADATA;

export const PRIORITY_CONFIG: Record<PriorityLevel, { label: string; code: string; color: string; bg: string; border: string }> = {
  P1: { label: 'วิกฤตสูงสุด (อันตรายถึงชีวิต / น้ำหลากเชี่ยว / คนติดค้าง)', code: 'P1-CRITICAL', color: 'text-red-400', bg: 'bg-red-950/70', border: 'border-red-500' },
  P2: { label: 'ด่วนมาก (น้ำท่วมสูงเกิน 50 ซม. / ถนนตัดขาด / ต้องอพยพ)', code: 'P2-HIGH', color: 'text-orange-400', bg: 'bg-orange-950/70', border: 'border-orange-500' },
  P3: { label: 'ปานกลาง (ขอรับถุงยังชีพ / น้ำดื่ม / กระสอบทราย)', code: 'P3-MEDIUM', color: 'text-amber-400', bg: 'bg-amber-950/70', border: 'border-amber-500' },
  P4: { label: 'เฝ้าระวัง (น้ำปริ่มตลิ่ง / ทางระบายน้ำอุดตัน)', code: 'P4-LOW', color: 'text-sky-400', bg: 'bg-sky-950/70', border: 'border-sky-500' },
};

export const STATUS_CONFIG = {
  PENDING: { label: 'รอรับเรื่อง', color: 'text-amber-300', bg: 'bg-amber-950/60' },
  VERIFIED: { label: 'ตรวจสอบแล้ว/เตรียมเรือกู้ภัย', color: 'text-blue-300', bg: 'bg-blue-950/60' },
  DISPATCHED: { label: 'กำลังส่งเรือและกำลังพลเข้าพื้นที่', color: 'text-purple-300', bg: 'bg-purple-950/60' },
  ON_SCENE: { label: 'กำลังช่วยเหลือ/อพยพ ณ จุดน้ำท่วม', color: 'text-indigo-300', bg: 'bg-indigo-950/60' },
  RESOLVED: { label: 'อพยพ/ช่วยเหลือสำเร็จ', color: 'text-emerald-300', bg: 'bg-emerald-950/60' },
  CANCELLED: { label: 'ยกเลิก/แจ้งซ้ำ', color: 'text-slate-400', bg: 'bg-slate-900' },
};
