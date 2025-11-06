import { useCallback, useRef } from 'react';
import { useSoundSettings, type SoundType } from './useSoundSettings';

export const useSound = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const { getEffectiveVolume } = useSoundSettings();

    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    // Add variation to sound parameters
    const addVariation = useCallback((baseValue: number, variationAmount: number = 0.1) => {
        return baseValue * (1 + (Math.random() - 0.5) * variationAmount);
    }, []);

    // Create stereo panner
    const createStereoPanner = useCallback((audioCtx: AudioContext, panValue: number) => {
        const panner = audioCtx.createStereoPanner();
        panner.pan.setValueAtTime(panValue, audioCtx.currentTime);
        return panner;
    }, []);

    const playSound = useCallback((type: SoundType, pitIndex?: number) => {
        try {
            const volume = getEffectiveVolume(type);
            if (volume === 0) return; // Skip if muted or disabled

            const audioCtx = getAudioContext();
            const now = audioCtx.currentTime;

            // Create panning based on pit position if provided
            let panner: StereoPannerNode | null = null;
            if (pitIndex !== undefined) {
                // Map pit index (0-11) to stereo position (-1 to 1)
                const panValue = (pitIndex - 5.5) / 5.5; // -1 for leftmost, +1 for rightmost
                panner = createStereoPanner(audioCtx, panValue);
            }

            const gainNode = audioCtx.createGain();

            // Connect nodes: gain -> (optional panner) -> destination
            if (panner) {
                gainNode.connect(panner);
                panner.connect(audioCtx.destination);
            } else {
                gainNode.connect(audioCtx.destination);
            }

            switch(type) {
                case 'pickup':
                    gainNode.gain.setValueAtTime(addVariation(0.1) * volume, now);
                    const osc1 = audioCtx.createOscillator();
                    osc1.type = 'triangle';
                    osc1.frequency.setValueAtTime(addVariation(200), now);
                    osc1.frequency.linearRampToValueAtTime(addVariation(400), now + 0.1);
                    osc1.connect(gainNode);
                    osc1.start(now);
                    osc1.stop(now + 0.1);
                    break;

                case 'drop':
                    gainNode.gain.setValueAtTime(addVariation(0.08) * volume, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                    const oscDrop = audioCtx.createOscillator();
                    oscDrop.type = 'sine';
                    oscDrop.frequency.setValueAtTime(addVariation(300), now);
                    oscDrop.connect(gainNode);
                    oscDrop.start(now);
                    oscDrop.stop(now + 0.2);
                    break;

                case 'capture':
                     gainNode.gain.setValueAtTime(addVariation(0.2) * volume, now);
                    ['G5', 'E6', 'C6'].forEach((note, i) => {
                        const freq = { G5: 783.99, E6: 1318.51, C6: 1046.50 }[note]!;
                        const osc = audioCtx.createOscillator();
                        osc.type = 'square';
                        osc.frequency.setValueAtTime(addVariation(freq, 0.02), now + i * 0.07);
                        osc.connect(gainNode);
                        osc.start(now + i * 0.07);
                        osc.stop(now + i * 0.07 + 0.05);
                    });
                    break;

                case 'captureBonus':
                     gainNode.gain.setValueAtTime(addVariation(0.25) * volume, now);
                    // More elaborate capture bonus sound
                    ['C6', 'E6', 'G6', 'C7'].forEach((note, i) => {
                        const freq = { C6: 1046.50, E6: 1318.51, G6: 1567.98, C7: 2093.00 }[note]!;
                        const osc = audioCtx.createOscillator();
                        osc.type = i % 2 === 0 ? 'square' : 'triangle';
                        osc.frequency.setValueAtTime(addVariation(freq, 0.03), now + i * 0.06);
                        osc.connect(gainNode);
                        osc.start(now + i * 0.06);
                        osc.stop(now + i * 0.06 + 0.08);
                    });
                    break;

                case 'win':
                    gainNode.gain.setValueAtTime(addVariation(0.2) * volume, now);
                    ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((note, i) => {
                         const freq = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50, E6: 1318.51}[note]!;
                         const osc = audioCtx.createOscillator();
                         osc.type = 'triangle';
                         osc.frequency.setValueAtTime(addVariation(freq, 0.02), now + i * 0.1);
                         osc.connect(gainNode);
                         osc.start(now + i * 0.1);
                         osc.stop(now + i * 0.1 + 0.15);
                    });
                    break;

                case 'turn':
                    gainNode.gain.setValueAtTime(addVariation(0.1) * volume, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                    const oscTurn = audioCtx.createOscillator();
                    oscTurn.type = 'sawtooth';
                    oscTurn.frequency.setValueAtTime(addVariation(500), now);
                    oscTurn.connect(gainNode);
                    oscTurn.start(now);
                    oscTurn.stop(now + 0.15);
                    break;

                case 'click':
                     gainNode.gain.setValueAtTime(addVariation(0.15) * volume, now);
                     gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                     const oscClick = audioCtx.createOscillator();
                     oscClick.type = 'square';
                     oscClick.frequency.setValueAtTime(addVariation(150), now);
                     oscClick.connect(gainNode);
                     oscClick.start(now);
                     oscClick.stop(now + 0.1);
                     break;

                case 'menuNavigate':
                    gainNode.gain.setValueAtTime(addVariation(0.06) * volume, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                    const oscMenu = audioCtx.createOscillator();
                    oscMenu.type = 'sine';
                    oscMenu.frequency.setValueAtTime(addVariation(600), now);
                    oscMenu.frequency.linearRampToValueAtTime(addVariation(800), now + 0.05);
                    oscMenu.connect(gainNode);
                    oscMenu.start(now);
                    oscMenu.stop(now + 0.08);
                    break;

                case 'gameStart':
                    gainNode.gain.setValueAtTime(addVariation(0.12) * volume, now);
                    // Ascending notes for game start
                    ['C4', 'G4', 'C5'].forEach((note, i) => {
                        const freq = { C4: 261.63, G4: 392.00, C5: 523.25 }[note]!;
                        const osc = audioCtx.createOscillator();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(addVariation(freq, 0.02), now + i * 0.15);
                        osc.connect(gainNode);
                        osc.start(now + i * 0.15);
                        osc.stop(now + i * 0.15 + 0.1);
                    });
                    break;

                case 'invalidMove':
                    gainNode.gain.setValueAtTime(addVariation(0.08) * volume, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                    const oscInvalid = audioCtx.createOscillator();
                    oscInvalid.type = 'sawtooth';
                    // Descending frequency for error sound
                    oscInvalid.frequency.setValueAtTime(addVariation(400), now);
                    oscInvalid.frequency.linearRampToValueAtTime(addVariation(100), now + 0.15);
                    oscInvalid.connect(gainNode);
                    oscInvalid.start(now);
                    oscInvalid.stop(now + 0.2);
                    break;
            }
        } catch (error) {
            console.error("Could not play sound:", error);
        }
    }, [getAudioContext, getEffectiveVolume, addVariation, createStereoPanner]);

    return playSound;
};