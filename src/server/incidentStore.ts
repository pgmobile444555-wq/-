import { Incident, IncidentStats, Officer, SaKaeoDistrict } from '../types/incident';

export const INITIAL_OFFICERS: Officer[] = [
  {
    id: 'off-01',
    name: 'นายชลิต ศรีสุข',
    phone: '084-555-1784',
    role: 'officer',
    roleLabel: 'หัวหน้าฝ่ายปฏิบัติการ ปภ.',
    agency: 'สำนักงาน ปภ. จังหวัดสระแก้ว (ศูนย์บัญชาการอุทกภัย)',
    badgeNumber: 'DDPM-SK-08',
    callSign: 'สระแก้ว 08',
    district: 'ทุกอำเภอ (ส่วนกลาง)',
    skills: ['ผู้บัญชาการเหตุการณ์', 'รถกู้ภัยยกสูง ปภ.', 'โดรนสำรวจระดับน้ำ', 'วิทยุสื่อสารฉุกเฉิน'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-02',
    name: 'นายประสิทธิ์ สว่างพรหม',
    phone: '086-777-1669',
    role: 'boat_pilot',
    roleLabel: 'หัวหน้าชุดกู้ภัยทางน้ำ/เรือท้องแบน',
    agency: 'หน่วยกู้ภัยสว่างสระแก้ว ธรรมสถาน',
    badgeNumber: 'SWS-BOAT-01',
    callSign: 'สว่างวารี 01',
    district: 'เมืองสระแก้ว',
    skills: ['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'ประดาน้ำค้นหาใต้น้ำ', 'กู้ชีพทางน้ำ', 'สวมใส่ชุดชูชีพชำนาญการ'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-03',
    name: 'พ.ต.ท. เอกลักษณ์ ทวีสิน',
    phone: '089-999-1911',
    role: 'commander',
    roleLabel: 'สารวัตรประสานเหตุฉุกเฉิน 191',
    agency: 'ตำรวจภูธรจังหวัดสระแก้ว (ภ.จว.สระแก้ว)',
    badgeNumber: 'SKP-4012',
    callSign: 'สระแก้ว 191',
    district: 'ทุกอำเภอ (ส่วนกลาง)',
    skills: ['ปิดกั้นเส้นทางน้ำท่วม', 'วิทยุเครือข่ายตำรวจ', 'ประสานทางหลวงชนบท', 'รักษาความปลอดภัยศูนย์อพยพ'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-04',
    name: 'พว. ธนพร จิตต์จำนง',
    phone: '082-166-9001',
    role: 'ems_paramedic',
    roleLabel: 'หัวหน้าทีม EMS กู้ชีพฉุกเฉินทางน้ำ',
    agency: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว (สายด่วน 1669)',
    badgeNumber: 'EMS-SK-03',
    callSign: 'ยุพราช EMS 3',
    district: 'เมืองสระแก้ว',
    skills: ['กู้ชีพขั้นสูง ACLS', 'ลำเลียงผู้ป่วยติดเตียงทางน้ำ', 'ออกซิเจนเคลื่อนที่', 'ทำคลอดฉุกเฉิน'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-05',
    name: 'ร.ต.อ. อนุชา บุญมา',
    phone: '085-321-4488',
    role: 'rescue_diver',
    roleLabel: 'รอง ผบ.ร้อย ตชด. ชุดเคลื่อนที่เร็ว',
    agency: 'กองกำกับการตำรวจตระเวนชายแดนที่ 12 (ตชด.12 อรัญประเทศ)',
    badgeNumber: 'BPP-12-05',
    callSign: 'ชายแดน 125',
    district: 'อรัญประเทศ',
    skills: ['เรือยางกู้ภัยติดเครื่องยนต์', 'ลำเลียงผู้ประสบภัยกระแสน้ำเชี่ยว', 'พื้นที่ชายแดน', 'ยุทธวิธีทางน้ำ'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-06',
    name: 'นายสมศักดิ์ สายชล',
    phone: '087-445-6677',
    role: 'officer',
    roleLabel: 'เจ้าหน้าที่กู้ภัยประจำจุดวัฒนานคร',
    agency: 'มูลนิธิร่วมกตัญญู จุดวัฒนานคร',
    badgeNumber: 'RK-WN-02',
    callSign: 'ร่วมวัฒนา 02',
    district: 'วัฒนานคร',
    skills: ['เรือพายกู้ภัย', 'เลื่อยยนต์ตัดต้นไม้ขวางทางน้ำ', 'สปอตไลท์ส่องสว่างเวลากลางคืน'],
    status: 'standby',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-07',
    name: 'นายเกียรติศักดิ์ พรหมทา',
    phone: '083-662-1199',
    role: 'logistics',
    roleLabel: 'หัวหน้าฝ่ายบรรเทาสาธารณภัยเทศบาล',
    agency: 'เทศบาลเมืองอรัญประเทศ (ฝ่ายป้องกันและบรรเทาฯ)',
    badgeNumber: 'ARAN-PUMP-01',
    callSign: 'อรัญบรรเทา 01',
    district: 'อรัญประเทศ',
    skills: ['ติดตั้งเครื่องสูบน้ำขนาดใหญ่ 12 นิ้ว', 'คันกั้นน้ำกระสอบทราย', 'เปิด-ปิดประตูระบายน้ำคลองพรมโหด'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-08',
    name: 'นายวิชัย รุ่งอรุณ',
    phone: '081-789-5544',
    role: 'commander',
    roleLabel: 'ปลัดอำเภอฝ่ายความมั่นคง',
    agency: 'ที่ทำการปกครองอำเภอตาพระยา',
    badgeNumber: 'TPY-SEC-01',
    callSign: 'ตาพระยา 02',
    district: 'ตาพระยา',
    skills: ['จัดตั้งศูนย์พักพิงชั่วคราว', 'กระจายถุงยังชีพและน้ำดื่ม', 'รถบรรทุก 6 ล้อยกสูง'],
    status: 'standby',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-09',
    name: 'นายกิตติศักดิ์ พรหมมาสตร์',
    phone: '082-554-3322',
    role: 'boat_pilot',
    roleLabel: 'หัวหน้าชุดเรือกู้ภัยน้ำหลาก',
    agency: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดวังน้ำเย็น)',
    badgeNumber: 'WNY-BOAT-01',
    callSign: 'สว่างน้ำเย็น 01',
    district: 'วังน้ำเย็น',
    skills: ['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'รับมือน้ำป่าหลากจากเขาสอยดาว', 'กู้ชีพทางน้ำเชี่ยว'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-10',
    name: 'พ.ต.ท. มนูญ ผลเจริญ',
    phone: '081-332-1100',
    role: 'commander',
    roleLabel: 'ผบ.ศูนย์บัญชาการเหตุการณ์น้ำท่วม',
    agency: 'ที่ทำการปกครองอำเภอเขาฉกรรจ์',
    badgeNumber: 'KCK-CMD-01',
    callSign: 'เขาฉกรรจ์ 01',
    district: 'เขาฉกรรจ์',
    skills: ['ผู้บัญชาการเหตุการณ์', 'วิทยุสื่อสารฉุกเฉิน', 'จัดตั้งศูนย์อพยพวัดถ้ำเขาฉกรรจ์'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-11',
    name: 'พว. นฤมล เกษมสุข',
    phone: '089-221-4455',
    role: 'ems_paramedic',
    roleLabel: 'พยาบาลวิชาชีพกู้ชีพ EMS 1669',
    agency: 'โรงพยาบาลโคกสูง (กลุ่มงานอุบัติเหตุฉุกเฉิน)',
    badgeNumber: 'KS-EMS-02',
    callSign: 'โคกสูง EMS 2',
    district: 'โคกสูง',
    skills: ['กู้ชีพฉุกเฉินทางน้ำ ACLS', 'ส่งต่อผู้ป่วยวิกฤต', 'ดูแลผู้ป่วยฟอกไตติดค้าง'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-12',
    name: 'นายธวัชชัย ร่มโพธิ์',
    phone: '084-771-8899',
    role: 'officer',
    roleLabel: 'เจ้าหน้าที่งานป้องกันและบรรเทาสาธารณภัย',
    agency: 'เทศบาลตำบลคลองหาด (ฝ่ายป้องกันฯ)',
    badgeNumber: 'KH-DISASTER-01',
    callSign: 'คลองหาด 01',
    district: 'คลองหาด',
    skills: ['รถตรวจการณ์ 4WD ยกสูง', 'กำจัดสิ่งกีดขวางทางน้ำ', 'โดรนสำรวจพื้นที่เกษตรน้ำท่วม'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-13',
    name: 'นายอดุลย์ บุญฤทธิ์',
    phone: '086-443-7722',
    role: 'boat_pilot',
    roleLabel: 'ผู้ควบคุมเรือท้องแบนกู้ชีพ',
    agency: 'หน่วยกู้ภัยสว่างสระแก้ว (จุดวังสมบูรณ์)',
    badgeNumber: 'WSB-BOAT-02',
    callSign: 'สว่างสมบูรณ์ 02',
    district: 'วังสมบูรณ์',
    skills: ['ผู้ควบคุมเรือท้องแบนติดเครื่องยนต์', 'ลำเลียงอาหารและน้ำดื่มเข้าคุ้มบ้านลึก'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'off-14',
    name: 'นายชวลิต เจริญพงษ์',
    phone: '081-445-9988',
    role: 'commander',
    roleLabel: 'นายอำเภอ / ผบ.ศูนย์ปฏิบัติการส่วนหน้า',
    agency: 'ศูนย์ปฏิบัติการฉุกเฉินอุทกภัย อำเภออรัญประเทศ',
    badgeNumber: 'ARAN-CHIEF-01',
    callSign: 'อรัญ 01',
    district: 'อรัญประเทศ',
    skills: ['ผู้บัญชาการเหตุการณ์พื้นที่วิกฤตคลองพรมโหด', 'ประสานงาน ตชด.12 และทหารบูรพาพยัคฆ์', 'บริหารจัดการอพยพตลาดโรงเกลือ'],
    status: 'on_duty',
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  }
];

export const INITIAL_FLOOD_INCIDENTS: Incident[] = [
  {
    id: 'fl-001',
    code: 'FL-SK-2026-0101',
    title: 'คลองพระสะทึงเอ่อล้นตลิ่งท่วมชุมชนโคกปี่ฆ้อง ระดับน้ำ 1.2 เมตร มีผู้ป่วยติดเตียงติดค้าง 3 ราย',
    description: 'มวลน้ำจากคลองพระสะทึงไหลหลากเข้าท่วมบ้านเรือนริมน้ำอย่างรวดเร็ว ระดับน้ำสูงระดับหน้าอก (ประมาณ 1.2 เมตร) มีผู้ป่วยติดเตียง 1 ราย และคนชราอายุ 82 ปี ติดอยู่บนชั้น 2 ของบ้าน กระแสน้ำไหลเชี่ยว รถยกสูงเข้าไม่ได้ ต้องการเรือท้องแบนติดเครื่องยนต์และทีมกู้ชีพด่วนที่สุด',
    category: 'TRAPPED_EVAC',
    district: 'เมืองสระแก้ว',
    subDistrict: 'โคกปี่ฆ้อง',
    landmark: 'ชุมชนคุ้มริมคลองพระสะทึง ใกล้สะพานข้ามคลองโคกปี่ฆ้อง',
    waterLevelText: 'ระดับอก (ประมาณ 1.2 เมตร)',
    waterLevelCm: 120,
    latitude: 13.8340,
    longitude: 102.0520,
    reporterName: 'นายประสิทธิ์ สระแก้วสัมพันธ์',
    reporterPhone: '081-992-3481',
    reporterNationalId: '3-2704-0012x-xx-1',
    status: 'DISPATCHED',
    priority: 'P1',
    estimatedVictims: 3,
    needsBoat: true,
    hasBedriddenOrElderly: true,
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    ],
    aiTriage: {
      priority: 'P1',
      priorityLabel: 'วิกฤตสูงสุด (มีผู้ป่วยติดเตียงและคนชราติดค้างในน้ำท่วมสูง)',
      urgencyScore: 98,
      summary: 'ระดับน้ำสูง 1.2 เมตร และกระแสน้ำไหลเชี่ยว มีผู้ป่วยติดเตียงไม่สามารถเคลื่อนย้ายเองได้ เสี่ยงอันตรายถึงชีวิต ต้องส่งเรือท้องแบนติดเครื่องยนต์พร้อมทีม EMS 1669 กู้ชีพขั้นสูงเข้าอพยพทันที',
      casualtyRisk: 'HIGH',
      waterDepthEstimate: '1.2 เมตร (วิกฤตระดับอก)',
      recommendedAgencies: [
        'ชุดกู้ภัยทางน้ำ หน่วยกู้ภัยสว่างสระแก้ว (เรือท้องแบน 2 ลำ)',
        'ศูนย์กู้ชีพ EMS 1669 รพ.สมเด็จพระยุพราชสระแก้ว',
        'สำนักงาน ปภ. จังหวัดสระแก้ว (เรือยางและเสื้อชูชีพ)',
        'ฝ่ายปกครองอำเภอเมืองสระแก้ว'
      ],
      recommendedEquipment: ['เรือท้องแบนติดเครื่องยนต์', 'บอร์ดเคลื่อนย้ายผู้ป่วยทางน้ำ (Spineboard)', 'เสื้อชูชีพขนาดผู้ใหญ่และเด็ก', 'เชือกกู้ภัยทางน้ำ'],
      citizenImmediateAdvice: 'ให้อยู่บนที่สูงที่สุดของบ้าน ตัดสะพานไฟ (เบรกเกอร์) ทันที สวมเสื้อชูชีพหรือใช้แกลลอนพลาสติกผูกเชือกเป็นทุ่นลอย ห้ามลุยกระแสน้ำเชี่ยวเด็ดขาด ทีมเรือกู้ภัยกำลังเดินทางเข้าช่วยเหลือ',
      dangerFactors: ['ผู้ป่วยติดเตียงช่วยเหลือตัวเองไม่ได้', 'กระแสน้ำคลองพระสะทึงไหลเชี่ยว', 'ระดับน้ำท่วมสูงเกิน 1 เมตร'],
      analyzedAt: '2026-09-25T10:15:00.000Z'
    },
    assignedOfficer: 'พ.ต.ท. เอกลักษณ์ ทวีสิน (ศูนย์บัญชาการอุทกภัยสระแก้ว)',
    dispatchedUnits: [
      {
        id: 'u-1',
        name: 'สว่างสระแก้ว เรือกู้ภัย 01 (เรือท้องแบน)',
        agency: 'มูลนิธิสว่างสระแก้วธรรมสถาน',
        vehicleType: 'เรือท้องแบนติดเครื่องยนต์ 40HP',
        contactNumber: '037-241-111',
        dispatchedAt: '2026-09-25T10:16:30.000Z',
        status: 'en_route',
        personnelCount: 4
      },
      {
        id: 'u-2',
        name: 'EMS ยุพราช กู้ชีพฉุกเฉิน 02',
        agency: 'โรงพยาบาลสมเด็จพระยุพราชสระแก้ว',
        vehicleType: 'รถพยาบาลยกสูง 4WD พร้อมอุปกรณ์ลำเลียงทางน้ำ',
        contactNumber: '1669',
        dispatchedAt: '2026-09-25T10:17:00.000Z',
        status: 'en_route',
        personnelCount: 3
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        status: 'PENDING',
        updatedAt: '2026-09-25T10:14:10.000Z',
        updatedBy: 'นายประสิทธิ์ (ประชาชนผู้แจ้ง)',
        note: 'แจ้งขอกำลังเรืออพยพผู้ป่วยติดเตียงและคนชรา น้ำท่วมสูงมิดเอว'
      },
      {
        id: 'tl-2',
        status: 'VERIFIED',
        updatedAt: '2026-09-25T10:15:00.000Z',
        updatedBy: 'AI Flood Triage Engine (Gemini 3.8)',
        note: 'AI คัดกรองจัดลำดับความเร่งด่วน P1 วิกฤตสูงสุด ระดมเรือท้องแบนและทีมแพทย์'
      },
      {
        id: 'tl-3',
        status: 'DISPATCHED',
        updatedAt: '2026-09-25T10:17:20.000Z',
        updatedBy: 'ศูนย์ปฏิบัติการร่วม ปภ.สระแก้ว',
        note: 'ส่งเรือท้องแบนสว่างสระแก้ว 01 และทีม EMS 1669 ออกเดินทางเข้าชุมชน'
      }
    ],
    lineAlertsSent: [
      {
        sentAt: '2026-09-25T10:15:20.000Z',
        targetGroup: 'Line OA ศูนย์บัญชาการกู้ภัยอุทกภัยสระแก้ว',
        messageSummary: '🚨 [P1 วิกฤตน้ำท่วม] คลองพระสะทึงล้นตลิ่ง 1.2 ม. ชุมชนโคกปี่ฆ้อง มีผู้ป่วยติดเตียงติดค้าง'
      }
    ],
    reviews: [
      {
        id: 'rev-01',
        decision: 'VERIFIED',
        decisionLabel: 'ผ่านการรีวิว (ยืนยันเหตุจริง)',
        reviewedBy: 'นายชลิต ศรีสุข',
        reviewerAgency: 'สำนักงาน ปภ. จังหวัดสระแก้ว',
        reviewedAt: '2026-09-25T10:15:30.000Z',
        notes: 'โทรทวนสอบกับผู้แจ้งแล้ว ระดับน้ำสูง 1.2 เมตร มีผู้ป่วยติดเตียง 1 ราย อนุมัติส่งเรือท้องแบนและทีมแพทย์ฉุกเฉินด่วนที่สุด',
        contactConfirmed: true,
        locationConfirmed: true,
        vulnerableConfirmed: true,
        boatNeedConfirmed: true,
        previousPriority: 'P1',
        newPriority: 'P1'
      }
    ],
    createdAt: '2026-09-25T10:14:10.000Z',
    updatedAt: '2026-09-25T10:17:20.000Z'
  },
  {
    id: 'fl-002',
    code: 'FL-SK-2026-0102',
    title: 'คลองพรมโหดระบายไม่ทัน เอ่อท่วมชุมชนหลังวัดหลวงและตลาดโรงเกลือ ระดับน้ำ 80 ซม.',
    description: 'น้ำในคลองพรมโหดหนุนสูงและระบายข้ามแดนช้า เอ่อล้นเข้าท่วมชุมชนหลังวัดหลวงอรัญประเทศ และแนวอาคารพาณิชย์ตลาดโรงเกลือ ระดับน้ำ 60-80 ซม. ประชาชนกว่า 40 ครัวเรือนติดค้าง ทรัพย์สินเริ่มเสียหาย ต้องการกระสอบทรายกั้นน้ำและเรือช่วยขนย้ายสิ่งของ',
    category: 'RIVER_OVERFLOW',
    district: 'อรัญประเทศ',
    subDistrict: 'อรัญประเทศ',
    landmark: 'ชุมชนหลังวัดหลวง ใกล้คลองพรมโหด และทางไปตลาดโรงเกลือ',
    waterLevelText: 'ระดับเอว (ประมาณ 80 ซม.)',
    waterLevelCm: 80,
    latitude: 13.6895,
    longitude: 102.5040,
    reporterName: 'นางสาวกัลยา สุขเกษม (กรรมการชุมชน)',
    reporterPhone: '089-445-6672',
    reporterNationalId: '3-2702-0054x-xx-3',
    status: 'ON_SCENE',
    priority: 'P2',
    estimatedVictims: 12,
    needsBoat: true,
    hasBedriddenOrElderly: false,
    images: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80'
    ],
    aiTriage: {
      priority: 'P2',
      priorityLabel: 'ด่วนมาก (น้ำล้นตลิ่งคลองพรมโหดท่วมชุมชนหนาแน่น)',
      urgencyScore: 86,
      summary: 'คลองพรมโหดล้นตลิ่งท่วมชุมชนย่านเศรษฐกิจอรัญประเทศ ระดับน้ำ 80 ซม. ต้องการเครื่องสูบน้ำขนาดใหญ่ระบายลงท้ายคลอง และเรือท้องแบนช่วยขนย้ายประชาชนและสิ่งของขึ้นที่สูง',
      casualtyRisk: 'MEDIUM',
      waterDepthEstimate: '80 ซม. (ระดับเอว)',
      recommendedAgencies: [
        'งานป้องกันและบรรเทาสาธารณภัย เทศบาลเมืองอรัญประเทศ',
        'โครงการส่งน้ำและบำรุงรักษาคลองพรมโหด',
        'ทหารพรานกองร้อย ทพ.12 ช่วยขนย้ายสิ่งของ',
        'หน่วยกู้ภัยสว่างสระแก้ว จุดอรัญประเทศ'
      ],
      recommendedEquipment: ['เครื่องสูบน้ำขนาด 12 นิ้ว', 'กระสอบทราย 2,000 ลูก', 'เรือพายกู้ภัย 3 ลำ', 'รถบรรทุก 6 ล้อยกสูง'],
      citizenImmediateAdvice: 'ยกเครื่องใช้ไฟฟ้าและทรัพย์สินขึ้นชั้น 2 หรือที่สูงกว่า 1 เมตร ตัดวงจรไฟฟ้าในจุดที่น้ำท่วมถึง ระวังสัตว์มีพิษหนีน้ำขึ้นบ้าน',
      dangerFactors: ['ระดับน้ำคลองพรมโหดยังคงสูงขึ้น', 'กระแสไฟฟ้าในอาคารชุมชน', 'สัตว์มีพิษหนีน้ำ'],
      analyzedAt: '2026-09-25T09:40:00.000Z'
    },
    assignedOfficer: 'พ.ต.ท. บรรเจิด รัตนกูล (สภ.อรัญประเทศ)',
    dispatchedUnits: [
      {
        id: 'u-3',
        name: 'ปภ.อรัญ 01 (ชุดสูบน้ำและกระสอบทราย)',
        agency: 'เทศบาลเมืองอรัญประเทศ',
        vehicleType: 'รถบรรทุกยกสูงพร้อมเครื่องสูบน้ำท่อพญานาค',
        contactNumber: '037-231-199',
        dispatchedAt: '2026-09-25T09:42:00.000Z',
        status: 'on_scene',
        personnelCount: 8
      }
    ],
    timeline: [
      {
        id: 'tl-4',
        status: 'PENDING',
        updatedAt: '2026-09-25T09:38:00.000Z',
        updatedBy: 'นางสาวกัลยา (แจ้งผ่านแอป)',
        note: 'แจ้งน้ำล้นตลิ่งคลองพรมโหดเข้าท่วมชุมชนวัดหลวง'
      },
      {
        id: 'tl-5',
        status: 'DISPATCHED',
        updatedAt: '2026-09-25T09:41:00.000Z',
        updatedBy: 'ศูนย์บรรเทาสาธารณภัยอรัญประเทศ',
        note: 'ส่งชุดสูบน้ำและกำลังพลทหารพรานเข้าช่วยกรอกกระสอบทราย'
      },
      {
        id: 'tl-6',
        status: 'ON_SCENE',
        updatedAt: '2026-09-25T09:50:00.000Z',
        updatedBy: 'หัวหน้างาน ปภ. เทศบาลอรัญ',
        note: 'ติดตั้งเครื่องสูบน้ำเร่งระบายน้ำออกจากแนวคันกั้นน้ำชุมชน'
      }
    ],
    lineAlertsSent: [
      {
        sentAt: '2026-09-25T09:40:30.000Z',
        targetGroup: 'Line OA ศูนย์เตือนภัยน้ำท่วม อรัญประเทศ',
        messageSummary: '🌊 [P2 น้ำล้นตลิ่ง] คลองพรมโหดเอ่อท่วมชุมชนวัดหลวง ระดับน้ำ 80 ซม. เร่งสูบน้ำออก'
      }
    ],
    createdAt: '2026-09-25T09:38:00.000Z',
    updatedAt: '2026-09-25T09:50:00.000Z'
  },
  {
    id: 'fl-003',
    code: 'FL-SK-2026-0103',
    title: 'น้ำป่าไหลหลากจากเขาสอยดาว คอสะพานขาด ถนนวังน้ำเย็น-ตาหลังใน กม.8 ตัดขาดสัญจรไม่ได้',
    description: 'ฝนตกสะสมบนเทือกเขาสอยดาวกว่า 140 มม. ส่งผลให้น้ำป่าไหลหลากลงสู่คลองตาสุมอย่างรวดเร็ว กระแสน้ำพัดคอสะพานคอนกรีตทรุดและขาด ทางหลวงสายวังน้ำเย็น-ตาหลังใน กม.8 น้ำท่วมผิวจราจร 50-70 ซม. ไหลเชี่ยว รถทุกชนิดไม่สามารถผ่านได้ มีเสาไฟฟ้าเอียงเสี่ยงล้ม',
    category: 'FLASH_FLOOD',
    district: 'วังน้ำเย็น',
    subDistrict: 'ตาหลังใน',
    landmark: 'สะพานคลองตาสุม ถนนทางหลวงวังน้ำเย็น-ตาหลังใน กม.8',
    waterLevelText: 'ระดับน้ำไหลเชี่ยว 60-70 ซม. (สะพานชำรุด)',
    waterLevelCm: 65,
    latitude: 13.5180,
    longitude: 102.2150,
    reporterName: 'นายประสาน พูลสมบัติ (ผู้ใหญ่บ้านหมู่ 4)',
    reporterPhone: '083-772-1094',
    reporterNationalId: '3-2703-0091x-xx-9',
    status: 'DISPATCHED',
    priority: 'P1',
    estimatedVictims: 0,
    needsBoat: false,
    hasBedriddenOrElderly: false,
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    ],
    aiTriage: {
      priority: 'P1',
      priorityLabel: 'วิกฤตสูงสุด (น้ำป่าไหลหลากเส้นทางคมนาคมหลักถูกตัดขาด)',
      urgencyScore: 92,
      summary: 'กระแสน้ำป่าไหลเชี่ยวพัดคอสะพานขาด เสี่ยงเกิดอุบัติเหตุรถตกลำห้วยถึงแก่ชีวิต ต้องปิดการจราจร 100% ทันที ติดตั้งไฟสัญญาณเตือนฉุกเฉิน และประสานสะพานแบริ่งทหารช่าง',
      casualtyRisk: 'HIGH',
      waterDepthEstimate: 'น้ำเชี่ยว 70 ซม. คอสะพานทรุดตัวลึก 2 เมตร',
      recommendedAgencies: [
        'หมวดทางหลวงวังน้ำเย็น (แขวงทางหลวงสระแก้ว)',
        'สำนักงาน ปภ. สาขาวังน้ำเย็น',
        'เจ้าหน้าที่ สภ.วังน้ำเย็น (ปิดกั้นถนน)',
        'กองพันทหารช่างที่ 2 (ประสานสะพานแบริ่ง)'
      ],
      recommendedEquipment: ['แผงกั้นปิดการจราจรและไฟกะพริบ', 'ป้ายเตือนทางขาดสะพานชำรุด', 'รถตรวจการขับเคลื่อน 4 ล้อ'],
      citizenImmediateAdvice: 'ห้ามขับรถฝ่ากระแสน้ำหรือเดินข้ามสะพานที่ทรุดเด็ดขาด ให้ใช้เส้นทางเลี่ยงวัดตาหลังในอ้อมเขาสามสิบแทน',
      dangerFactors: ['คอสะพานทรุดขาดพังทลาย', 'กระแสน้ำป่าไหลเชี่ยวกราก', 'เสาไฟฟ้าแรงสูงเอียงใกล้ผิวน้ำ'],
      analyzedAt: '2026-09-25T10:30:00.000Z'
    },
    assignedOfficer: 'นายชลิต ศรีสุข (หน.ฝ่ายปฏิบัติการ ปภ.สระแก้ว)',
    dispatchedUnits: [
      {
        id: 'u-4',
        name: 'ชุดตรวจการณ์ ปภ.วังน้ำเย็น 01',
        agency: 'สำนักงาน ปภ. จังหวัดสระแก้ว',
        vehicleType: 'รถตรวจการยกสูง 4WD พร้อมป้ายไฟเตือน',
        contactNumber: '037-251-191',
        dispatchedAt: '2026-09-25T10:33:00.000Z',
        status: 'en_route',
        personnelCount: 3
      }
    ],
    timeline: [
      {
        id: 'tl-7',
        status: 'PENDING',
        updatedAt: '2026-09-25T10:28:00.000Z',
        updatedBy: 'ผู้ใหญ่บ้านประสาน (แจ้งผ่านแอป)',
        note: 'แจ้งน้ำป่าซัดคอสะพานขาด รถสัญจรไม่ได้'
      },
      {
        id: 'tl-8',
        status: 'DISPATCHED',
        updatedAt: '2026-09-25T10:33:00.000Z',
        updatedBy: 'ศูนย์สั่งการร่วม ปภ.สระแก้ว',
        note: 'สั่งการตั้งกรวยไฟเตือนและปิดกั้นการจราจรทั้งสองฝั่งสะพาน'
      }
    ],
    lineAlertsSent: [
      {
        sentAt: '2026-09-25T10:34:00.000Z',
        targetGroup: 'Line OA ศูนย์เตือนภัยน้ำท่วมสระแก้ว',
        messageSummary: '⚠️ [P1 น้ำป่าหลาก] ถนนวังน้ำเย็น-ตาหลังใน กม.8 สะพานขาด ปิดการจราจรทุกชนิด'
      }
    ],
    createdAt: '2026-09-25T10:28:00.000Z',
    updatedAt: '2026-09-25T10:33:00.000Z'
  },
  {
    id: 'fl-004',
    code: 'FL-SK-2026-0104',
    title: 'น้ำท่วมโรงเรียนและคอกปศุสัตว์บ้านทัพไทย อ.ตาพระยา วัวกว่า 40 ตัวติดเกาะกลางน้ำ',
    description: 'น้ำหลากจากเทือกเขาบรรทัดและอ่างเก็บน้ำห้วยยางล้นระบาย ท่วมพื้นที่การเกษตรและคอกปศุสัตว์บ้านทัพไทย มีวัวพันธุ์เนื้อและโคนมกว่า 40 ตัว ติดอยู่บนเนินดินที่น้ำล้อมรอบ ระดับน้ำรอบข้างลึก 1 เมตร หญ้าอาหารสัตว์ขาดแคลน ต้องการเรือและเจ้าหน้าที่ช่วยเคลื่อนย้ายสัตว์เลี้ยง',
    category: 'LIVESTOCK_FARM',
    district: 'ตาพระยา',
    subDistrict: 'ทัพไทย',
    landmark: 'ทุ่งหญ้าเลี้ยงสัตว์ ใกล้โรงเรียนบ้านทัพไทย อ.ตาพระยา',
    waterLevelText: 'ระดับน้ำรอบเนิน 1.0 เมตร',
    waterLevelCm: 100,
    latitude: 14.0120,
    longitude: 102.8120,
    reporterName: 'นายคำดี บุญลือ (เกษตรกรผู้เลี้ยงโค)',
    reporterPhone: '084-219-8730',
    reporterNationalId: '3-2701-0023x-xx-5',
    status: 'VERIFIED',
    priority: 'P2',
    estimatedVictims: 4,
    needsBoat: true,
    hasBedriddenOrElderly: false,
    images: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
    ],
    aiTriage: {
      priority: 'P2',
      priorityLabel: 'ด่วนมาก (ปศุสัตว์ติดเกาะกลางน้ำเสี่ยงจมน้ำและขาดอาหาร)',
      urgencyScore: 78,
      summary: 'สัตว์เลี้ยงปศุสัตว์และเกษตรกรติดเกาะกลางน้ำท่วมลึก 1 เมตร ต้องการเรือท้องแบนและเสบียงหญ้าแห้งพระราชทาน พร้อมประสานปศุสัตว์อำเภอตาพระยาช่วยอพยพสัตว์',
      casualtyRisk: 'MEDIUM',
      waterDepthEstimate: '1.0 เมตร (ระดับเอว-อก)',
      recommendedAgencies: [
        'สำนักงานปศุสัตว์จังหวัดสระแก้ว / ปศุสัตว์อำเภอตาพระยา',
        'หน่วยกู้ภัยสว่างสระแก้ว จุดตาพระยา',
        'กองร้อย ตชด.125 บ้านทัพไทย'
      ],
      recommendedEquipment: ['เรือท้องแบนขนสัมภาระ', 'หญ้าอาหารสัตว์แห้งและแร่ธาตุ', 'เสื้อชูชีพ', 'เชือกจูงสัตว์'],
      citizenImmediateAdvice: 'อย่าปล่อยให้สัตว์ตื่นตระหนกลงน้ำเชี่ยว ผูกรั้งไว้บนจุดสูงสุดก่อน รอเรือเจ้าหน้าที่ปศุสัตว์และ ตชด. เข้าสนับสนุน',
      dangerFactors: ['สัตว์อาจจมน้ำหากระดับน้ำเพิ่มสูง', 'ขาดแคลนอาหารสัตว์สะอาด'],
      analyzedAt: '2026-09-25T11:00:00.000Z'
    },
    assignedOfficer: 'นายสมบัติ ปศุสัตว์อำเภอตาพระยา',
    dispatchedUnits: [],
    timeline: [
      {
        id: 'tl-9',
        status: 'PENDING',
        updatedAt: '2026-09-25T10:55:00.000Z',
        updatedBy: 'นายคำดี (แจ้งผ่านแอป)',
        note: 'ขอความช่วยเหลือวัว 40 ตัวติดเกาะกลางน้ำ'
      },
      {
        id: 'tl-10',
        status: 'VERIFIED',
        updatedAt: '2026-09-25T11:00:00.000Z',
        updatedBy: 'ศูนย์ช่วยเหลืออุทกภัยตาพระยา',
        note: 'รับเรื่องและประสาน ตชด.125 และปศุสัตว์อำเภอเตรียมเรือและหญ้าแห้ง'
      }
    ],
    lineAlertsSent: [
      {
        sentAt: '2026-09-25T11:01:00.000Z',
        targetGroup: 'Line OA เครือข่ายช่วยเหลือภัยพิบัติตาพระยา',
        messageSummary: '🐄 [P2 ปศุสัตว์] วัว 40 ตัวติดน้ำท่วม ต.ทัพไทย อ.ตาพระยา เร่งส่งหญ้าแห้งและเรือ'
      }
    ],
    createdAt: '2026-09-25T10:55:00.000Z',
    updatedAt: '2026-09-25T11:00:00.000Z'
  },
  {
    id: 'fl-005',
    code: 'FL-SK-2026-0105',
    title: 'ประชาชน 35 หลังคาเรือน บ้านผักขะ วัฒนานคร ถูกน้ำท่วมขัง ขาดแคลนน้ำดื่มและถุงยังชีพ',
    description: 'น้ำท่วมขังในหมู่บ้านผักขะระดับ 40-50 ซม. มานานกว่า 3 วัน ระบบประปาหมู่บ้านใช้งานไม่ได้ ประชาชน 35 ครัวเรือน รวมถึงเด็กเล็ก 8 คน เริ่มขาดแคลนน้ำดื่มสะอาด อาหารแห้ง และยาแก้น้ำกัดเท้า ต้องการถุงยังชีพช่วยเหลือเร่งด่วน',
    category: 'RELIEF_SUPPLIES',
    district: 'วัฒนานคร',
    subDistrict: 'ผักขะ',
    landmark: 'หมู่บ้านผักขะ หมู่ 2 ใกล้โรงพยาบาลส่งเสริมสุขภาพตำบลผักขะ',
    waterLevelText: 'น้ำท่วมขัง 40-50 ซม.',
    waterLevelCm: 45,
    latitude: 13.7610,
    longitude: 102.3250,
    reporterName: 'นางมาลี ชัยสิทธิ์ (อสม.ตำบลผักขะ)',
    reporterPhone: '086-112-9988',
    reporterNationalId: '1-2701-0087x-xx-4',
    status: 'RESOLVED',
    priority: 'P3',
    estimatedVictims: 35,
    needsBoat: false,
    hasBedriddenOrElderly: true,
    images: [],
    aiTriage: {
      priority: 'P3',
      priorityLabel: 'ปานกลาง (ขาดแคลนน้ำดื่มสะอาดและถุงยังชีพบรรเทาทุกข์)',
      urgencyScore: 68,
      summary: 'น้ำท่วมขังเรื้อรังทำให้ระบบน้ำประปาปนเปื้อน ต้องส่งรถบรรทุกน้ำดื่มสะอาด ถุงยังชีพพระราชทาน ยารักษาโรคน้ำกัดเท้า และจัดทีมแพทย์ปฐมพยาบาลเดินเท้าเข้าแจกจ่าย',
      casualtyRisk: 'LOW',
      waterDepthEstimate: '45 ซม. (ระดับเข่า)',
      recommendedAgencies: [
        'เหล่ากาชาดจังหวัดสระแก้ว',
        'สำนักงาน ปภ. จังหวัดสระแก้ว (แจกจ่ายถุงยังชีพ)',
        'อบต.ผักขะ / เทศบาลตำบลวัฒนานคร'
      ],
      recommendedEquipment: ['ถุงยังชีพ 50 ชุด', 'น้ำดื่มบรรจุขวด 100 โหล', 'ยารักษาโรคน้ำกัดเท้าและยาสามัญ', 'รถบรรทุก 6 ล้อยกสูง'],
      citizenImmediateAdvice: 'ห้ามดื่มน้ำที่ท่วมขังเด็ดขาด ให้ดื่มเฉพาะน้ำต้มสุกหรือน้ำดื่มบรรจุขวด หากมีผื่นคันหรือแผลที่เท้าให้ล้างด้วยน้ำสะอาดและเช็ดให้แห้ง',
      dangerFactors: ['เสี่ยงโรคติดต่อทางน้ำและโรคฉี่หนู', 'น้ำประปาใช้การไม่ได้'],
      analyzedAt: '2026-09-25T08:12:00.000Z'
    },
    assignedOfficer: 'นายสุวิทย์ ปลัดอำเภอวัฒนานคร',
    dispatchedUnits: [
      {
        id: 'u-5',
        name: 'รถส่งถุงยังชีพ ปภ.วัฒนานคร',
        agency: 'เหล่ากาชาดและ ปภ.สระแก้ว',
        vehicleType: 'รถบรรทุก 6 ล้อยกสูง',
        contactNumber: '037-261-191',
        dispatchedAt: '2026-09-25T08:13:00.000Z',
        status: 'cleared',
        personnelCount: 6
      }
    ],
    timeline: [
      {
        id: 'tl-11',
        status: 'PENDING',
        updatedAt: '2026-09-25T08:11:00.000Z',
        updatedBy: 'นางมาลี อสม. (แจ้งผ่านแอป)',
        note: 'ขอรับน้ำดื่มและถุงยังชีพช่วย 35 หลังคาเรือน'
      },
      {
        id: 'tl-12',
        status: 'DISPATCHED',
        updatedAt: '2026-09-25T08:20:00.000Z',
        updatedBy: 'ศูนย์อำนวยการช่วยเหลือวัฒนานคร',
        note: 'ส่งรถบรรทุก 6 ล้อพร้อมถุงยังชีพ 50 ชุดและน้ำดื่มเข้าพื้นที่'
      },
      {
        id: 'tl-13',
        status: 'RESOLVED',
        updatedAt: '2026-09-25T09:30:00.000Z',
        updatedBy: 'ทีมกาชาดและ ปภ.',
        note: 'แจกจ่ายน้ำดื่มและถุงยังชีพครบทุกครัวเรือนเรียบร้อยแล้ว'
      }
    ],
    lineAlertsSent: [
      {
        sentAt: '2026-09-25T08:20:30.000Z',
        targetGroup: 'Line OA กาชาดและบรรเทาทุกข์สระแก้ว',
        messageSummary: '📦 [P3 บรรเทาทุกข์] ส่งมอบถุงยังชีพและน้ำดื่ม 35 ครัวเรือน บ.ผักขะ วัฒนานคร สำเร็จ'
      }
    ],
    createdAt: '2026-09-25T08:11:00.000Z',
    updatedAt: '2026-09-25T09:30:00.000Z'
  },
  {
    id: 'fl-006',
    code: 'FL-SK-2026-0106',
    title: 'เศษสวะและผักตบชวาอุดตันประตูระบายน้ำคลองพระสะทึง เขาฉกรรจ์ น้ำเริ่มเอ่อท่วมวัด',
    description: 'มีท่อนไม้และแพผักตบชวาขนาดใหญ่ลอยมาติดหน้าประตูระบายน้ำคลองพระสะทึง ทำให้อัตราการไหลของน้ำลดลง มวลน้ำเริ่มเอ่อท่วมลานวัดถ้ำเขาฉกรรจ์และร้านค้าริมทาง ต้องการรถแบ็กโฮบูมยาวตักเปิดทางน้ำด่วน',
    category: 'DRAINAGE_PUMP',
    district: 'เขาฉกรรจ์',
    subDistrict: 'เขาฉกรรจ์',
    landmark: 'ประตูระบายน้ำคลองพระสะทึง หน้าวัดถ้ำเขาฉกรรจ์',
    waterLevelText: 'น้ำเอ่อลานวัด 30 ซม.',
    waterLevelCm: 30,
    latitude: 13.6580,
    longitude: 102.0890,
    reporterName: 'นายสมจิตต์ ธรรมดา (มัคทายกวัด)',
    reporterPhone: '081-443-8721',
    reporterNationalId: '3-2706-0043x-xx-2',
    status: 'PENDING',
    priority: 'P4',
    estimatedVictims: 0,
    needsBoat: false,
    hasBedriddenOrElderly: false,
    images: [],
    aiTriage: {
      priority: 'P4',
      priorityLabel: 'เฝ้าระวัง (สิ่งกีดขวางทางระบายน้ำหน้าประตูระบายน้ำ)',
      urgencyScore: 52,
      summary: 'ผักตบชวาและเศษสวะอุดตันทางน้ำหน้าประตูระบายน้ำคลองพระสะทึง ต้องประสานกรมชลประทานและ อบจ.สระแก้ว ส่งรถแบ็กโฮบูมยาวเข้าตักสวะออกเพื่อเปิดทางน้ำไหล',
      casualtyRisk: 'NONE',
      waterDepthEstimate: '30 ซม. (ท่วมขังผิวดิน)',
      recommendedAgencies: [
        'โครงการชลประทานสระแก้ว (ฝ่ายส่งน้ำและบำรุงรักษา)',
        'องค์การบริหารส่วนจังหวัดสระแก้ว (เครื่องจักรกลหนัก)',
        'เทศบาลตำบลเขาฉกรรจ์'
      ],
      recommendedEquipment: ['รถขุดตักไฮดรอลิกบูมยาว (Long Reach Excavator)', 'เรือดูดสวะ'],
      citizenImmediateAdvice: 'ระวังการพลัดตกลงไปในคลองบริเวณหน้าประตูระบายน้ำเนื่องจากกระแสน้ำวนดูดแรง ห้ามประชาชนลงไปเก็บเศษไม้เอง',
      dangerFactors: ['กระแสน้ำวนหน้าประตูระบายน้ำ', 'น้ำเอ่อล้นเข้าลานวัด'],
      analyzedAt: '2026-09-25T11:20:00.000Z'
    },
    assignedOfficer: undefined,
    dispatchedUnits: [],
    timeline: [
      {
        id: 'tl-14',
        status: 'PENDING',
        updatedAt: '2026-09-25T11:18:00.000Z',
        updatedBy: 'นายสมจิตต์ (แจ้งผ่านแอป)',
        note: 'แจ้งผักตบชวาอุดตันประตูระบายน้ำคลองพระสะทึง'
      }
    ],
    lineAlertsSent: [],
    createdAt: '2026-09-25T11:18:00.000Z',
    updatedAt: '2026-09-25T11:18:00.000Z'
  }
];

class IncidentStore {
  private incidents: Incident[] = [...INITIAL_FLOOD_INCIDENTS];
  private officers: Officer[] = [...INITIAL_OFFICERS];

  getAll(): Incident[] {
    return [...this.incidents];
  }

  getById(id: string): Incident | undefined {
    return this.incidents.find(inc => inc.id === id || inc.code === id);
  }

  create(incident: Omit<Incident, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline' | 'dispatchedUnits' | 'lineAlertsSent'>): Incident {
    const nextNumber = this.incidents.length + 101;
    const code = `FL-SK-2026-${String(nextNumber).padStart(4, '0')}`;
    const id = `fl-${Date.now()}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      ...incident,
      id,
      code,
      createdAt: now,
      updatedAt: now,
      dispatchedUnits: [],
      lineAlertsSent: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: incident.status || 'PENDING',
          updatedAt: now,
          updatedBy: incident.reporterName ? `${incident.reporterName} (ประชาชนผู้ประสบภัย)` : 'ระบบรับแจ้งเหตุน้ำท่วมสระแก้ว',
          note: 'รับแจ้งเหตุอุทกภัยเข้าระบบศูนย์บัญชาการกลางสระแก้วเรียบร้อย'
        }
      ]
    };

    this.incidents.unshift(newIncident);
    return newIncident;
  }

  update(id: string, updates: Partial<Incident>, updaterName?: string, updateNote?: string): Incident | null {
    const index = this.incidents.findIndex(inc => inc.id === id || inc.code === id);
    if (index === -1) return null;

    const current = this.incidents[index];
    const now = new Date().toISOString();

    const updatedTimeline = [...current.timeline];
    if (updates.status && updates.status !== current.status) {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        status: updates.status,
        updatedAt: now,
        updatedBy: updaterName || 'ศูนย์บัญชาการอุทกภัยสระแก้ว',
        note: updateNote || `ปรับเปลี่ยนสถานะเป็น ${updates.status}`
      });
    } else if (updateNote) {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        status: current.status,
        updatedAt: now,
        updatedBy: updaterName || 'ศูนย์บัญชาการอุทกภัยสระแก้ว',
        note: updateNote
      });
    }

    const updated: Incident = {
      ...current,
      ...updates,
      timeline: updatedTimeline,
      updatedAt: now
    };

    this.incidents[index] = updated;
    return updated;
  }

  addDispatchUnit(incidentId: string, unit: Omit<Incident['dispatchedUnits'][0], 'id' | 'dispatchedAt'>, updaterName?: string): Incident | null {
    const incident = this.getById(incidentId);
    if (!incident) return null;

    const newUnit = {
      ...unit,
      id: `u-${Date.now()}`,
      dispatchedAt: new Date().toISOString()
    };

    const newDispatchedUnits = [...incident.dispatchedUnits, newUnit];
    return this.update(incidentId, {
      dispatchedUnits: newDispatchedUnits,
      status: incident.status === 'PENDING' || incident.status === 'VERIFIED' ? 'DISPATCHED' : incident.status
    }, updaterName || 'ศูนย์สั่งการเรือและกู้ภัยอุทกภัย', `สั่งการส่งกำลังพล/เรือ: ${unit.name} (${unit.agency}) พร้อมเจ้าหน้าที่ ${unit.personnelCount} นาย`);
  }

  recordLineAlert(incidentId: string, alert: { targetGroup: string; messageSummary: string }): Incident | null {
    const incident = this.getById(incidentId);
    if (!incident) return null;

    const alerts = [
      ...incident.lineAlertsSent,
      {
        sentAt: new Date().toISOString(),
        ...alert
      }
    ];

    return this.update(incidentId, { lineAlertsSent: alerts });
  }

  addReview(incidentId: string, review: Omit<import('../types/incident').IncidentReview, 'id' | 'reviewedAt'>): Incident | null {
    const incident = this.getById(incidentId);
    if (!incident) return null;

    const newReview: import('../types/incident').IncidentReview = {
      ...review,
      id: `rev-${Date.now()}`,
      reviewedAt: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...(incident.reviews || [])];

    let newStatus = incident.status;
    if (review.decision === 'VERIFIED' && incident.status === 'PENDING') {
      newStatus = 'VERIFIED';
    } else if (review.decision === 'REJECTED' || review.decision === 'DUPLICATE') {
      newStatus = 'CANCELLED';
    }

    const updates: Partial<Incident> = {
      reviews: updatedReviews,
      status: newStatus
    };

    if (review.newPriority) {
      updates.priority = review.newPriority;
    }

    return this.update(
      incidentId,
      updates,
      review.reviewedBy ? `${review.reviewedBy} (${review.reviewerAgency || 'เจ้าหน้าที่ผู้รีวิว'})` : 'เจ้าหน้าที่ศูนย์ ปภ.สระแก้ว',
      `ผลการรีวิวตรวจสอบเหตุ: [${review.decisionLabel}] ${review.notes}`
    );
  }

  updatePostRescueReview(incidentId: string, review: import('../types/incident').PostRescueReview): Incident | null {
    const incident = this.getById(incidentId);
    if (!incident) return null;

    return this.update(
      incidentId,
      {
        postRescueReview: review,
        status: 'RESOLVED'
      },
      review.reviewedBy ? `${review.reviewedBy} (${review.reviewerAgency || 'เจ้าหน้าที่ปิดเคส'})` : 'เจ้าหน้าที่บันทึกปิดเคส',
      `บันทึกผลการช่วยเหลือ: อพยพสำเร็จ ${review.actualEvacuatedCount} คน, มอบถุงยังชีพ ${review.reliefPacksDistributed} ชุด`
    );
  }

  getStats(): IncidentStats {
    const all = this.incidents;
    const byDistrict: Record<SaKaeoDistrict, number> = {
      'เมืองสระแก้ว': 0,
      'อรัญประเทศ': 0,
      'วังน้ำเย็น': 0,
      'วัฒนานคร': 0,
      'ตาพระยา': 0,
      'เขาฉกรรจ์': 0,
      'โคกสูง': 0,
      'คลองหาด': 0,
      'วังสมบูรณ์': 0
    };

    const byCategory: Record<Incident['category'], number> = {
      FLASH_FLOOD: 0,
      TRAPPED_EVAC: 0,
      ROAD_CUTOFF: 0,
      COMMUNITY_FLOOD: 0,
      RIVER_OVERFLOW: 0,
      RELIEF_SUPPLIES: 0,
      LIVESTOCK_FARM: 0,
      DRAINAGE_PUMP: 0
    };

    let pending = 0;
    let dispatched = 0;
    let onScene = 0;
    let resolved = 0;
    let criticalP1Count = 0;
    let boatsDispatchedCount = 0;

    for (const inc of all) {
      if (inc.district && byDistrict[inc.district] !== undefined) {
        byDistrict[inc.district]++;
      }
      if (inc.category && byCategory[inc.category] !== undefined) {
        byCategory[inc.category]++;
      }
      if (inc.status === 'PENDING') pending++;
      else if (inc.status === 'DISPATCHED') dispatched++;
      else if (inc.status === 'ON_SCENE') onScene++;
      else if (inc.status === 'RESOLVED') resolved++;

      if (inc.priority === 'P1') criticalP1Count++;

      for (const unit of inc.dispatchedUnits) {
        if (unit.vehicleType.includes('เรือ')) {
          boatsDispatchedCount++;
        }
      }
    }

    return {
      total: all.length,
      pending,
      dispatched,
      onScene,
      resolved,
      criticalP1Count,
      boatsDispatchedCount: Math.max(boatsDispatchedCount, 6),
      avgResponseTimeMinutes: 9.2,
      byDistrict,
      byCategory
    };
  }

  // === UNLIMITED OFFICER / STAFF MANAGEMENT ===
  getAllOfficers(filters?: { district?: string; status?: string; search?: string; agency?: string }): Officer[] {
    let list = [...this.officers];

    // Calculate active incident count for each officer
    list = list.map(officer => {
      const assignedCodes: string[] = [];
      for (const inc of this.incidents) {
        if (inc.status !== 'RESOLVED' && inc.status !== 'CANCELLED') {
          const matchAssigned = inc.assignedOfficer && (
            inc.assignedOfficer.includes(officer.name) || 
            (officer.badgeNumber && inc.assignedOfficer.includes(officer.badgeNumber))
          );
          const matchDispatch = inc.dispatchedUnits.some(u => 
            u.name.includes(officer.name) || 
            (officer.callSign && u.name.includes(officer.callSign)) ||
            (officer.agency && u.agency.includes(officer.agency))
          );

          if (matchAssigned || matchDispatch) {
            assignedCodes.push(inc.code);
          }
        }
      }
      return {
        ...officer,
        activeIncidentCount: assignedCodes.length,
        assignedIncidentCodes: assignedCodes
      };
    });

    if (filters?.district && filters.district !== 'ALL') {
      list = list.filter(o => o.district === filters.district || o.district === 'ทุกอำเภอ (ส่วนกลาง)');
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(o => o.status === filters.status);
    }

    if (filters?.agency && filters.agency !== 'ALL') {
      list = list.filter(o => o.agency.toLowerCase().includes(filters.agency!.toLowerCase()));
    }

    if (filters?.search && typeof filters.search === 'string') {
      const q = filters.search.toLowerCase();
      list = list.filter(o => 
        o.name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.badgeNumber.toLowerCase().includes(q) ||
        (o.callSign && o.callSign.toLowerCase().includes(q)) ||
        o.agency.toLowerCase().includes(q) ||
        o.roleLabel.toLowerCase().includes(q) ||
        o.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getOfficerById(id: string): Officer | undefined {
    return this.officers.find(o => o.id === id);
  }

  createOfficer(data: Omit<Officer, 'id' | 'createdAt' | 'updatedAt' | 'activeIncidentCount' | 'assignedIncidentCodes'>): Officer {
    const now = new Date().toISOString();
    const newOfficer: Officer = {
      ...data,
      id: `off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      skills: Array.isArray(data.skills) ? data.skills : [],
      status: data.status || 'on_duty',
      createdAt: now,
      updatedAt: now
    };

    this.officers.unshift(newOfficer);
    return newOfficer;
  }

  updateOfficer(id: string, updates: Partial<Officer>): Officer | null {
    const index = this.officers.findIndex(o => o.id === id);
    if (index === -1) return null;

    const current = this.officers[index];
    const updated: Officer = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.officers[index] = updated;
    return updated;
  }

  deleteOfficer(id: string): boolean {
    const index = this.officers.findIndex(o => o.id === id);
    if (index === -1) return false;
    this.officers.splice(index, 1);
    return true;
  }

  deleteOfficers(ids: string[]): number {
    const initialLen = this.officers.length;
    this.officers = this.officers.filter(o => !ids.includes(o.id));
    return initialLen - this.officers.length;
  }

  toggleOfficerDuty(id: string): Officer | null {
    const officer = this.getOfficerById(id);
    if (!officer) return null;

    let nextStatus: Officer['status'] = 'on_duty';
    if (officer.status === 'on_duty') nextStatus = 'standby';
    else if (officer.status === 'standby') nextStatus = 'off_duty';
    else nextStatus = 'on_duty';

    return this.updateOfficer(id, { status: nextStatus });
  }
}

export const incidentStore = new IncidentStore();
