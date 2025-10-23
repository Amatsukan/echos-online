import { SAVE_INTERVAL_MS } from './config.js'; // Importa o intervalo do config
import { onlinePlayers } from './handlers/visibilityHandler.js'; // Acesso aos jogadores online
import { Character } from './models/index.js'; // Modelo para salvar
import { sendGlobalNotification } from './handlers/notificationHandler.js'; // Função para notificar

/**
 * Inicia o loop de salvamento periódico das posições dos jogadores.
 */
export function startSaveLoop() {
    console.log(`[GameLoop] Iniciando salvamento periódico a cada ${SAVE_INTERVAL_MS / 1000} segundos.`);

    setInterval(async () => {
        if (onlinePlayers.size === 0) {
            return;
        }

        console.log('[GameLoop] Iniciando salvamento periódico de posições...');
        let savedCount = 0;
        const savePromises = [];

        onlinePlayers.forEach((playerData, socketId) => {
            if (playerData.characterId && playerData.position) {
                savePromises.push(
                    Character.update(
                        { x: playerData.position.x, y: playerData.position.y },
                        { where: { id: playerData.characterId } }
                    ).then(() => {
                        savedCount++;
                    }).catch(err => {
                         console.error(`[GameLoop] Erro ao salvar periodicamente Char ID ${playerData.characterId} (Socket: ${socketId}):`, err);
                    })
                );
            } else {
                 console.warn(`[GameLoop] Dados incompletos para salvar jogador no socket ${socketId} durante save periódico.`);
            }
        });

        try {
            await Promise.all(savePromises);

            if (savedCount > 0) {
                console.log(`[GameLoop] ${savedCount} posições salvas periodicamente com sucesso.`);
                sendGlobalNotification("O mundo foi atualizado.");
            } else {
                 console.log('[GameLoop] Nenhum jogador precisou de atualização de posição (ou houve erros no salvamento individual).');
            }
        } catch (error) {
             console.error('[GameLoop] Erro geral durante o Promise.all do salvamento periódico:', error);
        }

    }, SAVE_INTERVAL_MS);
}