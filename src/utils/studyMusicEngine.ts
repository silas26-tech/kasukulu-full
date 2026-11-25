export type StudyTrackId =
  | "victoria-dawn"
  | "kopala-drive"
  | "distinction-anthem"
  | "luangwa-sunshine"
  | "zambezi-lofi"
  | "library-kalimba"
  | "night-rain"
  | "still-water"
  | "quiet-piano"
  | "music-box"
  | "evening-glow";

export type TrackMood = "encouraging" | "focus" | "calm";

export interface StudyTrackInfo {
  id: StudyTrackId;
  name: string;
  subtitle: string;
  mood: TrackMood;
}

export const STUDY_TRACKS: StudyTrackInfo[] = [
  {
    id: "victoria-dawn",
    name: "Victoria Falls Dawn",
    subtitle: "Uplifting morning marimba & sunrise optimism",
    mood: "encouraging",
  },
  {
    id: "kopala-drive",
    name: "Kopala Focus Drive",
    subtitle: "Motivating Copperbelt groove & energetic study pulse",
    mood: "encouraging",
  },
  {
    id: "distinction-anthem",
    name: "Distinction Anthem",
    subtitle: "Inspiring triumph chords & celebratory confidence",
    mood: "encouraging",
  },
  {
    id: "luangwa-sunshine",
    name: "Luangwa Sunshine",
    subtitle: "Joyful thumb piano & warm acoustic sunshine",
    mood: "encouraging",
  },
  {
    id: "zambezi-lofi",
    name: "Zambezi Lo-Fi",
    subtitle: "Warm electric keys & soft river breeze",
    mood: "focus",
  },
  {
    id: "library-kalimba",
    name: "Library Kalimba",
    subtitle: "Gentle wooden plucks & deep pad",
    mood: "calm",
  },
  {
    id: "night-rain",
    name: "Night Revision Rain",
    subtitle: "Soft rainfall & calm harmonic swell",
    mood: "calm",
  },
  {
    id: "still-water",
    name: "Still Water",
    subtitle: "Very quiet, slow soft pads. No noise, no beat",
    mood: "calm",
  },
  {
    id: "quiet-piano",
    name: "Quiet Piano",
    subtitle: "A few soft piano-like notes. Easy on the mind",
    mood: "calm",
  },
  {
    id: "music-box",
    name: "Music Box",
    subtitle: "Tiny, gentle bell notes. Peaceful and clear",
    mood: "calm",
  },
  {
    id: "evening-glow",
    name: "Evening Glow",
    subtitle: "Warm, slow and soft. Good for long revision",
    mood: "focus",
  },
];

// -------------------------------------------------------------
// Musical Chords & Melodies (MIDI numbers)
// -------------------------------------------------------------

// 1. Victoria Falls Dawn: Gmaj9 -> D6/F# -> Cadd9 -> Em7 (Uplifting & Bright)
const VICTORIA_CHORDS: number[][] = [
  [43, 50, 55, 59, 62], // Gmaj9 (G2, D3, G3, B3, D4)
  [42, 49, 54, 59, 62], // D6/F# (F#2, C#3, F#3, B3, D4)
  [48, 52, 55, 59, 62], // Cadd9 (C3, E3, G3, B3, D4)
  [40, 47, 52, 55, 59], // Em7 (E2, B2, E3, G3, B3)
];

const VICTORIA_MARIMBA_MELODY: Array<number | null> = [
  71, 74, 76, 79, null, 81, 79, 76, // B4, D5, E5, G5, A5, G5, E5
  74, 76, 79, 81, 83, null, 81, 79, // Climbing up to B5!
  76, 79, 81, 83, null, 86, 83, 81, // Climbing higher to D6
  79, 81, 83, 79, 76, 74, 71, 74,
];

// 2. Kopala Focus Drive: Am9 -> D9 -> Fmaj7 -> Gsus4 (Energetic & Motivating)
const KOPALA_CHORDS: number[][] = [
  [45, 52, 55, 60, 64], // Am9
  [50, 54, 57, 60, 64], // D9
  [41, 48, 52, 57, 60], // Fmaj7
  [43, 50, 55, 60, 62], // Gsus4
];

const KOPALA_BASS_LINE: number[] = [
  33, 33, 40, 45, // A1, E2, A2
  38, 38, 45, 50, // D2, A2, D3
  29, 29, 36, 41, // F1, C2, F2
  31, 31, 38, 43, // G1, D2, G2
];

const KOPALA_GROOVE_STABS: Array<number[] | null> = [
  [60, 64, 67], null, [60, 64, 69], null,
  [62, 66, 69], null, [62, 66, 71], null,
  [60, 64, 67], null, [57, 60, 64], null,
  [59, 62, 67], null, [60, 62, 67], null,
];

// 3. Distinction Anthem: F -> C/E -> Dm7 -> Bbmaj7 (Inspiring Triumph & Confidence)
const ANTHEM_CHORDS: number[][] = [
  [41, 48, 53, 57, 60], // Fmaj
  [40, 48, 52, 55, 60], // C/E
  [38, 45, 50, 53, 57], // Dm7
  [46, 50, 53, 57, 62], // Bbmaj7
];

const ANTHEM_SOARING_MELODY: Array<number | null> = [
  65, null, 69, null, 72, null, 74, 76, // F4, A4, C5, D5, E5
  77, null, 76, null, 72, null, 69, null, // F5, E5, C5, A4
  74, null, 77, null, 81, null, 79, null, // D5, F5, A5, G5
  77, null, 74, null, 72, null, 74, 77, // Soaring triumph
];

// 4. Luangwa Sunshine: D -> A -> Bm7 -> Gmaj7 (Sunny, Joyful Kalimba)
const SUNSHINE_CHORDS: number[][] = [
  [45, 50, 54, 57, 62], // Dmaj
  [45, 49, 52, 57, 61], // A/C#
  [47, 50, 54, 57, 62], // Bm7
  [43, 47, 50, 54, 59], // Gmaj7
];

const SUNSHINE_KALIMBA_NOTES: number[] = [
  62, 66, 69, 74, 69, 66, 71, 74,
  66, 69, 74, 78, 76, 74, 69, 71,
];

// 5. Zambezi Lo-Fi: Fmaj9 -> Em7 -> Dm9 -> Cmaj9
const LOFI_CHORDS: number[][] = [
  [53, 57, 60, 64, 67], // Fmaj9
  [52, 55, 59, 62, 67], // Em7(add11)
  [50, 53, 57, 60, 64], // Dm9
  [48, 52, 55, 59, 62], // Cmaj9
];

const LOFI_MELODY: Array<number | null> = [
  72, null, 76, null, 74, null, 72, null,
  71, null, 74, null, 72, null, 67, null,
  69, null, 72, null, 76, null, 74, null,
  72, null, null, 67, 71, null, 72, null,
];

// 6. Library Kalimba
const KALIMBA_BASS = [48, 45, 41, 43];
const KALIMBA_NOTES = [
  60, 64, 67, 72, 67, 64, 69, 67,
  64, 67, 72, 76, 74, 72, 67, 64,
];

// 7. Night Rain
const RAIN_CHORDS: number[][] = [
  [48, 55, 62, 64], // Csus2/add9
  [45, 52, 59, 60], // Am9
  [41, 48, 55, 57], // Fmaj9
  [43, 50, 57, 59], // G6
];


// Extra very quiet tracks: no noise layer, no beat, only a few soft notes.
interface QuietTrack {
  chords: number[][];
  melody: Array<number | null>;
  stepMs: number;
  filterHz: number;
  padGain: number;
  padSec: number;
  melodyGain: number;
  melodyKind: "piano" | "bell" | "none";
}

const QUIET_TRACKS: Partial<Record<StudyTrackId, QuietTrack>> = {
  "still-water": {
    chords: [
      [48, 55, 59, 64], // Cmaj7
      [45, 52, 57, 64], // Am(add9)
      [41, 48, 57, 60], // Fmaj7
      [43, 50, 55, 62], // Gadd9 (soft)
    ],
    melody: [],
    stepMs: 700,
    filterHz: 900,
    padGain: 0.04,
    padSec: 6.2,
    melodyGain: 0,
    melodyKind: "none",
  },
  "quiet-piano": {
    chords: [
      [48, 52, 55, 59],
      [45, 48, 52, 59],
      [41, 45, 48, 55],
      [43, 47, 50, 57],
    ],
    melody: [
      72, null, null, null, 76, null, null, null,
      74, null, null, null, 71, null, null, null,
      69, null, null, null, 72, null, null, null,
      71, null, null, null, 67, null, null, null,
    ],
    stepMs: 620,
    filterHz: 1100,
    padGain: 0.022,
    padSec: 5,
    melodyGain: 0.05,
    melodyKind: "piano",
  },
  "music-box": {
    chords: [
      [48, 55, 60, 64],
      [45, 52, 57, 64],
      [41, 48, 53, 60],
      [43, 50, 55, 62],
    ],
    melody: [
      79, null, 76, null, 79, null, 84, null,
      83, null, 79, null, 76, null, null, null,
      77, null, 81, null, 84, null, 81, null,
      79, null, 76, null, 74, null, null, null,
    ],
    stepMs: 560,
    filterHz: 2200,
    padGain: 0.012,
    padSec: 5,
    melodyGain: 0.035,
    melodyKind: "bell",
  },
  "evening-glow": {
    chords: [
      [50, 57, 62, 66], // Dmaj add
      [47, 54, 59, 66], // Bm
      [43, 50, 55, 62], // G
      [45, 52, 57, 64], // A
    ],
    melody: [
      69, null, null, 74, null, null, 73, null,
      null, null, 71, null, null, null, null, null,
      66, null, null, 71, null, null, 69, null,
      null, null, 68, null, null, null, null, null,
    ],
    stepMs: 560,
    filterHz: 1000,
    padGain: 0.036,
    padSec: 5.4,
    melodyGain: 0.03,
    melodyKind: "piano",
  },
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class StudyMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  private schedulerTimer: number | null = null;
  private stepIndex = 0;
  private isPlaying = false;
  private desiredPlaying = false;
  private trackId: StudyTrackId = "victoria-dawn";
  private volume = 0.35;
  private ducked = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      const ctx = new AudioCtx();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;

      const duck = ctx.createGain();
      duck.gain.value = this.ducked ? 0.18 : 1;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1600;
      filter.Q.value = 0.6;

      // Gentle ambient stereo-ish echo loop
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.36;

      const feedback = ctx.createGain();
      feedback.gain.value = 0.26;

      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.value = 1200;

      filter.connect(duck);
      filter.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(feedback);
      feedback.connect(delay);
      delayFilter.connect(duck);

      duck.connect(master);
      master.connect(ctx.destination);

      this.masterGain = master;
      this.duckGain = duck;
      this.lowpass = filter;
      this.delayNode = delay;
      this.delayFeedback = feedback;
    }

    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Warm pink/brown-ish filtered noise for rain/air texture
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2) * 0.38;
    }
    return buffer;
  }

  private startAmbientTexture() {
    this.stopAmbientTexture();
    if (!this.ctx || !this.lowpass) return;
    // The quiet tracks have no background noise at all.
    if (QUIET_TRACKS[this.trackId]) return;

    const ctx = this.ctx;
    const buffer = this.createNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value =
      this.trackId === "night-rain"
        ? 720
        : this.trackId === "victoria-dawn"
        ? 980
        : 520;
    bandpass.Q.value = this.trackId === "night-rain" ? 0.55 : 0.8;

    const gain = ctx.createGain();
    const targetLevel =
      this.trackId === "night-rain"
        ? 0.22
        : this.trackId === "victoria-dawn"
        ? 0.035
        : this.trackId === "zambezi-lofi"
        ? 0.04
        : 0.02;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(targetLevel, ctx.currentTime + 1.2);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.lowpass);

    source.start();
    this.noiseSource = source;
    this.noiseGain = gain;
  }

  private stopAmbientTexture() {
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        // ignore already stopped
      }
      this.noiseSource = null;
    }
    if (this.noiseGain) {
      try {
        this.noiseGain.disconnect();
      } catch {
        // ignore
      }
      this.noiseGain = null;
    }
  }

  // Dual oscillator warm chord voice
  private playWarmVoice(
    freq: number,
    durationSec: number,
    peakGain: number,
    waveType: OscillatorType,
    attackSec = 0.08
  ) {
    if (!this.ctx || !this.lowpass || !this.isPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, now);

    // Subtle analog detune warmth
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.002, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + attackSec);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(env);
    osc2.connect(env);
    env.connect(this.lowpass);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);
  }

  // Crisp marimba / kalimba wooden pluck voice
  private playPluckVoice(
    freq: number,
    durationSec: number,
    peakGain: number,
    brightness = 1.0
  ) {
    if (!this.ctx || !this.lowpass || !this.isPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Bell-like inharmonic strike overtone for acoustic marimba/kalimba
    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = "sine";
    oscHarmonic.frequency.setValueAtTime(freq * 2.756, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    const harmEnv = ctx.createGain();
    harmEnv.gain.setValueAtTime(0.0001, now);
    harmEnv.gain.linearRampToValueAtTime(peakGain * 0.35 * brightness, now + 0.004);
    harmEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(env);
    oscHarmonic.connect(harmEnv);
    env.connect(this.lowpass);
    harmEnv.connect(this.lowpass);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + durationSec + 0.05);
    oscHarmonic.stop(now + 0.08);
  }

  // Rich, encouraging brass-like anthem swell
  private playWarmBrass(
    freq: number,
    durationSec: number,
    peakGain: number
  ) {
    if (!this.ctx || !this.lowpass || !this.isPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.003, now);

    const brassFilter = ctx.createBiquadFilter();
    brassFilter.type = "lowpass";
    brassFilter.frequency.setValueAtTime(700, now);
    brassFilter.frequency.linearRampToValueAtTime(1400, now + 0.25);
    brassFilter.frequency.exponentialRampToValueAtTime(600, now + durationSec);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.2);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc1.connect(brassFilter);
    osc2.connect(brassFilter);
    brassFilter.connect(env);
    env.connect(this.lowpass);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);
  }

  // Deep rhythmic bass voice
  private playBassVoice(freq: number, durationSec: number, peakGain: number) {
    if (!this.ctx || !this.lowpass || !this.isPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    const sub = ctx.createOscillator();
    sub.type = "triangle";
    sub.frequency.setValueAtTime(freq, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(env);
    sub.connect(env);
    env.connect(this.lowpass);

    osc.start(now);
    sub.start(now);
    osc.stop(now + durationSec + 0.05);
    sub.stop(now + durationSec + 0.05);
  }

  // Subtle encouraging rhythmic click/shaker tap
  private playSoftPulse(isAccent = false) {
    if (!this.ctx || !this.lowpass || !this.isPlaying) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const node = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.009));
    }
    node.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = isAccent ? 2800 : 3800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.024 : 0.014, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.lowpass);

    node.start(now);
  }

  private tickStep() {
    if (!this.isPlaying || !this.ctx) return;

    if (this.trackId === "victoria-dawn") {
      // 8 steps per bar, 4-bar loop (32 steps) - Bright, uplifting morning marimba
      const stepInLoop = this.stepIndex % 32;
      const chordIdx = Math.floor(stepInLoop / 8);

      if (stepInLoop % 8 === 0) {
        const chord = VICTORIA_CHORDS[chordIdx];
        chord.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmVoice(midiToFreq(midi), 3.2, 0.055, "triangle", 0.12);
          }, idx * 40);
        });
      }

      // Inspiring marimba arpeggio notes
      const marimbaNote = VICTORIA_MARIMBA_MELODY[stepInLoop];
      if (marimbaNote !== null) {
        this.playPluckVoice(midiToFreq(marimbaNote), 0.85, 0.065, 1.2);
      }
      if (stepInLoop % 2 === 1 && marimbaNote !== null) {
        // High harmonic sparkle
        this.playPluckVoice(midiToFreq(marimbaNote + 12), 0.45, 0.025, 1.4);
      }
    } else if (this.trackId === "kopala-drive") {
      // Motivating Copperbelt rhythmic groove (16 steps)
      const stepInLoop = this.stepIndex % 16;
      const barIdx = Math.floor(stepInLoop / 4);

      // Walking syncopated bass on beat 1 and 3
      if (stepInLoop % 2 === 0) {
        const bassMidi = KOPALA_BASS_LINE[stepInLoop];
        this.playBassVoice(midiToFreq(bassMidi), 0.55, 0.09);
      }

      // Upbeat shaker pulse
      this.playSoftPulse(stepInLoop % 4 === 2);

      // Rhodes chord stabs on syncopated upbeats
      const stabs = KOPALA_GROOVE_STABS[stepInLoop];
      if (stabs) {
        stabs.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmVoice(midiToFreq(midi), 0.75, 0.05, "triangle", 0.03);
          }, idx * 25);
        });
      }

      // Chord pad swell on every 4th step
      if (stepInLoop % 4 === 0) {
        const chord = KOPALA_CHORDS[barIdx];
        chord.forEach((midi) => {
          this.playWarmVoice(midiToFreq(midi), 2.2, 0.04, "sine", 0.2);
        });
      }
    } else if (this.trackId === "distinction-anthem") {
      // 32 steps - Inspiring triumphant anthem swells & confidence
      const stepInLoop = this.stepIndex % 32;
      const chordIdx = Math.floor(stepInLoop / 8);

      if (stepInLoop % 8 === 0) {
        const chord = ANTHEM_CHORDS[chordIdx];
        chord.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmBrass(midiToFreq(midi), 4.2, 0.055);
            this.playWarmVoice(midiToFreq(midi), 4.5, 0.05, "sine", 0.3);
          }, idx * 55);
        });
      }

      // Soaring celebratory lead melody
      const melody = ANTHEM_SOARING_MELODY[stepInLoop];
      if (melody !== null) {
        this.playWarmBrass(midiToFreq(melody), 1.8, 0.05);
        this.playPluckVoice(midiToFreq(melody), 1.2, 0.045, 1.1);
      }
    } else if (this.trackId === "luangwa-sunshine") {
      // 16 steps - Joyful, sunny acoustic thumb piano
      const stepInLoop = this.stepIndex % 16;
      const barIdx = Math.floor(stepInLoop / 4);

      if (stepInLoop % 4 === 0) {
        const chord = SUNSHINE_CHORDS[barIdx];
        chord.forEach((midi) => {
          this.playWarmVoice(midiToFreq(midi), 2.8, 0.045, "triangle", 0.15);
        });
      }

      const note = SUNSHINE_KALIMBA_NOTES[stepInLoop];
      if (stepInLoop % 2 === 0 || stepInLoop % 3 === 0) {
        this.playPluckVoice(midiToFreq(note), 0.9, 0.065, 1.3);
        // Playful major 6th sparkle
        if (stepInLoop % 4 === 1) {
          this.playPluckVoice(midiToFreq(note + 9), 0.5, 0.03, 1.5);
        }
      }
    } else if (this.trackId === "zambezi-lofi") {
      // 8 steps per bar, 4-bar loop (32 steps)
      const stepInLoop = this.stepIndex % 32;
      const chordIdx = Math.floor(stepInLoop / 8);
      if (stepInLoop % 8 === 0) {
        const chord = LOFI_CHORDS[chordIdx];
        chord.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmVoice(midiToFreq(midi), 3.4, 0.065, "triangle", 0.14);
          }, idx * 45);
        });
      }
      const melodyNote = LOFI_MELODY[stepInLoop];
      if (melodyNote !== null) {
        this.playWarmVoice(midiToFreq(melodyNote), 1.15, 0.045, "sine", 0.03);
      }
    } else if (this.trackId === "library-kalimba") {
      const stepInLoop = this.stepIndex % 16;
      if (stepInLoop % 4 === 0) {
        const bassMidi = KALIMBA_BASS[Math.floor(stepInLoop / 4)];
        this.playWarmVoice(midiToFreq(bassMidi), 3.0, 0.08, "sine", 0.35);
        this.playWarmVoice(midiToFreq(bassMidi + 12), 2.8, 0.04, "triangle", 0.45);
      }
      const pluckMidi = KALIMBA_NOTES[stepInLoop];
      if (stepInLoop % 2 === 0 || stepInLoop % 5 === 0) {
        this.playWarmVoice(midiToFreq(pluckMidi), 0.95, 0.06, "triangle", 0.015);
      }
    } else if (QUIET_TRACKS[this.trackId]) {
      const q = QUIET_TRACKS[this.trackId]!;
      const loop = Math.max(32, q.melody.length || 32);
      const stepInLoop = this.stepIndex % loop;
      if (stepInLoop % 8 === 0) {
        const chord = q.chords[Math.floor(stepInLoop / 8) % q.chords.length];
        chord.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmVoice(midiToFreq(midi), q.padSec, q.padGain, "sine", 1.0);
          }, idx * 110);
        });
      }
      const note = q.melody[stepInLoop];
      if (q.melodyKind !== "none" && note !== null && note !== undefined) {
        if (q.melodyKind === "bell") {
          this.playPluckVoice(midiToFreq(note), 1.6, q.melodyGain, 0.6);
        } else {
          this.playWarmVoice(midiToFreq(note), 2.2, q.melodyGain, "triangle", 0.04);
        }
      }
    } else {
      // night-rain: slow breathing chord swells every 8 steps
      const stepInLoop = this.stepIndex % 32;
      if (stepInLoop % 8 === 0) {
        const chord = RAIN_CHORDS[Math.floor(stepInLoop / 8)];
        chord.forEach((midi, idx) => {
          window.setTimeout(() => {
            if (!this.isPlaying) return;
            this.playWarmVoice(midiToFreq(midi), 5.6, 0.045, "sine", 1.1);
          }, idx * 90);
        });
      }
    }

    this.stepIndex += 1;
  }

  private getStepIntervalMs(): number {
    const quiet = QUIET_TRACKS[this.trackId];
    if (quiet) return quiet.stepMs;
    switch (this.trackId) {
      case "kopala-drive":
        return 330; // ~90 BPM motivating rhythm
      case "victoria-dawn":
        return 360; // ~83 BPM bright morning tempo
      case "luangwa-sunshine":
        return 380; // ~79 BPM sunny bounce
      case "zambezi-lofi":
        return 440; // ~68 BPM
      case "distinction-anthem":
        return 460; // ~65 BPM majestic anthem
      case "library-kalimba":
        return 480; // ~62 BPM
      case "night-rain":
      default:
        return 650; // slow ambient swell
    }
  }

  private restartScheduler() {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.stepIndex = 0;
    this.tickStep();
    this.schedulerTimer = window.setInterval(
      () => this.tickStep(),
      this.getStepIntervalMs()
    );
  }

  public async start(): Promise<boolean> {
    this.desiredPlaying = true;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return false;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
    } catch {
      return false;
    }

    if (!this.desiredPlaying || ctx.state !== "running") {
      return false;
    }

    if (this.isPlaying) {
      this.updateGainRamp();
      return true;
    }

    this.isPlaying = true;
    this.updateFilterForTrack();
    this.startAmbientTexture();
    this.restartScheduler();
    this.updateGainRamp();
    return true;
  }

  public stop() {
    this.desiredPlaying = false;
    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.35);
    }
    window.setTimeout(() => {
      if (!this.isPlaying) {
        this.stopAmbientTexture();
      }
    }, 380);
  }

  public setTrack(trackId: StudyTrackId) {
    if (this.trackId === trackId) return;
    this.trackId = trackId;
    if (this.isPlaying) {
      this.updateFilterForTrack();
      this.startAmbientTexture();
      this.restartScheduler();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.isPlaying) {
      this.updateGainRamp();
    }
  }

  public setDucked(ducked: boolean) {
    if (this.ducked === ducked) return;
    this.ducked = ducked;
    if (this.ctx && this.duckGain) {
      const now = this.ctx.currentTime;
      this.duckGain.gain.cancelScheduledValues(now);
      this.duckGain.gain.setValueAtTime(this.duckGain.gain.value, now);
      this.duckGain.gain.linearRampToValueAtTime(
        ducked ? 0.16 : 1.0,
        now + 0.25
      );
    }
  }

  private updateFilterForTrack() {
    if (!this.ctx || !this.lowpass) return;
    let freq = QUIET_TRACKS[this.trackId]?.filterHz ?? 1400;
    switch (this.trackId) {
      case "victoria-dawn":
        freq = 1850;
        break;
      case "kopala-drive":
        freq = 1650;
        break;
      case "distinction-anthem":
        freq = 1500;
        break;
      case "luangwa-sunshine":
        freq = 1750;
        break;
      case "library-kalimba":
        freq = 1450;
        break;
      case "zambezi-lofi":
        freq = 1150;
        break;
      case "night-rain":
        freq = 920;
        break;
    }
    this.lowpass.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.2);
  }

  private updateGainRamp() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.isPlaying ? this.volume * 0.9 : 0;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.5);
  }

  public dispose() {
    this.stop();
    if (this.delayNode) {
      try {
        this.delayNode.disconnect();
      } catch {
        // ignore
      }
    }
    if (this.delayFeedback) {
      try {
        this.delayFeedback.disconnect();
      } catch {
        // ignore
      }
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
