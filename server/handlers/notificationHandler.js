let ioInstance = null;

const createNotificationPayload = (message, type) => ({
    timestamp: Date.now(),
    message: message,
    type: type,
});

export function initializeNotificationHandler(io) {
    ioInstance = io;
    console.log('[NotificationHandler] Inicializado.');
}

export function sendGlobalNotification(message, type = 'system') {
    if (!ioInstance) {
        console.error('[NotificationHandler] Tentativa de enviar notificação sem inicializar.');
        return;
    }

    const notificationData = createNotificationPayload(message, type);
    ioInstance.emit('notification:global', notificationData);
    console.log(`[NotificationHandler] Notificação Global enviada: "${message}" (Tipo: ${type})`);
}

export function sendPrivateNotification(targetSocket, message, type = 'info') {
    if (!targetSocket) return;

    const notificationData = createNotificationPayload(message, type);
    targetSocket.emit('notification:private', notificationData);
}
