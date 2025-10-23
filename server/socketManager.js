import { registerLoginHandler } from './handlers/loginHandler.js';
import { registerPlayerHandler } from './handlers/playerHandler.js';
import { registerCharacterHandler } from './handlers/characterHandler.js';
import { registerAuthenticationHandler } from './handlers/authenticationHandler.js';
import { registerMovementHandler } from './handlers/movementHandler.js';
import { registerDisconnectHandler } from './handlers/disconnectHandler.js';
import { registerChatHandler } from './handlers/chatHandler.js';
import { initializeVisibilityHandler } from './handlers/visibilityHandler.js';
import { initializeNotificationHandler } from './handlers/notificationHandler.js';

/**
 * Inicializa o gestor principal de conexões Socket.IO.
 * @param {Server} io - A instância do servidor Socket.IO (passada pelo server.js).
 */
export function initializeSocketManager(io) {
    
    // Inicializa os handlers que precisam da instância 'io'
    initializeVisibilityHandler(io);
    initializeNotificationHandler(io); 

    io.on('connection', (socket) => {
        console.log(`[SocketManager] Novo cliente conectado: ${socket.id}`);

        // --- Registo de Handlers ---
        registerAuthenticationHandler(socket);
        registerLoginHandler(socket);
        registerPlayerHandler(socket); 
        registerCharacterHandler(socket); 
        registerMovementHandler(socket); 
        registerChatHandler(io, socket); 
        registerDisconnectHandler(socket); 
    });
}