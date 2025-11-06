import { Character } from '../models/index.js';
import { handlePlayerDisconnect } from './visibilityHandler.js';

const saveCharacterPositionOnDisconnect = async (characterId, characterPosition) => {
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
};

const handleDisconnect = async (socket) => {
    console.log(`[DisconnectHandler] Cliente desconectado: ${socket.id}.`);

    const { characterId, characterPosition } = socket.data;
    const socketId = socket.id;

    if (characterId) {
        await saveCharacterPositionOnDisconnect(characterId, characterPosition);
        handlePlayerDisconnect(socketId);
    } else {
        console.log(`[DisconnectHandler] Socket ${socketId} desconectado sem personagem associado.`);
    }
};

export function registerDisconnectHandler(socket) {
    socket.on('disconnect', () => handleDisconnect(socket));
}
