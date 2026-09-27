import { Incident } from '../types/incident';

export interface LineFlexMessage {
  type: 'flex';
  altText: string;
  contents: Record<string, unknown>;
}

export function buildIncidentFlexMessage(incident: Incident): LineFlexMessage {
  const priorityColors = {
    P1: '#EF4444',
    P2: '#F97316',
    P3: '#EAB308',
    P4: '#0284C7'
  };

  const headerColor = priorityColors[incident.priority] || '#EF4444';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`;

  return {
    type: 'flex',
    altText: `🌊 แจ้งเตือนอุทกภัยฉุกเฉิน [${incident.priority}] ${incident.title} (อ.${incident.district})`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: headerColor,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: `🌊 ศูนย์เตือนภัยน้ำท่วมสระแก้ว (${incident.code})`,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'sm'
          },
          {
            type: 'text',
            text: `ระดับความเร่งด่วน: ${incident.priority} (${incident.aiTriage?.priorityLabel || 'อุทกภัย'})`,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'md',
            wrap: true,
            margin: 'xs'
          },
          {
            type: 'text',
            text: `คะแนนความวิกฤต AI: ${incident.aiTriage?.urgencyScore || 85}/100 · ${incident.waterLevelText || 'ระดับน้ำท่วมขัง'}`,
            color: '#FEF08A',
            size: 'xs',
            margin: 'xs'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: incident.title,
            weight: 'bold',
            size: 'md',
            wrap: true,
            color: '#1E293B'
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: '📍 พื้นที่:', color: '#64748B', size: 'xs', flex: 2 },
                  { type: 'text', text: `อ.${incident.district} (${incident.landmark || 'ไม่ระบุ'})`, color: '#0F172A', size: 'xs', flex: 6, wrap: true }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: '👤 ผู้แจ้ง:', color: '#64748B', size: 'xs', flex: 2 },
                  { type: 'text', text: `${incident.reporterName} (โทร ${incident.reporterPhone})`, color: '#0F172A', size: 'xs', flex: 6 }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: '🚤 เรือกู้ภัย:', color: '#64748B', size: 'xs', flex: 2 },
                  { type: 'text', text: incident.needsBoat ? '🚨 ต้องการเรือท้องแบนด่วน' : 'รถยกสูงเข้าถึงได้', color: incident.needsBoat ? '#DC2626' : '#0F172A', size: 'xs', flex: 6, weight: incident.needsBoat ? 'bold' : 'regular' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { type: 'text', text: '👥 ผู้ติดค้าง:', color: '#64748B', size: 'xs', flex: 2 },
                  { type: 'text', text: `${incident.estimatedVictims > 0 ? `${incident.estimatedVictims} คน` : 'ไม่มี/ไม่ระบุ'}${incident.hasBedriddenOrElderly ? ' (มีผู้ป่วยติดเตียง/คนชรา)' : ''}`, color: incident.hasBedriddenOrElderly ? '#DC2626' : '#0F172A', size: 'xs', flex: 6 }
                ]
              }
            ]
          },
          {
            type: 'separator',
            margin: 'md',
            color: '#E2E8F0'
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            contents: [
              {
                type: 'text',
                text: '🤖 สรุปคัดกรองเบื้องต้นโดย AI (Gemini 3.8):',
                weight: 'bold',
                size: 'xs',
                color: '#0369A1'
              },
              {
                type: 'text',
                text: incident.aiTriage?.summary || incident.description,
                size: 'xs',
                color: '#334155',
                wrap: true
              },
              {
                type: 'text',
                text: `หน่วยงานแนะนำ: ${incident.aiTriage?.recommendedAgencies?.slice(0, 2).join(', ') || 'กู้ภัยสว่างสระแก้ว (เรือท้องแบน)'}`,
                size: 'xxs',
                color: '#2563EB',
                wrap: true
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0284C7',
            action: {
              type: 'uri',
              label: '📍 นำทาง GPS ไปจุดรับผู้ประสบภัย',
              uri: mapsUrl
            }
          },
          {
            type: 'button',
            style: 'secondary',
            action: {
              type: 'uri',
              label: `📞 โทรหาผู้ประสบภัย (${incident.reporterPhone})`,
              uri: `tel:${incident.reporterPhone}`
            }
          }
        ]
      }
    }
  };
}

export async function sendLineOaAlert(incident: Incident, customChannelToken?: string): Promise<{ success: boolean; message: string; payload: LineFlexMessage }> {
  const flexMessage = buildIncidentFlexMessage(incident);
  const token = customChannelToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (token) {
    try {
      const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [flexMessage]
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'ส่งการแจ้งเตือน Line Messaging API สู่ศูนย์ช่วยเหลืออุทกภัยสำเร็จแล้ว',
          payload: flexMessage
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Line API Error: ${errorText}`,
          payload: flexMessage
        };
      }
    } catch (err: unknown) {
      return {
        success: false,
        message: `Line Connection failed: ${err instanceof Error ? err.message : String(err)}`,
        payload: flexMessage
      };
    }
  }

  // Simulated notification success
  return {
    success: true,
    message: 'จำลองการส่งการแจ้งเตือน Line OA อุทกภัยสำเร็จ (แสดงผลในระบบเจ้าหน้าที่)',
    payload: flexMessage
  };
}
