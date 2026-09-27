import { Request, Response, Router } from 'express';
import { SA_KAEO_DISTRICTS } from '../data/saKaeoDistricts';
import { PriorityLevel } from '../types/incident';
import { analyzeIncidentWithAI } from './aiTriage';
import { incidentStore } from './incidentStore';
import { sendLineOaAlert } from './lineOaDispatcher';

export const apiRouter = Router();

// 1. Get all incidents
apiRouter.get('/incidents', (req: Request, res: Response) => {
  const { district, status, priority, search } = req.query;
  let list = incidentStore.getAll();

  if (district && district !== 'ALL') {
    list = list.filter(i => i.district === district);
  }

  if (status && status !== 'ALL') {
    list = list.filter(i => i.status === status);
  }

  if (priority && priority !== 'ALL') {
    list = list.filter(i => i.priority === priority);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(i => 
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.code.toLowerCase().includes(q) ||
      i.district.toLowerCase().includes(q) ||
      i.landmark.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// 2. Get single incident
apiRouter.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    res.status(404).json({ success: false, message: 'ไม่พบข้อมูลเหตุการณ์ที่ระบุ' });
    return;
  }
  res.json({ success: true, data: incident });
});

// 3. Create incident from citizen report
apiRouter.post('/incidents', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      district,
      subDistrict,
      landmark,
      latitude,
      longitude,
      reporterName,
      reporterPhone,
      reporterNationalId,
      estimatedVictims,
      waterLevelText,
      waterLevelCm,
      needsBoat,
      hasBedriddenOrElderly,
      images,
      skipAi
    } = req.body;

    if (!title || !district || !latitude || !longitude || !reporterPhone) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น: หัวข้อเหตุ, อำเภอ, พิกัด, และเบอร์โทรศัพท์ผู้แจ้ง'
      });
      return;
    }

    // 1. Run AI Flood Triage
    let aiTriageResult = undefined;
    let initialPriority: PriorityLevel = 'P3';

    if (!skipAi) {
      aiTriageResult = await analyzeIncidentWithAI({
        title,
        description: description || title,
        category: category || 'COMMUNITY_FLOOD',
        district,
        landmark,
        waterLevelText,
        estimatedVictims: Number(estimatedVictims) || 0,
        needsBoat: Boolean(needsBoat),
        hasBedriddenOrElderly: Boolean(hasBedriddenOrElderly)
      });
      initialPriority = aiTriageResult.priority;
    }

    // 2. Save flood incident in central store
    const created = incidentStore.create({
      title,
      description: description || '',
      category: category || 'COMMUNITY_FLOOD',
      district,
      subDistrict: subDistrict || '',
      landmark: landmark || '',
      waterLevelText: waterLevelText || '',
      waterLevelCm: Number(waterLevelCm) || undefined,
      latitude: Number(latitude),
      longitude: Number(longitude),
      reporterName: reporterName || 'ประชาชนผู้ประสบภัย (สระแก้ว)',
      reporterPhone,
      reporterNationalId: reporterNationalId || '',
      status: 'PENDING',
      priority: initialPriority,
      estimatedVictims: Number(estimatedVictims) || 0,
      needsBoat: Boolean(needsBoat),
      hasBedriddenOrElderly: Boolean(hasBedriddenOrElderly),
      images: Array.isArray(images) ? images : [],
      aiTriage: aiTriageResult
    });

    // 3. Trigger Line OA Alert simulation/push
    const lineResult = await sendLineOaAlert(created);
    if (lineResult.success) {
      incidentStore.recordLineAlert(created.id, {
        targetGroup: 'ศูนย์สั่งการ Line OA สระแก้ว',
        messageSummary: `🚨 [${created.priority}] ${created.title} (อ.${created.district})`
      });
    }

    res.status(201).json({
      success: true,
      message: 'รับแจ้งเหตุเข้าระบบกลางจังหวัดสระแก้วเรียบร้อยแล้ว',
      data: created,
      lineAlert: lineResult
    });
  } catch (error: unknown) {
    console.error('Error creating incident:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการรับแจ้งเหตุ'
    });
  }
});

// 4. Update incident status / details
apiRouter.patch('/incidents/:id', (req: Request, res: Response) => {
  const { status, assignedOfficer, priority, updaterName, updateNote } = req.body;
  const updated = incidentStore.update(
    req.params.id,
    {
      ...(status && { status }),
      ...(assignedOfficer !== undefined && { assignedOfficer }),
      ...(priority && { priority })
    },
    updaterName,
    updateNote
  );

  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์' });
    return;
  }

  res.json({ success: true, data: updated });
});

// 5. Dispatch emergency units
apiRouter.post('/incidents/:id/dispatch', async (req: Request, res: Response) => {
  const { name, agency, vehicleType, contactNumber, personnelCount, updaterName } = req.body;

  if (!name || !agency) {
    res.status(400).json({ success: false, message: 'กรุณาระบุชื่อชุดปฏิบัติการและหน่วยงาน' });
    return;
  }

  const updated = incidentStore.addDispatchUnit(
    req.params.id,
    {
      name,
      agency,
      vehicleType: vehicleType || 'รถกู้ภัยเคลื่อนที่เร็ว',
      contactNumber: contactNumber || '191 / 1669',
      status: 'en_route',
      personnelCount: Number(personnelCount) || 2
    },
    updaterName
  );

  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์' });
    return;
  }

  // Trigger dispatch notification via Line
  await sendLineOaAlert(updated);

  res.json({
    success: true,
    message: `สั่งการส่งกำลังพล ${name} เข้าพื้นที่เรียบร้อยแล้ว`,
    data: updated
  });
});

// 6. Re-analyze with AI
apiRouter.post('/incidents/:id/ai-reanalyze', async (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์' });
    return;
  }

  const aiTriageResult = await analyzeIncidentWithAI({
    title: incident.title,
    description: incident.description,
    category: incident.category,
    district: incident.district,
    landmark: incident.landmark,
    estimatedVictims: incident.estimatedVictims
  });

  const updated = incidentStore.update(
    incident.id,
    {
      aiTriage: aiTriageResult,
      priority: aiTriageResult.priority
    },
    'AI Triage Engine (Gemini 3.8)',
    `AI ประเมินความเร่งด่วนใหม่เป็นระดับ ${aiTriageResult.priority} (คะแนนวิกฤต ${aiTriageResult.urgencyScore}/100)`
  );

  res.json({
    success: true,
    message: 'AI วิเคราะห์จัดลำดับความเร่งด่วนใหม่เรียบร้อยแล้ว',
    data: updated
  });
});

// 7. Send manual Line OA alert
apiRouter.post('/incidents/:id/line-alert', async (req: Request, res: Response) => {
  const incident = incidentStore.getById(req.params.id);
  if (!incident) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์' });
    return;
  }

  const { targetGroup, token } = req.body;
  const result = await sendLineOaAlert(incident, token);

  incidentStore.recordLineAlert(incident.id, {
    targetGroup: targetGroup || 'กลุ่มวิทยุสื่อสารและกู้ภัย Line OA',
    messageSummary: `🚨 [${incident.priority}] ${incident.title} (ส่งแจ้งเตือนซ้ำโดยเจ้าหน้าที่)`
  });

  res.json({
    success: result.success,
    message: result.message,
    payload: result.payload
  });
});

// 7.1 Record Incident Review & Verification
apiRouter.post('/incidents/:id/review', (req: Request, res: Response) => {
  const {
    decision,
    decisionLabel,
    reviewedBy,
    reviewerAgency,
    notes,
    contactConfirmed,
    locationConfirmed,
    vulnerableConfirmed,
    boatNeedConfirmed,
    previousPriority,
    newPriority
  } = req.body;

  if (!decision || !notes) {
    res.status(400).json({
      success: false,
      message: 'กรุณาระบุผลการรีวิวและบันทึกข้อคิดเห็นของเจ้าหน้าที่'
    });
    return;
  }

  const updated = incidentStore.addReview(req.params.id, {
    decision,
    decisionLabel: decisionLabel || decision,
    reviewedBy: reviewedBy || 'เจ้าหน้าที่ศูนย์ ปภ.สระแก้ว',
    reviewerAgency: reviewerAgency || 'สำนักงาน ปภ. จังหวัดสระแก้ว',
    notes,
    contactConfirmed: Boolean(contactConfirmed),
    locationConfirmed: Boolean(locationConfirmed),
    vulnerableConfirmed: Boolean(vulnerableConfirmed),
    boatNeedConfirmed: Boolean(boatNeedConfirmed),
    previousPriority,
    newPriority
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์ที่ระบุ' });
    return;
  }

  res.json({
    success: true,
    message: 'บันทึกผลการรีวิวและตรวจสอบเหตุเรียบร้อยแล้ว',
    data: updated
  });
});

// 7.2 Post-rescue review / operation closing
apiRouter.post('/incidents/:id/post-rescue-review', (req: Request, res: Response) => {
  const {
    actualEvacuatedCount,
    reliefPacksDistributed,
    operationStatus,
    operationSummary,
    reviewedBy,
    reviewerAgency,
    followUpRequired
  } = req.body;

  const updated = incidentStore.updatePostRescueReview(req.params.id, {
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewedBy || 'หัวหน้าชุดกู้ภัย/ปภ.',
    reviewerAgency: reviewerAgency || 'ศูนย์สั่งการอุทกภัยสระแก้ว',
    actualEvacuatedCount: Number(actualEvacuatedCount) || 0,
    reliefPacksDistributed: Number(reliefPacksDistributed) || 0,
    operationStatus: operationStatus || 'SUCCESS',
    operationSummary: operationSummary || 'ภารกิจช่วยเหลือและอพยพเสร็จสิ้นเรียบร้อย',
    followUpRequired: Boolean(followUpRequired)
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเหตุการณ์ที่ระบุ' });
    return;
  }

  res.json({
    success: true,
    message: 'บันทึกผลรีวิวการช่วยเหลือและปิดเคสเรียบร้อยแล้ว',
    data: updated
  });
});

// 8. Statistics
apiRouter.get('/stats', (_req: Request, res: Response) => {
  const stats = incidentStore.getStats();
  res.json({ success: true, data: stats });
});

// 9. Districts
apiRouter.get('/districts', (_req: Request, res: Response) => {
  res.json({ success: true, data: SA_KAEO_DISTRICTS });
});

// === UNLIMITED OFFICER / RESCUE PERSONNEL MANAGEMENT API ===

// 10. Get all officers (with search and filters)
apiRouter.get('/officers', (req: Request, res: Response) => {
  const { district, status, agency, search } = req.query;
  const officers = incidentStore.getAllOfficers({
    district: typeof district === 'string' ? district : undefined,
    status: typeof status === 'string' ? status : undefined,
    agency: typeof agency === 'string' ? agency : undefined,
    search: typeof search === 'string' ? search : undefined
  });

  res.json({
    success: true,
    count: officers.length,
    data: officers
  });
});

// 11. Get single officer
apiRouter.get('/officers/:id', (req: Request, res: Response) => {
  const officer = incidentStore.getOfficerById(req.params.id);
  if (!officer) {
    res.status(404).json({ success: false, message: 'ไม่พบข้อมูลเจ้าหน้าที่' });
    return;
  }
  res.json({ success: true, data: officer });
});

// 12. Create new officer (Unlimited)
apiRouter.post('/officers', (req: Request, res: Response) => {
  try {
    const { name, phone, role, roleLabel, agency, badgeNumber, callSign, district, skills, status } = req.body;

    if (!name || !phone || !agency) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น: ชื่อ-นามสกุล, เบอร์โทรศัพท์, และสังกัดหน่วยงาน'
      });
      return;
    }

    const created = incidentStore.createOfficer({
      name: name.trim(),
      phone: phone.trim(),
      role: role || 'officer',
      roleLabel: roleLabel || 'เจ้าหน้าที่ปฏิบัติการกู้ภัย',
      agency: agency.trim(),
      badgeNumber: badgeNumber?.trim() || `SK-${Math.floor(1000 + Math.random() * 9000)}`,
      callSign: callSign?.trim() || undefined,
      district: district || 'ทุกอำเภอ (ส่วนกลาง)',
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      status: status || 'on_duty'
    });

    res.status(201).json({
      success: true,
      message: `เพิ่มเจ้าหน้าที่ ${created.name} เข้าระบบศูนย์อุทกภัยสระแก้วเรียบร้อยแล้ว`,
      data: created
    });
  } catch (err: unknown) {
    console.error('Error creating officer:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูลเจ้าหน้าที่'
    });
  }
});

// 13. Update officer details
apiRouter.patch('/officers/:id', (req: Request, res: Response) => {
  const updated = incidentStore.updateOfficer(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเจ้าหน้าที่ที่ต้องการแก้ไข' });
    return;
  }

  res.json({
    success: true,
    message: `อัปเดตข้อมูลเจ้าหน้าที่ ${updated.name} เรียบร้อยแล้ว`,
    data: updated
  });
});

// 14. Toggle officer duty status
apiRouter.post('/officers/:id/toggle-duty', (req: Request, res: Response) => {
  const updated = incidentStore.toggleOfficerDuty(req.params.id);
  if (!updated) {
    res.status(404).json({ success: false, message: 'ไม่พบเจ้าหน้าที่' });
    return;
  }

  res.json({
    success: true,
    message: `เปลี่ยนสถานะเวรปฏิบัติการของ ${updated.name} เป็น ${updated.status}`,
    data: updated
  });
});

// 15. Delete officer
apiRouter.delete('/officers/:id', (req: Request, res: Response) => {
  const success = incidentStore.deleteOfficer(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'ไม่พบเจ้าหน้าที่ที่ต้องการลบ' });
    return;
  }

  res.json({
    success: true,
    message: 'ลบเจ้าหน้าที่ออกจากระบบเรียบร้อยแล้ว'
  });
});

// 16. Batch delete officers
apiRouter.post('/officers/batch-delete', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ success: false, message: 'กรุณาระบุรหัสเจ้าหน้าที่ที่ต้องการลบ' });
    return;
  }

  const deletedCount = incidentStore.deleteOfficers(ids);
  res.json({
    success: true,
    message: `ลบเจ้าหน้าที่จำนวน ${deletedCount} นายออกจากระบบเรียบร้อยแล้ว`,
    deletedCount
  });
});
