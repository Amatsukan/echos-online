// Importa as funções de inicialização dos módulos
import { setupDatabase } from './database/setup.js';
import { startHttpServer, io } from './httpServer.js'; // Importa 'io' daqui agora
import { initializeSocketManager } from './socketManager.js';
import { startSaveLoop } from './gameLoop.js';

/**
 * Função principal para orquestrar a inicialização do servidor.
 */
async function startServer() {
    try {
        console.log('[Server] Iniciando servidor...');

        // 1. Configura o banco de dados primeiro
        await setupDatabase();

        // 2. Inicializa os handlers do Socket.IO (passando a instância 'io' importada)
        //    (initializeSocketManager agora inicializa visibility e notification handlers)
        initializeSocketManager(io);

        // 3. Inicia o servidor HTTP (agora retorna uma Promise)
        await startHttpServer(); // Espera o servidor confirmar que está ouvindo

        // 4. Inicia o loop de salvamento periódico (só depois que o servidor está no ar)
        startSaveLoop();

        console.log('[Server] Inicialização concluída com sucesso.');

    } catch (error) {
        // Captura erros de setupDatabase ou startHttpServer
        console.error('[Server] Falha crítica durante a inicialização:', error.message || error);
        process.exit(1); // Encerra o processo se a inicialização falhar
    }
}

// --- Inicia o processo ---
startServer();