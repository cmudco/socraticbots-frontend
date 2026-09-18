import { useEffect, useState } from 'react';

/** Live level of the selected mic as the browser captures it (pre-network). */
export const useLocalMicLevel = (deviceId: string, enabled: boolean) => {
  const [level, setLevel] = useState({ peak: 0, rms: 0 });

  useEffect(() => {
    if (!enabled) return;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let rafId = 0;
    let lastPublish = 0;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const samples = new Float32Array(analyser.fftSize);

        const tick = (time: number) => {
          analyser.getFloatTimeDomainData(samples);
          if (time - lastPublish > 100) {
            lastPublish = time;
            let peak = 0;
            let sumSquares = 0;
            for (const sample of samples) {
              const magnitude = Math.abs(sample);
              if (magnitude > peak) peak = magnitude;
              sumSquares += sample * sample;
            }
            setLevel({ peak, rms: Math.sqrt(sumSquares / samples.length) });
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        setLevel({ peak: 0, rms: 0 });
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach(track => track.stop());
      void audioContext?.close();
    };
  }, [deviceId, enabled]);

  return level;
};
