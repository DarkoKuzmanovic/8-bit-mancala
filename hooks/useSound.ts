
import { useCallback, useRef } from 'react';

type SoundType = 'pickup' | 'drop' | 'capture' | 'win' | 'turn' | 'click';

export const useSound = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    const playSound = useCallback((type: SoundType) => {
        try {
            const audioCtx = getAudioContext();
            const now = audioCtx.currentTime;

            const gainNode = audioCtx.createGain();
            gainNode.connect(audioCtx.destination);
            
            let oscillatorType: OscillatorType = 'square';
            
            switch(type) {
                case 'pickup':
                    gainNode.gain.setValueAtTime(0.1, now);
                    const osc1 = audioCtx.createOscillator();
                    osc1.type = 'triangle';
                    osc1.frequency.setValueAtTime(200, now);
                    osc1.frequency.linearRampToValueAtTime(400, now + 0.1);
                    osc1.connect(gainNode);
                    osc1.start(now);
                    osc1.stop(now + 0.1);
                    break;

                case 'drop':
                    gainNode.gain.setValueAtTime(0.08, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                    const oscDrop = audioCtx.createOscillator();
                    oscDrop.type = 'sine';
                    oscDrop.frequency.setValueAtTime(300, now);
                    oscDrop.connect(gainNode);
                    oscDrop.start(now);
                    oscDrop.stop(now + 0.2);
                    break;
                
                case 'capture':
                     gainNode.gain.setValueAtTime(0.2, now);
                    ['G5', 'E6', 'C6'].forEach((note, i) => {
                        const freq = { G5: 783.99, E6: 1318.51, C6: 1046.50 }[note]!;
                        const osc = audioCtx.createOscillator();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(freq, now + i * 0.07);
                        osc.connect(gainNode);
                        osc.start(now + i * 0.07);
                        osc.stop(now + i * 0.07 + 0.05);
                    });
                    break;
                
                case 'win':
                    gainNode.gain.setValueAtTime(0.2, now);
                    ['C5', 'E5', 'G5', 'C6'].forEach((note, i) => {
                         const freq = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50}[note]!;
                         const osc = audioCtx.createOscillator();
                         osc.type = 'triangle';
                         osc.frequency.setValueAtTime(freq, now + i * 0.1);
                         osc.connect(gainNode);
                         osc.start(now + i * 0.1);
                         osc.stop(now + i * 0.1 + 0.1);
                    });
                    break;
                
                case 'turn':
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                    const oscTurn = audioCtx.createOscillator();
                    oscTurn.type = 'sawtooth';
                    oscTurn.frequency.setValueAtTime(500, now);
                    oscTurn.connect(gainNode);
                    oscTurn.start(now);
                    oscTurn.stop(now + 0.15);
                    break;
                
                case 'click':
                     gainNode.gain.setValueAtTime(0.15, now);
                     gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                     const oscClick = audioCtx.createOscillator();
                     oscClick.type = 'square';
                     oscClick.frequency.setValueAtTime(150, now);
                     oscClick.connect(gainNode);
                     oscClick.start(now);
                     oscClick.stop(now + 0.1);
                     break;
            }
        } catch (error) {
            console.error("Could not play sound:", error);
        }
    }, [getAudioContext]);

    return playSound;
};
