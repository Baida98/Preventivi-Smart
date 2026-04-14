/**
 * UI Feedback Module — Preventivi-Smart Pro
 * REGOLA 4: ZERO AMBIGUITÀ NELL'INTERFACCIA
 * Feedback certi e azioni chiare
 */

/**
 * Mostra modal di conferma per eliminazione
 * @param {string} message - Messaggio di conferma
 * @param {Function} onConfirm - Callback se confermato
 * @param {Function} onCancel - Callback se annullato
 */
export function showDeleteConfirmation(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
        <div style="
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        ">
            <h3 style="
                color: var(--gray-50);
                margin-bottom: 12px;
                font-size: 1.1rem;
            ">Conferma Eliminazione</h3>
            
            <p style="
                color: var(--gray-400);
                margin-bottom: 24px;
                line-height: 1.6;
            ">${message}</p>
            
            <div style="
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            ">
                <button class="btn btn-secondary" id="cancelBtn">
                    Annulla
                </button>
                <button class="btn btn-danger" id="confirmBtn">
                    <i class="fa-solid fa-trash"></i> Elimina
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });

    document.getElementById('confirmBtn').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });

    // Chiudi con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
            if (onCancel) onCancel();
        }
    };
    document.addEventListener('keydown', handleEsc);
}

/**
 * Mostra toast di feedback
 * @param {string} message - Messaggio
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durata in ms (default 3000)
 */
export function showFeedback(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--surface);
        color: var(--gray-100);
        padding: 16px 20px;
        border-radius: 12px;
        border-left: 4px solid ${getColorByType(type)};
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease;
        z-index: 10001;
        max-width: 400px;
    `;

    const icon = getIconByType(type);
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Mostra stato di salvataggio
 * @param {string} state - 'saving', 'saved', 'error'
 */
export function showSaveState(state) {
    const container = document.getElementById('saveStateContainer') || createSaveStateContainer();

    let message = '';
    let icon = '';
    let color = '';

    switch (state) {
        case 'saving':
            message = 'Salvataggio in corso...';
            icon = 'fa-spinner';
            color = '#3b82f6';
            break;
        case 'saved':
            message = 'Salvato con successo';
            icon = 'fa-circle-check';
            color = '#10b981';
            break;
        case 'error':
            message = 'Errore nel salvataggio';
            icon = 'fa-circle-xmark';
            color = '#ef4444';
            break;
    }

    container.innerHTML = `
        <i class="fa-solid ${icon}" style="color: ${color}; margin-right: 8px;"></i>
        <span style="color: ${color};">${message}</span>
    `;

    if (state === 'saving') {
        container.querySelector('i').style.animation = 'spin 1s linear infinite';
    }

    container.style.display = 'flex';

    if (state === 'saved' || state === 'error') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 3000);
    }
}

/**
 * Crea container per stato salvataggio
 */
function createSaveStateContainer() {
    const container = document.createElement('div');
    container.id = 'saveStateContainer';
    container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: var(--surface);
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid var(--border);
        display: none;
        align-items: center;
        z-index: 9999;
        font-size: 0.9rem;
    `;
    document.body.appendChild(container);
    return container;
}

/**
 * Ottieni colore per tipo feedback
 */
function getColorByType(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

/**
 * Ottieni icona per tipo feedback
 */
function getIconByType(type) {
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    return icons[type] || icons.info;
}

/**
 * Disabilita pulsante durante operazione
 * @param {HTMLElement} button - Elemento pulsante
 * @param {boolean} disabled - Stato disabilitato
 */
export function setButtonLoading(button, disabled) {
    if (disabled) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-spinner" style="animation: spin 1s linear infinite;"></i> Elaborazione...';
        button.dataset.originalHTML = originalHTML;
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        if (button.dataset.originalHTML) {
            button.innerHTML = button.dataset.originalHTML;
        }
    }
}

export default {
    showDeleteConfirmation,
    showFeedback,
    showSaveState,
    setButtonLoading
};
