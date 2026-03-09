// audio.js - Manages the Web Audio API for timer sounds

class AudioController {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Setup AudioContext on first user interaction (required by browsers)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.initialized = true;
    }

    playSound(frequency, type = 'sine', duration = 0.5) {
        if (!this.initialized) this.init();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope to avoid clicks at start/end
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(1, this.audioContext.currentTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playWorkSound() {
        // High pitch beep for Work/Start (800Hz)
        this.playSound(800, 'sine', 0.6);
        // Play an immediate double beep for more urgency
        setTimeout(() => this.playSound(800, 'sine', 0.4), 200);
    }

    playRestSound() {
        // Low pitch boop for Rest (300Hz)
        this.playSound(300, 'triangle', 0.8);
    }

    playCompleteSound() {
        // A little melody for completing a set or exercise
        this.playSound(400, 'sine', 0.2);
        setTimeout(() => this.playSound(500, 'sine', 0.2), 200);
        setTimeout(() => this.playSound(600, 'sine', 0.4), 400);
    }
}

export const audioController = new AudioController();
