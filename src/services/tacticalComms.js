// src/services/tacticalComms.js
// Tactical Inter-Officer Radio Chatbox and WhatsApp-Style Audio Calling Engine

import { ONBOARDED_OFFICERS, getOfficerById } from './securityUnits';

export const RADIO_CHANNELS = [
  { id: 'all-units', name: '📢 All-Units Main Dispatch', code: 'CH-01 / 144.800', badgeColor: 'bg-emerald-500' },
  { id: 'npf-tactical', name: '👮‍♂️ NPF Tactical Grid', code: 'CH-02 / 144.825', badgeColor: 'bg-blue-500' },
  { id: 'sosafe-patrol', name: '🚨 So-Safe Sector Net', code: 'CH-03 / 145.100', badgeColor: 'bg-teal-500' },
  { id: 'palace-guards', name: '🛡️ Palace & Town Marshals', code: 'CH-04 / 144.900', badgeColor: 'bg-amber-500' },
  { id: 'expressway-frsc', name: '🚑 Expressway Corridor Net', code: 'CH-05 / 145.350', badgeColor: 'bg-orange-500' }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg-01',
    channel: 'all-units',
    senderId: 'off-001',
    senderName: 'Insp. Babatunde Alabi',
    senderBadge: 'NPF-8842',
    senderRank: 'Inspector',
    senderAgency: 'Nigeria Police Force',
    callsign: 'EAGLE-1',
    radioCode: '10-41 (In Service)',
    text: 'All units, morning patrol muster complete. Tollgate flyover & KM67 corridor active.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    avatar: '👮‍♂️'
  },
  {
    id: 'msg-02',
    channel: 'all-units',
    senderId: 'off-004',
    senderName: 'Commander Yemi Solaja',
    senderBadge: 'SOS-302',
    senderRank: 'Commander',
    senderAgency: 'So-Safe Corps',
    callsign: 'PANTHER-1',
    radioCode: '10-8 (In Service)',
    text: 'So-Safe Unit 2 stationed at Isale-Ogere market link. Grid clear.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    avatar: '🚨'
  },
  {
    id: 'msg-03',
    channel: 'all-units',
    senderId: 'off-003',
    senderName: 'Chief Hunter Rasheed Adeleke',
    senderBadge: 'PAL-007',
    senderRank: 'High Chief Marshal',
    senderAgency: 'Palace Security',
    callsign: 'OLOGERE-LEAD',
    radioCode: '10-20 (Location)',
    text: 'Palace marshals standing by at Town Hall junction for evening market rush.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    avatar: '🛡️'
  }
];

export function getTacticalMessages(channel = 'all-units') {
  try {
    const stored = localStorage.getItem('ogere_tactical_messages');
    let messages = stored ? JSON.parse(stored) : INITIAL_MESSAGES;
    if (channel && channel !== 'all-units') {
      return messages.filter(m => m.channel === channel || m.channel === 'all-units');
    }
    return messages;
  } catch (e) {
    return INITIAL_MESSAGES;
  }
}

export function sendTacticalMessage({
  channel = 'all-units',
  senderId = 'off-001',
  text,
  radioCode = '10-4'
}) {
  const officer = getOfficerById(senderId);
  const newMsg = {
    id: `msg-${Date.now()}`,
    channel,
    senderId: officer.id,
    senderName: officer.name,
    senderBadge: officer.badge,
    senderRank: officer.rank,
    senderAgency: officer.agency,
    callsign: officer.callsign,
    radioCode,
    text,
    timestamp: new Date().toISOString(),
    avatar: officer.avatar
  };

  try {
    const current = getTacticalMessages();
    const updated = [...current, newMsg];
    localStorage.setItem('ogere_tactical_messages', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store tactical message', e);
  }

  // Play radio squelch tone
  playRadioSquelchSound();

  // Broadcast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ogere-tactical-msg', { detail: newMsg }));
  }

  return newMsg;
}

/**
 * Web Audio API Sound Synthesizer (No external mp3 needed)
 */
let audioCtx = null;
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// WhatsApp-like Calling Ringtone generator
let ringInterval = null;
export function startOutgoingRingtone() {
  stopRingtone();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playTone = () => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {}
  };

  playTone();
  ringInterval = setInterval(playTone, 2500);
}

export function stopRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}

// Call Connected Chime
export function playCallConnectedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (_) {}
}

// Call End / Hangup Tone
export function playCallEndSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(280, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (_) {}
}

// Tactical Radio Roger Beep / Squelch
export function playRadioSquelchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1760, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (_) {}
}
