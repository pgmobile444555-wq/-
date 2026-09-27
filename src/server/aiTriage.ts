import { GoogleGenAI } from '@google/genai';
import { AITriageResult, FloodCategory, PriorityLevel, SaKaeoDistrict } from '../types/incident';

interface FloodTriageInput {
  title: string;
  description: string;
  category: FloodCategory;
  district: SaKaeoDistrict;
  landmark?: string;
  waterLevelText?: string;
  estimatedVictims?: number;
  needsBoat?: boolean;
  hasBedriddenOrElderly?: boolean;
}

export async function analyzeIncidentWithAI(input: FloodTriageInput): Promise<AITriageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `คุณคือระบบปัญญาประดิษฐ์คัดกรองเหตุอุทกภัยและน้ำท่วมฉุกเฉินของ "ศูนย์บัญชาการเหตุการณ์อุทกภัยและบรรเทาสาธารณภัย จังหวัดสระแก้ว"
จงวิเคราะห์ข้อมูลเหตุน้ำท่วมที่ได้รับแจ้งจากประชาชนในพื้นที่จังหวัดสระแก้ว (ครอบคลุมลุ่มน้ำคลองพระสะทึง, คลองพรมโหด, น้ำหลากเขาสอยดาว/เทือกเขาบรรทัด) เพื่อให้ศูนย์สั่งการส่งเรือกู้ภัยและกำลังพลเข้าช่วยเหลือได้อย่างแม่นยำและรวดเร็วที่สุด:

ข้อมูลเหตุน้ำท่วม:
- หัวข้อเหตุ: ${input.title}
- รายละเอียด: ${input.description}
- ประเภทอุทกภัย: ${input.category}
- อำเภอในสระแก้ว: ${input.district}
- จุดสังเกต/ริมลำน้ำ: ${input.landmark || 'ไม่ระบุ'}
- ระดับน้ำท่วม: ${input.waterLevelText || 'ไม่ระบุ'}
- จำนวนผู้ประสบภัย/ผู้ติดค้าง: ${input.estimatedVictims ?? 0} คน
- ต้องการเรือกู้ภัย: ${input.needsBoat ? 'ต้องการเรือด่วน' : 'ยังไม่ระบุ'}
- มีผู้ป่วยติดเตียง/คนชรา/เด็กเล็ก: ${input.hasBedriddenOrElderly ? 'มีกลุ่มเปราะบางติดค้าง' : 'ไม่มี/ไม่ระบุ'}

จงวิเคราะห์และตอบกลับในรูปแบบ JSON ตาม Schema นี้เท่านั้น:
{
  "priority": "P1" | "P2" | "P3" | "P4",
  "priorityLabel": string (เช่น "วิกฤตสูงสุด (มีผู้ป่วยติดเตียงติดค้างในน้ำท่วมสูง)", "ด่วนมาก (น้ำท่วมถนน/ต้องการเรือ)", "ปานกลาง", "เฝ้าระวัง"),
  "urgencyScore": number (0-100 เช่น 95 สำหรับวิกฤตอันตรายถึงชีวิต),
  "summary": string (สรุปสถานการณ์น้ำท่วมและเหตุผลความเร่งด่วนสำหรับชุดปฏิบัติการทางน้ำ),
  "casualtyRisk": "HIGH" | "MEDIUM" | "LOW" | "NONE",
  "waterDepthEstimate": string (ประเมินระดับความลึกของน้ำ เช่น "1.0 - 1.5 เมตร (ระดับอก)", "50 ซม. (ระดับเข่า)"),
  "recommendedAgencies": string[] (ระบุชื่อหน่วยงานในจังหวัดสระแก้ว เช่น ชุดกู้ภัยทางน้ำสว่างสระแก้ว (เรือท้องแบน), ศูนย์ 1669 รพ.สมเด็จพระยุพราชสระแก้ว, สำนักงาน ปภ. จังหวัดสระแก้ว, กองพันทหารช่าง, ตชด./ทหารพราน),
  "recommendedEquipment": string[] (อุปกรณ์ทางน้ำที่จำเป็น เช่น เรือท้องแบนติดเครื่องยนต์, เสื้อชูชีพ, รถยกสูง 4WD, เชือกกู้ภัย, ถุงยังชีพ, บอร์ดเคลื่อนย้ายผู้ป่วย),
  "citizenImmediateAdvice": string (คำแนะนำเรื่องความปลอดภัยแก่ประชาชนผู้ประสบภัยขณะรอเรือกู้ภัย เช่น ตัดไฟ, อยู่ที่สูง, ห้ามลุยน้ำเชี่ยว),
  "dangerFactors": string[] (ปัจจัยเสี่ยงอันตราย เช่น กระแสน้ำเชี่ยว, ไฟฟ้าดูด/รั่ว, สัตว์มีพิษหนีน้ำ)
}

เกณฑ์ระดับความสำคัญเรื่องน้ำท่วม:
- P1 (วิกฤตสูงสุด): น้ำป่าไหลหลากเชี่ยวรุนแรง, มีคนติดค้างในบ้านที่น้ำมิดชั้น 1, มีผู้ป่วยติดเตียง/คนชราเสี่ยงจมน้ำ, สะพานหรือถนนขาดรถจมน้ำ
- P2 (ด่วนมาก): น้ำท่วมสูง 50-80 ซม., ปศุสัตว์/วัวควายติดเกาะกลางน้ำ, ถนนถูกตัดขาดสัญจรไม่ได้, ต้องการเรืออพยพ
- P3 (ปานกลาง): น้ำท่วมขังบ้านเรือน 30-50 ซม., ประชาชนขาดแคลนน้ำดื่มสะอาดและถุงยังชีพ, ระบบประปาหมู่บ้านเสีย
- P4 (เฝ้าระวัง): น้ำปริ่มตลิ่งคลองพระสะทึง/คลองพรมโหด, ผักตบชวาอุดตันประตูระบายน้ำ, ต้องการกระสอบทรายเสริมคัน`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return {
          priority: (parsed.priority as PriorityLevel) || 'P2',
          priorityLabel: parsed.priorityLabel || 'ด่วนมาก (สถานการณ์น้ำท่วม)',
          urgencyScore: Number(parsed.urgencyScore) || 75,
          summary: parsed.summary || 'AI วิเคราะห์สถานการณ์อุทกภัยและประเมินระดับความช่วยเหลือ',
          casualtyRisk: parsed.casualtyRisk || 'MEDIUM',
          waterDepthEstimate: parsed.waterDepthEstimate || 'ระดับน้ำประมาณ 50-80 ซม.',
          recommendedAgencies: Array.isArray(parsed.recommendedAgencies) ? parsed.recommendedAgencies : ['ชุดกู้ภัยทางน้ำสว่างสระแก้ว', 'สำนักงาน ปภ. จังหวัดสระแก้ว'],
          recommendedEquipment: Array.isArray(parsed.recommendedEquipment) ? parsed.recommendedEquipment : ['เรือท้องแบน', 'เสื้อชูชีพ'],
          citizenImmediateAdvice: parsed.citizenImmediateAdvice || 'ตัดสะพานไฟทันที อยู่ในจุดที่สูงที่สุดของบ้าน และสวมเสื้อชูชีพหรือเตรียมทุ่นลอยน้ำ',
          dangerFactors: Array.isArray(parsed.dangerFactors) ? parsed.dangerFactors : ['ระดับน้ำท่วมสูง', 'เสี่ยงกระแสไฟฟ้ารั่ว'],
          analyzedAt: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning, falling back to flood heuristics:', err);
    }
  }

  // Heuristic rule-based fallback specifically for flood incidents
  return fallbackFloodHeuristic(input);
}

function fallbackFloodHeuristic(input: FloodTriageInput): AITriageResult {
  const text = `${input.title} ${input.description} ${input.waterLevelText || ''}`.toLowerCase();
  
  const isCriticalLifeThreat = 
    input.hasBedriddenOrElderly || 
    input.category === 'TRAPPED_EVAC' ||
    text.includes('ติดเตียง') || 
    text.includes('คนชรา') || 
    text.includes('จมน้ำ') || 
    text.includes('ไหลเชี่ยว') || 
    text.includes('น้ำป่า') ||
    text.includes('1.2') ||
    text.includes('มิดหัว') ||
    text.includes('มิดอก');

  const isRoadCutoff = input.category === 'ROAD_CUTOFF' || text.includes('สะพานขาด') || text.includes('ตัดขาด');
  const isOverflow = input.category === 'RIVER_OVERFLOW' || input.category === 'FLASH_FLOOD';
  const isRelief = input.category === 'RELIEF_SUPPLIES' || text.includes('ถุงยังชีพ') || text.includes('น้ำดื่ม');

  let priority: PriorityLevel = 'P3';
  let priorityLabel = 'ปานกลาง (ขอรับความช่วยเหลือบรรเทาทุกข์)';
  let urgencyScore = 65;
  let casualtyRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'LOW';
  let waterDepthEstimate = 'ระดับน้ำ 40 - 60 ซม.';
  const dangerFactors: string[] = ['น้ำท่วมขังพื้นที่', 'เสี่ยงไฟฟ้ารั่วในจุดน้ำท่วม'];
  const recommendedAgencies: string[] = ['สำนักงาน ปภ. จังหวัดสระแก้ว'];
  const recommendedEquipment: string[] = ['เรือพายกู้ภัย', 'เสื้อชูชีพ', 'ถุงยังชีพ'];
  let citizenAdvice = 'ยกสะพานไฟลงทันที อยู่ในจุดสูง และห้ามเดินลุยน้ำโดยไม่สวมรองเท้าบูท';

  if (isCriticalLifeThreat) {
    priority = 'P1';
    priorityLabel = 'วิกฤตสูงสุด (คนติดค้าง/ผู้ป่วยติดเตียงในน้ำท่วมสูง)';
    urgencyScore = 95;
    casualtyRisk = 'HIGH';
    waterDepthEstimate = 'ระดับน้ำลึกกว่า 1 เมตร หรือกระแสน้ำไหลเชี่ยว';
    dangerFactors.push('มีผู้ป่วย/คนชราช่วยเหลือตัวเองไม่ได้', 'กระแสน้ำไหลเชี่ยวเสี่ยงพลัดตกน้ำ');
    recommendedAgencies.push('ชุดกู้ภัยทางน้ำ หน่วยกู้ภัยสว่างสระแก้ว (เรือท้องแบน)', 'ศูนย์กู้ชีพ 1669 รพ.สมเด็จพระยุพราชสระแก้ว', `ปภ.สาขา${input.district}`);
    recommendedEquipment.push('เรือท้องแบนติดเครื่องยนต์', 'บอร์ดเคลื่อนย้ายผู้ป่วยทางน้ำ', 'เสื้อชูชีพขนาดต่างๆ');
    citizenAdvice = 'ตัดกระแสไฟหลักทันที อยู่บนที่สูง ห้ามลงไปลุยกระแสน้ำเชี่ยว รอทีมเรือท้องแบนเข้าช่วยเหลือ';
  } else if (isRoadCutoff || isOverflow || input.needsBoat) {
    priority = 'P2';
    priorityLabel = 'ด่วนมาก (น้ำท่วมสูง/ถนนตัดขาด/ต้องการเรือ)';
    urgencyScore = 80;
    casualtyRisk = 'MEDIUM';
    waterDepthEstimate = 'ระดับน้ำ 60 - 90 ซม.';
    dangerFactors.push('การสัญจรถูกตัดขาด', 'ยานพาหนะขนาดเล็กไม่สามารถผ่านได้');
    recommendedAgencies.push(`หมวดทางหลวง${input.district}`, 'หน่วยกู้ภัยสว่างสระแก้ว', `เทศบาล/อบต.ในพื้นที่ ${input.district}`);
    recommendedEquipment.push('เรือพายกู้ภัย', 'ป้ายและไฟสัญญาณเตือนทางน้ำท่วม', 'รถยกสูง 4WD');
    citizenAdvice = 'ห้ามขับรถฝ่ากระแสน้ำเด็ดขาด ยกทรัพย์สินขึ้นที่สูง และระวังสัตว์มีพิษหนีน้ำ';
  } else if (isRelief) {
    priority = 'P3';
    priorityLabel = 'ปานกลาง (ขาดแคลนเครื่องอุปโภคบริโภคและน้ำดื่ม)';
    urgencyScore = 60;
    casualtyRisk = 'LOW';
    waterDepthEstimate = 'ระดับน้ำท่วมขัง 30 - 50 ซม.';
    dangerFactors.push('ขาดแคลนน้ำดื่มสะอาด', 'เสี่ยงโรคน้ำกัดเท้าและโรคฉี่หนู');
    recommendedAgencies.push('เหล่ากาชาดจังหวัดสระแก้ว', `ปภ.จังหวัดสระแก้ว`);
    recommendedEquipment.push('ถุงยังชีพพระราชทาน', 'น้ำดื่มสะอาดบรรจุขวด', 'ยารักษาโรคน้ำกัดเท้า');
    citizenAdvice = 'ดื่มเฉพาะน้ำต้มสุกหรือน้ำดื่มบรรจุขวด ล้างเท้าด้วยน้ำสะอาดและเช็ดให้แห้งเสมอ';
  } else {
    priority = 'P4';
    priorityLabel = 'เฝ้าระวัง (น้ำปริ่มตลิ่ง/ขยะอุดตันทางระบายน้ำ)';
    urgencyScore = 48;
    casualtyRisk = 'NONE';
    waterDepthEstimate = 'ระดับน้ำต่ำกว่า 30 ซม.';
    dangerFactors.push('อัตราการไหลระบายน้ำช้าลง');
    recommendedAgencies.push('โครงการชลประทานสระแก้ว', `กองช่าง เทศบาล${input.district}`);
    recommendedEquipment.push('เครื่องสูบน้ำขนาดใหญ่', 'รถขุดตักเศษสวะ');
  }

  return {
    priority,
    priorityLabel,
    urgencyScore,
    summary: `คัดกรองอุทกภัย: เหตุ${input.category} ในพื้นที่ อ.${input.district} ความเร่งด่วนระดับ ${priority}`,
    casualtyRisk,
    waterDepthEstimate,
    recommendedAgencies,
    recommendedEquipment,
    citizenImmediateAdvice: citizenAdvice,
    dangerFactors,
    analyzedAt: new Date().toISOString()
  };
}
