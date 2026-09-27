import React, { useEffect, useState } from 'react';
import { buildIncidentFlexMessage } from '../server/lineOaDispatcher';
import { Incident } from '../types/incident';
import { 
  Radio, 
  Send, 
  Check, 
  Copy, 
  Navigation, 
  Settings, 
  Smartphone, 
  Waves, 
  Phone,
  X
} from 'lucide-react';

interface LineOaSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
}

export const LineOaSimulatorModal: React.FC<LineOaSimulatorModalProps> = ({
  isOpen,
  onClose,
  incident
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json' | 'config'>('preview');
  const [customToken, setCustomToken] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !incident) return null;

  const flexMessage = buildIncidentFlexMessage(incident);

  const priorityColor = 
    incident.priority === 'P1' ? 'bg-red-600' :
    incident.priority === 'P2' ? 'bg-orange-500' :
    incident.priority === 'P3' ? 'bg-amber-500' : 'bg-blue-600';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(flexMessage, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLiveTest = async () => {
    setSendingTest(true);
    setSendResult(null);
    try {
      const response = await fetch(`/api/incidents/${incident.id}/line-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken.trim() || undefined,
          targetGroup: `กลุ่ม Line OA เจ้าหน้าที่กู้ภัยทางน้ำและ ปภ. อ.${incident.district}`
        })
      });
      const data = await response.json();
      setSendResult(data.message || (data.success ? 'ส่งแจ้งเตือนสำเร็จ' : 'ส่งไม่สำเร็จ'));
    } catch (err: unknown) {
      setSendResult(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in duration-150">
        
        {/* Header - Clean Standard Design */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">สระแก้วช่วยด้วย | จำลองแจ้งเตือน Line OA</h3>
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[10px] rounded font-medium">สระแก้ว</span>
              </div>
              <p className="text-[11px] text-slate-400">ระบบส่งข้อความแจ้งเตือนด่วนเข้า Line OA หน่วยกู้ภัยทางน้ำและ ปภ.</p>
            </div>
          </div>

          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>ปิดหน้าต่าง</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-3 font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            จำลองหน้าจอสมาร์ทโฟน
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2.5 px-3 font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Line Flex Message JSON
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 px-3 font-medium border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            ตั้งค่า Line Token จริง
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 text-center bg-slate-950 py-2 px-3 rounded-lg border border-slate-800">
                ตัวอย่างแจ้งเตือน Flex Message ที่ทีมเรือกู้ภัยสว่างสระแก้วและ ปภ. อ.{incident.district} จะได้รับ:
              </div>

              {/* Smartphone Frame Mockup */}
              <div className="max-w-sm mx-auto bg-slate-700 rounded-2xl p-2.5 shadow-lg border border-slate-650">
                {/* Chat Top Bar */}
                <div className="bg-slate-850 text-white px-3 py-2 rounded-t-xl flex items-center gap-2 mb-2.5 border-b border-slate-750">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold">
                    ปภ
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">ปภ.สระแก้ว ศูนย์เตือนภัยน้ำท่วม</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> พร้อมสั่งการเรือกู้ภัย 24 ชม.
                    </div>
                  </div>
                </div>

                {/* Line Flex Message Bubble */}
                <div className="bg-white rounded-xl shadow overflow-hidden text-slate-900 font-sans">
                  {/* Bubble Header */}
                  <div className={`${priorityColor} text-white p-3`}>
                    <div className="text-[11px] font-bold tracking-wide uppercase opacity-90 flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5" />
                      แจ้งเตือนอุทกภัยฉุกเฉิน ({incident.code})
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      ระดับความเร่งด่วน: {incident.priority} ({incident.aiTriage?.priorityLabel || 'อุทกภัย'})
                    </div>
                    <div className="text-[11px] font-medium text-amber-100 mt-0.5 flex items-center gap-1">
                      ระดับน้ำ: {incident.waterLevelText || 'น้ำท่วมสูง'} · คะแนนวิกฤต: {incident.aiTriage?.urgencyScore || 85}/100
                    </div>
                  </div>

                  {/* Bubble Body */}
                  <div className="p-3 space-y-2 text-xs">
                    <div className="font-bold text-xs text-slate-900 leading-snug">
                      {incident.title}
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>📍 <strong>พื้นที่:</strong> อ.{incident.district} ({incident.landmark || 'ไม่ระบุ'})</div>
                      <div>👤 <strong>ผู้แจ้งเหตุ:</strong> {incident.reporterName} (โทร {incident.reporterPhone})</div>
                      <div>🚤 <strong>ความต้องการเรือ:</strong> {incident.needsBoat ? <span className="text-red-600 font-bold">ต้องการเรือท้องแบนด่วน</span> : 'รถยกสูงเข้าถึงได้'}</div>
                      <div>👥 <strong>จำนวนคนติดค้าง:</strong> {incident.estimatedVictims} คน {incident.hasBedriddenOrElderly ? '<b class="text-red-600">(มีผู้ป่วยติดเตียง)</b>' : ''}</div>
                    </div>

                    {/* AI / Triage Summary */}
                    <div className="p-2 bg-blue-50/60 border border-blue-100 rounded-lg text-[11px] text-slate-800">
                      <div className="font-semibold text-blue-800 mb-0.5">
                        สรุปการประเมินสถานการณ์:
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug">
                        {incident.aiTriage?.summary || incident.description}
                      </p>
                      <div className="text-[10px] text-blue-900 font-medium mt-1">
                        หน่วยปฏิบัติการ: {incident.aiTriage?.recommendedAgencies?.slice(0, 2).join(', ') || 'ชุดกู้ภัยทางน้ำสว่างสระแก้ว / ปภ.สระแก้ว'}
                      </div>
                    </div>
                  </div>

                  {/* Bubble Footer Action Buttons */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 space-y-1.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>นำทาง GPS ไปจุดรับผู้ประสบภัย</span>
                    </a>
                    <a
                      href={`tel:${incident.reporterPhone}`}
                      className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>โทรหาผู้ประสบภัย ({incident.reporterPhone})</span>
                    </a>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-300 mt-2">
                  ส่งโดย ศูนย์บัญชาการเหตุการณ์อุทกภัย จังหวัดสระแก้ว
                </div>
              </div>

              {/* Quick dispatch alert button */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleSendLiveTest}
                  disabled={sendingTest}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingTest ? 'กำลังส่งแจ้งเตือน...' : 'กดส่งแจ้งเตือน Line OA ทดสอบ'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ปิดหน้าต่าง</span>
                </button>
              </div>

              {sendResult && (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-xs text-emerald-400 font-medium">
                  {sendResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  โครงสร้าง Line Flex Message อุทกภัย:
                </span>
                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 max-h-80 overflow-y-auto">
                {JSON.stringify(flexMessage, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                เชื่อมต่อกับ <strong>Line Messaging API Channel Access Token</strong> ของหน่วยงานบรรเทาอุทกภัยในสระแก้ว (ปภ.สระแก้ว / กู้ภัยสว่างสระแก้ว):
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  LINE Channel Access Token:
                </label>
                <input
                  type="password"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="วาง Long-lived Channel Access Token ที่ได้จาก LINE Developers..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-slate-400 text-[11px]">
                <div className="font-semibold text-white text-xs">คุณสมบัติระบบแจ้งเตือน Line OA อุทกภัย:</div>
                <div>• แจ้งเตือนระดับความลึกของน้ำท่วมและสถานะความต้องการเรือท้องแบน</div>
                <div>• ลิงก์นำทาง GPS ไปยังจุดรับผู้ประสบภัยโดยตรง</div>
                <div>• ระบุผู้ป่วยติดเตียงและกลุ่มเปราะบางเพื่อเตรียมทีมแพทย์กู้ชีพ</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Persistent Bar with Dedicated Close Button */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-750 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            กดปุ่ม <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300 font-mono">Esc</kbd> หรือคลิกนอกกรอบเพื่อปิดหน้าต่าง
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>ปิดหน้าต่าง</span>
          </button>
        </div>

      </div>
    </div>
  );
};
