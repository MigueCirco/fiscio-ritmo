// timer.js - Handles timer logic and states

import { audioController } from './audio.js';

export class Timer {
    constructor(displayElement, stateElement, progressElement) {
        this.displayElement = displayElement;
        this.stateElement = stateElement;
        this.progressElement = progressElement;
        
        this.timerId = null;
        this.timeLeft = 0;
        this.isActive = false;
        
        this.currentExercise = null;
        this.currentSet = 0;
        
        // Interval specific state
        this.intervalCount = 0; 
        this.isWorking = false; // true = work phase, false = rest phase
        
        // Callbacks
        this.onSetComplete = null;
        this.onExerciseComplete = null;
    }

    start(exercise) {
        if (this.isActive) return;
        
        this.currentExercise = exercise;
        this.isActive = true;
        
        // Initialization based on timer type
        if (exercise.timerType === 'regular') {
            this.startRegularSet();
        } else if (exercise.timerType === 'interval' || exercise.timerType === 'kegel') {
            this.startIntervalSet();
        }
    }

    stop() {
        clearInterval(this.timerId);
        this.isActive = false;
        this.resetDisplay();
    }

    // --- REGULAR TIMER LOGIC ---
    startRegularSet() {
        this.stateElement.textContent = "¡TRABAJANDO!";
        this.stateElement.className = "state-text work";
        this.displayElement.className = "work";
        this.displayElement.textContent = "----";
        
        // Wait for the user to finish their set, they will press a button to start rest
        // The UI will handle switching the button to "Finalizar Serie" and calling startRest
    }

    startRestCallback() {
        // Called when user finishes working a regular set
        this.currentSet++;
        if (this.onSetComplete) this.onSetComplete(this.currentSet, this.currentExercise.sets);

        if (this.currentSet >= this.currentExercise.sets) {
            this.completeExercise();
            return;
        }

        // Start rest timer
        this.timeLeft = this.currentExercise.restTime;
        this.stateElement.textContent = "DESCANSO";
        this.stateElement.className = "state-text rest";
        this.displayElement.className = "rest";
        
        this.updateDisplay(this.timeLeft);
        this.playRestCue();
        
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                this.playWorkCue();
                this.isActive = false;
                
                // Allow user to start next set manually
                this.stateElement.textContent = "LISTO PARA LA SIGUIENTE";
                this.stateElement.className = "state-text";
                this.displayElement.className = "";
                
                if (this.onWaitingNextSet) this.onWaitingNextSet();
            }
        }, 1000);
    }

    // --- INTERVAL TIMER LOGIC ---
    startIntervalSet() {
        // Called to start the whole 10 reps of 10s work / 5s rest
        this.intervalCount = 0;
        this.currentSet++;
        
        if (this.onSetComplete) {
            // It just started a set, wait for interval to finish to count it fully
            // But we can update UI to show which set we are on
            this.onSetComplete(this.currentSet - 1, this.currentExercise.sets);
        }

        this.startNextIntervalPhase('work');
    }

    startNextIntervalPhase(phaseType) {
        if (!this.isActive) return;

        if (phaseType === 'work') {
            this.isWorking = true;
            this.intervalCount++;
            
            if (this.intervalCount > this.currentExercise.reps) {
                // Set is complete
                if (this.onSetComplete) this.onSetComplete(this.currentSet, this.currentExercise.sets);
                
                if (this.currentSet >= this.currentExercise.sets) {
                    this.completeExercise();
                } else {
                    // Start long rest between sets if needed, or just stop and wait
                    this.isActive = false;
                    this.stateElement.textContent = "SERIE COMPLETADA";
                    this.stateElement.className = "state-text";
                    this.displayElement.textContent = "00:00";
                    this.playCompleteCue();
                    
                    if (this.onWaitingNextSet) this.onWaitingNextSet();
                }
                return;
            }

            this.timeLeft = this.currentExercise.workTime;
            const workLabel = this.currentExercise.timerType === 'kegel' ? 'ACTIVAR PC' : 'TRABAJO';
            this.stateElement.textContent = `${workLabel} (${this.intervalCount}/${this.currentExercise.reps})`;
            this.stateElement.className = "state-text work";
            this.displayElement.className = "work";
            this.playWorkCue();
            
        } else {
            // Rest phase
            this.isWorking = false;
            this.timeLeft = this.currentExercise.restTime;
            this.stateElement.textContent = this.currentExercise.timerType === 'kegel' ? "SOLTAR / RELAJAR" : "DESCANSO CORTO";
            this.stateElement.className = "state-text rest";
            this.displayElement.className = "rest";
            this.playRestCue();
        }

        this.updateDisplay(this.timeLeft);
        
        this.timerId = setInterval(() => {
            if (!this.isActive) {
                clearInterval(this.timerId);
                return;
            }
            
            this.timeLeft--;
            this.updateDisplay(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                // Switch phase
                this.startNextIntervalPhase(this.isWorking ? 'rest' : 'work');
            }
        }, 1000);
    }

    completeExercise() {
        this.isActive = false;
        clearInterval(this.timerId);
        this.stateElement.textContent = "¡EJERCICIO TERMINADO!";
        this.stateElement.className = "state-text work";
        this.displayElement.className = "work";
        this.displayElement.textContent = "✓";
        this.playCompleteCue();
        
        if (this.onExerciseComplete) this.onExerciseComplete();
    }

    // --- UTILS ---
    updateDisplay(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        this.displayElement.textContent = `${m}:${s}`;
    }

    resetDisplay() {
        this.stateElement.textContent = "LISTO";
        this.stateElement.className = "state-text";
        this.displayElement.className = "";
        this.displayElement.textContent = "00:00";
    }

    playWorkCue() {
        if (this.currentExercise?.timerType === 'kegel') {
            audioController.vibrateWork();
            return;
        }
        audioController.playWorkSound();
    }

    playRestCue() {
        if (this.currentExercise?.timerType === 'kegel') {
            audioController.vibrateRest();
            return;
        }
        audioController.playRestSound();
    }

    playCompleteCue() {
        if (this.currentExercise?.timerType === 'kegel') {
            audioController.vibrateComplete();
            return;
        }
        audioController.playCompleteSound();
    }
}
