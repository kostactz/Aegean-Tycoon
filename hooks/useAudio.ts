
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useAudio = () => {
    const phase = useGameStore(state => state.phase);
    const diceValue = useGameStore(state => state.diceValue);
    const isDiceRolling = useGameStore(state => state.isDiceRolling);
    const contextRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context on user interaction (implicitly handled by effects later if context exists)
    useEffect(() => {
        const initAudio = () => {
             if (!contextRef.current) {
                contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
             }
             if (contextRef.current.state === 'suspended') {
                 contextRef.current.resume();
             }
        };
        window.addEventListener('click', initAudio);
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
        if (!contextRef.current) return;
        const osc = contextRef.current.createOscillator();
        const gain = contextRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, contextRef.current.currentTime);
        
        gain.gain.setValueAtTime(vol, contextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, contextRef.current.currentTime + duration);

        osc.connect(gain);
        gain.connect(contextRef.current.destination);
        osc.start();
        osc.stop(contextRef.current.currentTime + duration);
    };

    // Roll Sound
    useEffect(() => {
        if (isDiceRolling) {
            // Pseudo rolling sound
            const interval = setInterval(() => {
                playTone(200 + Math.random() * 200, 'square', 0.1, 0.05);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isDiceRolling]);

    // Phase change sounds
    useEffect(() => {
        if (phase === 'ROLLING') {
            playTone(440, 'sine', 0.5); // Turn start
        } else if (phase === 'GAME_OVER') {
            playTone(150, 'sawtooth', 2.0, 0.2); // Lose sound
        } else if (phase === 'ACTION') {
            playTone(880, 'sine', 0.3); // Action prompt
        }
    }, [phase]);

    return null;
};
