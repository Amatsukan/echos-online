import { registerLoginHandler } from './handlers/loginHandler.js';
import { registerPlayerHandler } from './handlers/playerHandler.js'; // 1. IMPORTAR O NOVO HANDLER
// No futuro, importaríamos outros handlers aqui:
// import { registerChatHandler } from './handlers/chatHandler.js';

/**
 * Inicializa o gestor principal de conexões Socket.IO.
 * @param {Server} io - A instância do servidor Socket.IO.
 */
export function initializeSocketManager(io) {
    
    // Ouve o evento principal: um novo cliente conectou-se.
    io.on('connection', (socket) => {
        console.log(`[SocketManager] Novo cliente conectado: ${socket.id}`);

        // --- Registo de Handlers ---
        // Aqui, "entregamos" o socket aos módulos responsáveis.
        
        // Regista os handlers de login (usados em login.html)
        registerLoginHandler(socket);

        // 2. REGISTAR O NOVO HANDLER (usado em index.html)
        registerPlayerHandler(io, socket);

        // --- Evento de Desconexão ---
        socket.on('disconnect', (reason) => {
            console.log(`[SocketManager] Cliente desconectado: ${socket.id}. Motivo: ${reason}`);
        });
    });
}