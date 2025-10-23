// Guarda a instância do servidor IO
let ioInstance = null;

/**
 * Inicializa o Notification Handler com a instância do Socket.IO.
 * @param {Server} io A instância do servidor Socket.IO.
 */
export function initializeNotificationHandler(io) {
    ioInstance = io;
    console.log('[NotificationHandler] Inicializado.');
}

/**
 * Envia uma notificação global para todos os jogadores conectados.
 * @param {string} message A mensagem a ser enviada.
 * @param {string} type (Opcional) Um tipo para estilização no cliente (ex: 'system', 'warning', 'info'). Padrão 'system'.
 */
export function sendGlobalNotification(message, type = 'system') {
    if (!ioInstance) {
        console.error('[NotificationHandler] Tentativa de enviar notificação sem inicializar.');
        return;
    }

    const notificationData = {
        timestamp: Date.now(),
        message: message,
        type: type
    };

    // Emite para TODOS os sockets conectados
    ioInstance.emit('notification:global', notificationData);
    console.log(`[NotificationHandler] Notificação Global enviada: "${message}" (Tipo: ${type})`);
}

/**
 * (Futuro) Envia uma notificação para um jogador específico.
 * @param {Socket} targetSocket O socket do jogador alvo.
 * @param {string} message A mensagem a ser enviada.
 * @param {string} type (Opcional) Tipo da mensagem.
 */
export function sendPrivateNotification(targetSocket, message, type = 'info') {
     if (!targetSocket) return;
     const notificationData = {
        timestamp: Date.now(),
        message: message,
        type: type
    };
    targetSocket.emit('notification:private', notificationData); // Usa um evento diferente
}