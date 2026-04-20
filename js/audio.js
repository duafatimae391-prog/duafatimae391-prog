/* ═══════════════════════════════════════════════════════════
   audio.js — Procedural Web Audio API sounds & music
   ═══════════════════════════════════════════════════════════ */

'use strict';

const Audio = (() => {
  let ctx = null;
  let musicNode = null;
  let musicGain = null;
  let sfxGain = null;
  let _enabled = true;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        sfxGain   = ctx.createGain(); sfxGain.gain.value   = 0.5; sfxGain.connect(ctx.destination);
        musicGain = ctx.createGain(); musicGain.gain.value = 0.18; musicGain.connect(ctx.destination);
      } catch (_) { /* no audio support */ }
    }
    return ctx;
  }

  function resume() {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  // ── SFX helpers ──────────────────────────────────────────

  function tone(freq, dur, type = 'sine', vol = 0.4, start = 0) {
    const c = getCtx();
    if (!c || !_enabled) return;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    env.gain.setValueAtTime(vol, c.currentTime + start);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    osc.connect(env); env.connect(sfxGain);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.01);
  }

  function noise(dur, vol = 0.15, freq = 800, q = 1, start = 0) {
    const c = getCtx();
    if (!c || !_enabled) return;
    const buf  = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src    = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const env    = c.createGain();
    src.buffer = buf;
    filter.type = 'bandpass'; filter.frequency.value = freq; filter.Q.value = q;
    env.gain.setValueAtTime(vol, c.currentTime + start);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
    src.connect(filter); filter.connect(env); env.connect(sfxGain);
    src.start(c.currentTime + start);
  }

  // ── Public sounds ─────────────────────────────────────────

  const SFX = {
    shoot() {
      resume();
      noise(0.08, 0.2, 1200, 4);
      tone(400, 0.06, 'sawtooth', 0.1);
    },

    pop(comboCount = 1) {
      resume();
      const pitches = [523, 659, 784, 1047, 1319];
      const idx     = Math.min(comboCount - 1, pitches.length - 1);
      tone(pitches[idx], 0.12, 'square', 0.3);
      tone(pitches[idx] * 1.5, 0.08, 'sine', 0.15, 0.03);
    },

    combo(count) {
      resume();
      const base = 261;
      for (let i = 0; i < Math.min(count, 6); i++) {
        tone(base * Math.pow(2, i / 6), 0.1, 'sine', 0.25, i * 0.06);
      }
    },

    drop() {
      resume();
      tone(200, 0.15, 'triangle', 0.2);
      tone(150, 0.1, 'triangle', 0.1, 0.05);
    },

    coin() {
      resume();
      tone(1046, 0.06, 'square', 0.25);
      tone(1318, 0.06, 'square', 0.25, 0.07);
    },

    loseLife() {
      resume();
      tone(330, 0.15, 'sawtooth', 0.3);
      tone(220, 0.2, 'sawtooth', 0.3, 0.1);
      tone(165, 0.25, 'sawtooth', 0.25, 0.25);
    },

    win() {
      resume();
      const melody = [523,659,784,1047,784,659,1047,1319];
      melody.forEach((f, i) => tone(f, 0.12, 'square', 0.25, i * 0.1));
    },

    gameOver() {
      resume();
      [392,330,261,196].forEach((f, i) => tone(f, 0.2, 'sawtooth', 0.3, i * 0.18));
    },

    levelUp() {
      resume();
      [523,659,784,1047,1319,1568].forEach((f, i) => tone(f, 0.1, 'triangle', 0.3, i * 0.08));
    },

    powerup() {
      resume();
      [659,784,1047,1319].forEach((f, i) => tone(f, 0.09, 'square', 0.2, i * 0.07));
    },

    click() {
      resume();
      tone(600, 0.05, 'sine', 0.2);
    },

    freeze() {
      resume();
      for (let i = 0; i < 8; i++) {
        tone(800 + i * 80, 0.07, 'triangle', 0.15, i * 0.04);
      }
    },
  };

  // ── Background music (simple looping procedural melody) ──

  let musicTimer = null;

  const NOTES = {
    C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2,
    G4: 392.0, A4: 440.0, B4: 493.9,
    C5: 523.3, D5: 587.3, E5: 659.3, G5: 784.0,
  };

  const MELODY = [
    { n: NOTES.C4, d: 0.25 }, { n: NOTES.E4, d: 0.25 }, { n: NOTES.G4, d: 0.25 },
    { n: NOTES.C5, d: 0.5  }, { n: NOTES.B4, d: 0.25 }, { n: NOTES.G4, d: 0.25 },
    { n: NOTES.A4, d: 0.25 }, { n: NOTES.F4, d: 0.25 }, { n: NOTES.E4, d: 0.5 },
    { n: NOTES.D4, d: 0.25 }, { n: NOTES.E4, d: 0.25 }, { n: NOTES.C4, d: 0.5 },
  ];

  const BASS = [
    { n: NOTES.C4 / 2, d: 0.5 }, { n: NOTES.G4 / 2, d: 0.5 },
    { n: NOTES.A4 / 2, d: 0.5 }, { n: NOTES.F4 / 2, d: 0.5 },
  ];

  function scheduleMelody(noteIndex = 0) {
    const c = getCtx();
    if (!c || !_enabled || !_musicPlaying) return;
    const { n, d } = MELODY[noteIndex % MELODY.length];
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = n;
    env.gain.setValueAtTime(0.001, c.currentTime);
    env.gain.linearRampToValueAtTime(0.6, c.currentTime + 0.02);
    env.gain.setValueAtTime(0.6, c.currentTime + d * 0.6);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d * 0.95);
    osc.connect(env); env.connect(musicGain);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + d);
    musicTimer = setTimeout(() => scheduleMelody(noteIndex + 1), d * 1000);
  }

  let _musicPlaying = false;

  function startMusic() {
    if (_musicPlaying) return;
    _musicPlaying = true;
    resume();
    scheduleMelody(0);
  }

  function stopMusic() {
    _musicPlaying = false;
    clearTimeout(musicTimer);
  }

  // ── Public API ────────────────────────────────────────────

  return {
    sfx: SFX,
    startMusic,
    stopMusic,

    setEnabled(val) {
      _enabled = val;
      if (!val) stopMusic();
      else startMusic();
    },

    get enabled() { return _enabled; },
    get musicPlaying() { return _musicPlaying; },

    resumeCtx: resume,
  };
})();
