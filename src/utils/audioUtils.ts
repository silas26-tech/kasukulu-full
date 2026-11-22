/**
 * Downsamples Float32Array audio from sourceSampleRate to 16000 Hz for Gemini Live API.
 */
export function downsampleTo16kHz(
  samples: Float32Array,
  sourceSampleRate: number
): Float32Array {
  if (sourceSampleRate === 16000 || sourceSampleRate <= 0) {
    return samples;
  }
  const ratio = sourceSampleRate / 16000;
  const outputLength = Math.max(1, Math.floor(samples.length / ratio));
  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += samples[j];
      count++;
    }
    result[i] = count > 0 ? sum / count : samples[start] ?? 0;
  }
  return result;
}

/**
 * Converts Float32Array [-1, 1] audio samples into base64-encoded 16-bit signed PCM (LE).
 */
export function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

/**
 * Decodes base64-encoded 24kHz 16-bit signed PCM (LE) into a Web Audio AudioBuffer.
 */
export function pcm24kBase64ToAudioBuffer(
  ctx: AudioContext,
  base64: string
): { buffer: AudioBuffer; rms: number } {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  let sumSq = 0;
  for (let i = 0; i < int16.length; i++) {
    const val = int16[i] / 0x8000;
    float32[i] = val;
    sumSq += val * val;
  }
  const rms = int16.length > 0 ? Math.sqrt(sumSq / int16.length) : 0;
  const buffer = ctx.createBuffer(1, float32.length, 24000);
  buffer.copyToChannel(float32, 0);
  return { buffer, rms };
}

/**
 * Computes normalized RMS energy [0, 1] from Float32 mic frames.
 */
export function computeRmsLevel(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSq += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sumSq / samples.length);
  return Math.min(1, rms * 5);
}

/**
 * Plays a base64 WAV string returned from /api/tutor/speak.
 */
export function playWavBase64(
  base64Wav: string,
  onEnd?: () => void
): HTMLAudioElement {
  const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
  if (onEnd) {
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onEnd);
  }
  void audio.play();
  return audio;
}
