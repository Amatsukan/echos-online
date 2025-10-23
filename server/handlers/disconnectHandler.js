import { Character } from '../models/index.js';
// (NOVO) Importa a função do visibility handler
import { handlePlayerDisconnect } from './visibilityHandler.js';

// Remove 'io' dos parâmetros
export function registerDisconnectHandler(socket) {

    socket.on('disconnect', async (reason) => {
        console.log(`[DisconnectHandler] Cliente desconectado: ${socket.id}. Motivo: ${reason}`);

        const { characterId, characterPosition } = socket.data;
        const socketId = socket.id; // Guarda o ID antes que o socket desapareça

        if (characterId) { // Verifica se havia um personagem associado
             // Salva posição (como antes)
            if (characterPosition) {
                try {
                    await Character.update(
                        { x: characterPosition.x, y: characterPosition.y },
                        { where: { id: characterId } }
                    );
                    console.log(`[DisconnectHandler] Posição salva para Char ID: ${characterId}`);
                } catch (err) {
                    console.error(`[DisconnectHandler] Erro ao salvar posição para Char ID ${characterId}:`, err);
                }
            }

            // --- EMISSÃO DE 'player:quit' REMOVIDA DAQUI ---
            // io.emit('player:quit', { characterId: characterId }); // REMOVIDO
            // --- FIM DA REMOÇÃO ---

            // (NOVO) Chama o visibility handler para notificar quem via o jogador
            handlePlayerDisconnect(socketId); // Passa o ID do socket que desconectou
        } else {
             console.log(`[DisconnectHandler] Socket ${socketId} desconectado sem personagem associado.`);
        }
    });
}