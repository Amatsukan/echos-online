import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { PORTA } from './config.js'; // Importa a porta do config

// --- Criação das Instâncias ---
const app = express();
const server = http.createServer(app);
// Exporta 'io' para que o socketManager e outros possam usá-lo
export const io = new Server(server, {
    cors: {
        origin: "*", // Permite todas as origens (ajuste em produção)
        methods: ["GET", "POST"]
    }
});

/**
 * Inicia o servidor HTTP para ouvir conexões.
 * @returns {Promise<void>} Uma promessa que resolve quando o servidor está ouvindo
 * ou rejeita se houver um erro.
 */
export function startHttpServer() {
    // Retorna uma Promise para que startServer possa esperar
    return new Promise((resolve, reject) => {
        server.listen(PORTA, () => {
            console.log(`[SERVIDOR] Servidor a correr na porta ${PORTA}`);
            resolve(); // Resolve a promessa quando o servidor inicia
        });

        server.on('error', (error) => {
            console.error('[SERVIDOR] Erro ao iniciar servidor HTTP:', error);
            reject(error); // Rejeita a promessa em caso de erro
        });
    });
}