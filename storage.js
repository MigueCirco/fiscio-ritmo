// storage.js - Handles localStorage for history tracking

export class StorageManager {
    constructor() {
        this.storageKey = 'fiscio_history';
    }

    getHistory() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    saveExercise(exerciseId, exerciseTitle) {
        const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const history = this.getHistory();

        if (!history[dateKey]) {
            history[dateKey] = [];
        }

        // Avoid duplicates on the same day if they redo it
        const exists = history[dateKey].find(e => e.id === exerciseId);
        if (!exists) {
            history[dateKey].push({ id: exerciseId, title: exerciseTitle });
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        }
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }
    
    getCompletedToday() {
        const dateKey = new Date().toISOString().split('T')[0];
        const history = this.getHistory();
        return history[dateKey] || [];
    }
}

export const storageManager = new StorageManager();
