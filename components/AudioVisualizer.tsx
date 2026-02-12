
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioFile: File | null;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioFile, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Added initial value undefined to satisfy TypeScript useRef requirements
  const animationRef = useRef<number | undefined>(undefined);
  // Fix: Added initial value undefined to satisfy TypeScript useRef requirements
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  // Fix: Added initial value undefined to satisfy TypeScript useRef requirements
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !audioFile || !canvasRef.current) return;

    const setupAudio = async () => {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;

      const buffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyserRef.current);
      
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0.05; 
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.start(0);

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyserRef.current!.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          // Palette lime to white
          const opacity = dataArray[i] / 255;
          ctx.fillStyle = i % 2 === 0 ? `rgba(190, 242, 100, ${opacity})` : `rgba(255, 255, 255, ${opacity * 0.5})`;
          
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };

      draw();
    };

    setupAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioFile, isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={100} 
      className="w-full h-24 rounded-lg bg-black border border-neutral-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
    />
  );
};

export default AudioVisualizer;
