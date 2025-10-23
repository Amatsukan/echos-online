import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { initializeSocketManager } from './socketManager.js';
import { sequelize } from './database/database.js';
import seedBank from './database/bankSeed/seed.js';

// --- Configuração do Servidor ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// --- Inicialização ---
const PORTA = 3000;

// Delega toda a lógica de sockets para o nosso gestor
initializeSocketManager(io);

/**
 * Função para iniciar o servidor e o banco de dados
 */
async function startServer() {
    try {
        // { force: true } apaga e recria as tabelas a cada reinício.
        await sequelize.sync({ force: true });
        console.log('[DATABASE] Tabelas sincronizadas.');

        // --- SEED (Semear) o Banco de Dados ---
        await seedBank();

        // Inicia o servidor HTTP
        server.listen(PORTA, () => {
            console.log(`[SERVIDOR] Servidor a correr na porta ${PORTA}`);
        });

    } catch (error) {
        console.error('[DATABASE] Erro ao sincronizar ou semear o banco de dados:', error);
    }
}

// Inicia o processo
startServer();

