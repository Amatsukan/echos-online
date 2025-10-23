import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { initializeSocketManager } from './socketManager.js';
import { sequelize } from './database/database.js';
import seedBank from './database/bankSeed/seed.js';

// --- (NOVO) Importações para Salvamento Periódico ---
import { onlinePlayers } from './handlers/visibilityHandler.js'; // Acesso aos jogadores online
import { Character } from './models/index.js'; // Modelo para salvar
import { sendGlobalNotification } from './handlers/notificationHandler.js'; // Função para notificar

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
// (NOVO) Intervalo de salvamento (em milissegundos) - 5 minutos
const SAVE_INTERVAL_MS = 5 * 60 * 1000; 

// Delega a lógica de sockets para o gestor
// (Nota: initializeSocketManager agora também inicializa notificationHandler)
initializeSocketManager(io);

/**
 * Função para iniciar o servidor, DB e o loop de save.
 */
async function startServer() {
    try {
        await sequelize.sync({ force: true });
        console.log('[DATABASE] Tabelas sincronizadas.');

        await seedBank();

        server.listen(PORTA, () => {
            console.log(`[SERVIDOR] Servidor a correr na porta ${PORTA}`);
            
            // --- (NOVO) INICIAR O LOOP DE SALVAMENTO PERIÓDICO ---
            console.log(`[Server] Iniciando salvamento periódico a cada ${SAVE_INTERVAL_MS / 1000} segundos.`);
            setInterval(async () => {
                console.log('[Server] Iniciando salvamento periódico de posições...');
                let savedCount = 0;
                const savePromises = []; // Array para esperar todas as atualizações

                // Itera sobre o Map de jogadores online (exportado do visibilityHandler)
                onlinePlayers.forEach((playerData, socketId) => {
                    // Garante que temos os dados necessários
                    if (playerData.characterId && playerData.position) {
                        // Adiciona a promessa de atualização ao array
                        savePromises.push(
                            Character.update(
                                { x: playerData.position.x, y: playerData.position.y },
                                { where: { id: playerData.characterId } }
                            ).then(() => {
                                savedCount++;
                            }).catch(err => {
                                 console.error(`[Server] Erro ao salvar periodicamente Char ID ${playerData.characterId} (Socket: ${socketId}):`, err);
                            })
                        );
                    } else {
                         console.warn(`[Server] Dados incompletos para salvar jogador no socket ${socketId}`);
                    }
                });

                try {
                    // Espera todas as operações de salvamento terminarem
                    await Promise.all(savePromises);
                    
                    if (savedCount > 0) {
                        console.log(`[Server] ${savedCount} posições salvas periodicamente com sucesso.`);
                        // Envia a notificação global APÓS salvar
                        sendGlobalNotification("O mundo foi atualizado.");
                    } else if (onlinePlayers.size > 0) {
                        console.log('[Server] Nenhum jogador precisou de atualização de posição (ou houve erros).');
                         // Talvez enviar uma notificação mesmo assim? Ou apenas se houve sucesso?
                         // sendGlobalNotification("Verificação periódica concluída.");
                    } else {
                         console.log('[Server] Nenhum jogador online para salvar.');
                    }
                } catch (error) {
                     // Este catch é para erros no Promise.all em si, embora os erros individuais já sejam logados
                     console.error('[Server] Erro geral durante o salvamento periódico:', error);
                }

            }, SAVE_INTERVAL_MS);
            // --- FIM DO LOOP DE SALVAMENTO ---

        });

    } catch (error) {
        console.error('[DATABASE] Erro ao sincronizar ou semear:', error);
         process.exit(1); // Sai se o DB falhar
    }
}

// Inicia o processo
startServer();