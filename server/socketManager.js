import { registerLoginHandler } from './handlers/loginHandler.js';
import { registerPlayerHandler } from './handlers/playerHandler.js';
import { registerCharacterHandler } from './handlers/characterHandler.js';
import { registerAuthenticationHandler } from './handlers/authenticationHandler.js';
import { registerMovementHandler } from './handlers/movementHandler.js';
import { registerDisconnectHandler } from './handlers/disconnectHandler.js';
import { registerChatHandler } from './handlers/chatHandler.js';
// Importa APENAS a inicialização
import { initializeVisibilityHandler } from './handlers/visibilityHandler.js';

/**
 * Inicializa o gestor principal de conexões Socket.IO.
 * @param {Server} io - A instância do servidor Socket.IO.
 */
export function initializeSocketManager(io) {
    
    // Inicializa o Visibility Handler com a instância do io
    initializeVisibilityHandler(io);

    io.on('connection', (socket) => {
        console.log(`[SocketManager] Novo cliente conectado: ${socket.id}`);

        // --- Registo de Handlers ---
        // Passamos 'io' apenas para os que precisam (chat)
        registerAuthenticationHandler(socket);
        registerLoginHandler(socket);
        registerPlayerHandler(socket); // Não precisa mais de io
        registerCharacterHandler(socket); // Não precisa mais de io
        registerMovementHandler(socket); // Não precisa mais de io
        registerChatHandler(io, socket); // Chat precisa para io.emit global
        registerDisconnectHandler(socket); // Não precisa mais de io
    });
}