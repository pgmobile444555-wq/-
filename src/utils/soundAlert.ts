// Singleton Web Audio Context for reliable emergency alarms across all mobile & desktop browsers
let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }

  // Attempt resume if suspended
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Browser autoplay policy might hold it until user gestures
    });
  }

  return sharedAudioCtx;
}

// Pre-unlock on first user tap/click to conform with mobile browser autoplay policy
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {});
    } else if (ctx) {
      isAudioUnlocked = true;
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Synthesizes a clean, high-priority emergency audio alert (Dual-tone siren 880Hz -> 660Hz)
 */
export const playEmergencyAlertTone = () => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Two-tone emergency chime: 880Hz (A5) -> 660Hz (E5)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(880, now + 0.15);
    osc.frequency.setValueAtTime(660, now + 0.25);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (err) {
    console.warn('Unable to play audio alert:', err);
  }
};
