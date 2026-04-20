// app.js - Main application logic

import { exercises as baseExercises } from './data.js';
import { kegelExercises } from './kegel-data.js';
import { Timer } from './timer.js';
import { storageManager } from './storage.js';

const exercises = [...kegelExercises, ...baseExercises];

class App {
    constructor() {
        // Views
        this.viewMain = document.getElementById('view-main');
        this.viewDetail = document.getElementById('view-detail');
        this.viewHistory = document.getElementById('view-history');

        // Lists
        this.exerciseListEl = document.getElementById('exercise-list');
        this.historyListEl = document.getElementById('history-list');

        // Detail elements
        this.detailTitle = document.getElementById('detail-title');
        this.detailSets = document.getElementById('detail-sets');
        this.detailReps = document.getElementById('detail-reps');
        this.detailHow = document.getElementById('detail-how');
        this.detailWhy = document.getElementById('detail-why');

        // Timer elements
        this.timerText = document.getElementById('timer-text');
        this.timerState = document.getElementById('timer-state');
        this.progressBar = document.getElementById('progress-bar');
        this.setsCompleted = document.getElementById('sets-completed');
        this.setsTotal = document.getElementById('sets-total');
        
        // Buttons
        this.btnStartTimer = document.getElementById('btn-start-timer');
        this.btnStopTimer = document.getElementById('btn-stop-timer');
        this.btnCompleteExercise = document.getElementById('btn-complete-exercise');
        this.btnBackMain = document.getElementById('btn-back-main');
        this.btnBackMainHist = document.getElementById('btn-back-main-hist');
        this.btnHistoryView = document.getElementById('btn-history-view');
        this.btnClearHistory = document.getElementById('btn-clear-history');
        this.btnCompleteAll = document.getElementById('btn-complete-all');

        // State
        this.activeExercise = null;
        this.timer = new Timer(this.timerText, this.timerState, this.progressBar);

        // PWA and Wake Lock
        this.wakeLock = null;
        this.initSW();

        this.init();
    }

    initSW() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => console.log('SW registered:', registration.scope))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }
    }

    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                });
                console.log('Wake Lock active');
            } catch (err) {
                console.error(`Wake Lock error: ${err.name}, ${err.message}`);
            }
        }
    }

    releaseWakeLock() {
        if (this.wakeLock !== null) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    init() {
        this.renderExerciseList();
        this.bindEvents();
        this.setupTimerCallbacks();
        this.checkRoutineCompletion();
    }

    bindEvents() {
        // Handle visibility changes for Wake Lock
        document.addEventListener('visibilitychange', async () => {
            // Re-acquire wake lock if we are in the detail view and app becomes visible again
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.requestWakeLock();
            }
        });

        // Navigation
        this.btnBackMain.addEventListener('click', () => {
            if (this.timer.isActive) {
                if (confirm('¿Detener el temporizador activo y volver?')) {
                    this.timer.stop();
                    this.switchView(this.viewMain);
                }
            } else {
                this.switchView(this.viewMain);
            }
            this.renderExerciseList();
        });

        this.btnBackMainHist.addEventListener('click', () => this.switchView(this.viewMain));
        this.btnHistoryView.addEventListener('click', () => {
            this.renderHistory();
            this.switchView(this.viewHistory);
        });

        // Timer controls
        this.btnStartTimer.addEventListener('click', () => {
            if (this.btnStartTimer.textContent === '▶ Iniciar Serie') {
                this.btnStartTimer.classList.add('hidden');
                this.btnStopTimer.classList.remove('hidden');
                
                if (this.activeExercise.timerType === 'regular') {
                    // Start regular work waiting state
                    this.timer.start(this.activeExercise);
                    // For regular, we wait for user to say "Rest now"
                    this.btnStopTimer.textContent = '⏸ Iniciar Descanso';
                    this.btnStopTimer.className = 'btn-primary';
                } else {
                    // Interval runs automatically
                    this.btnStopTimer.textContent = '⬛ Detener';
                    this.btnStopTimer.className = 'btn-danger';
                    this.timer.start(this.activeExercise);
                }
            } else if (this.btnStartTimer.textContent === '▶ Siguiente Serie') {
                this.btnStartTimer.classList.add('hidden');
                this.btnStopTimer.classList.remove('hidden');
                this.timer.start(this.activeExercise);
            }
        });

        this.btnStopTimer.addEventListener('click', () => {
            if (this.btnStopTimer.textContent === '⏸ Iniciar Descanso') {
                // User finished regular set, start rest timer
                this.btnStopTimer.classList.add('hidden');
                this.timer.startRestCallback();
            } else {
                // Actual stop for intervals
                this.timer.stop();
                this.resetWorkoutUI();
            }
        });

        // Completion
        this.btnCompleteExercise.addEventListener('click', () => {
            const details = this.activeExercise.timerType === 'interval' || this.activeExercise.timerType === 'kegel'
                ? `${this.activeExercise.sets} Series x ${this.activeExercise.workTime}s Trab / ${this.activeExercise.restTime}s Desc`
                : `${this.activeExercise.sets} Series x ${this.activeExercise.reps} Reps`;
                
            storageManager.saveExercise(this.activeExercise.id, this.activeExercise.title, details);
            this.renderExerciseList();
            this.switchView(this.viewMain);
            this.checkRoutineCompletion();
        });

        this.btnCompleteAll.addEventListener('click', () => {
            alert('¡Felicidades! Has completado tu rutina de hoy.');
        });

        this.btnClearHistory.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres borrar todo el historial?')) {
                storageManager.clearHistory();
                this.renderHistory();
                this.renderExerciseList();
                this.checkRoutineCompletion();
            }
        });
    }

    setupTimerCallbacks() {
        this.timer.onSetComplete = (completed, total) => {
            this.setsCompleted.textContent = completed;
            const percentage = (completed / total) * 100;
            this.progressBar.style.width = `${percentage}%`;
        };

        this.timer.onWaitingNextSet = () => {
            this.btnStartTimer.textContent = '▶ Siguiente Serie';
            this.btnStartTimer.classList.remove('hidden');
            this.btnStopTimer.classList.add('hidden');
        };

        this.timer.onExerciseComplete = () => {
            this.btnStartTimer.classList.add('hidden');
            this.btnStopTimer.classList.add('hidden');
            this.btnCompleteExercise.classList.remove('hidden');
        };
    }

    openExercise(exercise) {
        this.activeExercise = exercise;
        
        // Populate UI
        this.detailTitle.textContent = exercise.title;
        this.detailSets.textContent = `${exercise.sets} Series`;
        this.detailReps.textContent = exercise.timerType === 'interval' || exercise.timerType === 'kegel'
            ? `${exercise.reps} reps • ${exercise.workTime}s activar / ${exercise.restTime}s soltar`
            : `${exercise.reps} Reps`;
        this.detailHow.textContent = exercise.howTo;
        this.detailWhy.textContent = exercise.why;
        
        // Reset Progress/Timer UI
        this.resetWorkoutUI();
        this.setsTotal.textContent = exercise.sets;

        this.switchView(this.viewDetail);
        this.requestWakeLock();
    }

    resetWorkoutUI() {
        this.timer.resetDisplay();
        this.btnStartTimer.textContent = '▶ Iniciar Serie';
        this.btnStartTimer.classList.remove('hidden');
        this.btnStopTimer.classList.add('hidden');
        this.btnCompleteExercise.classList.add('hidden');
        this.setsCompleted.textContent = '0';
        this.progressBar.style.width = '0%';
        this.timer.currentSet = 0;
    }

    renderExerciseList() {
        this.exerciseListEl.innerHTML = '';
        const completedToday = storageManager.getCompletedToday().map(e => e.id);

        exercises.forEach(ex => {
            const isCompleted = completedToday.includes(ex.id);
            const card = document.createElement('div');
            card.className = `exercise-card ${isCompleted ? 'completed' : ''}`;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>${ex.title}</h3>
                    ${isCompleted ? '<span style="color: var(--work-color)">✓</span>' : ''}
                </div>
                <p>3 Series • ${ex.timerType === 'interval' || ex.timerType === 'kegel' ? 'Temporizado' : 'Por reps'}</p>
            `;

            card.addEventListener('click', () => this.openExercise(ex));
            this.exerciseListEl.appendChild(card);
        });
    }

    renderHistory() {
        this.historyListEl.innerHTML = '';
        const history = storageManager.getHistory();
        const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            this.historyListEl.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Aún no hay registros.</p>';
            return;
        }

        dates.forEach(date => {
            const items = history[date];
            const div = document.createElement('div');
            div.className = 'history-item';
            
            // Format date nicely
            const dateObj = new Date(date + 'T12:00:00'); // appended time helps avoid timezone offset issues on simple dates
            const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            let listHtml = items.map(i => `
                <li style="margin-bottom: 0.8rem;">
                    <div style="font-weight: 600; color: var(--text-main);">${i.title}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                        <span style="color: var(--accent); font-weight: 600;">⏱ ${i.time || 'N/A'} hrs</span> • ${i.details || 'Sin detalles'}
                    </div>
                </li>
            `).join('');

            div.innerHTML = `
                <div class="history-date">${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}</div>
                <ul class="history-exercises" style="margin-top: 0.8rem;">
                    ${listHtml}
                </ul>
            `;
            this.historyListEl.appendChild(div);
        });
    }

    checkRoutineCompletion() {
        const completedToday = storageManager.getCompletedToday();
        if (completedToday.length === exercises.length && exercises.length > 0) {
            this.btnCompleteAll.disabled = false;
            this.btnCompleteAll.classList.replace('btn-primary', 'btn-success');
            this.btnCompleteAll.textContent = '✓ Rutina del Día Completada';
        } else {
            this.btnCompleteAll.disabled = true;
            this.btnCompleteAll.classList.replace('btn-success', 'btn-primary');
            this.btnCompleteAll.textContent = 'Marcar Rutina como Completada';
        }
    }

    switchView(viewToShow) {
        if (viewToShow !== this.viewDetail) {
            this.releaseWakeLock();
        }

        [this.viewMain, this.viewDetail, this.viewHistory].forEach(v => {
            if (v === viewToShow) {
                v.classList.remove('hidden');
                // Small delay for fade effect
                setTimeout(() => v.style.opacity = '1', 10);
            } else {
                v.style.opacity = '0';
                v.classList.add('hidden');
            }
        });
    }
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
