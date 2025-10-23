import { mapService } from '../services/mapService.js';
import { handlePlayerMove } from './visibilityHandler.js'; // Ajuste o caminho se necessário

const MOVEMENT_COOLDOWN_MS = 250; 

export function registerMovementHandler(socket) {

    socket.on('player:move:attempt', (targetTile) => {
        
        // --- (NOVO) LOGGING ---
        console.log(`[MovementHandler] Recebido move:attempt de ${socket.id}:`, targetTile);
        // --- FIM DO LOGGING ---

        // Validação básica se targetTile é um objeto com x e y
        if (!targetTile || typeof targetTile.x !== 'number' || typeof targetTile.y !== 'number') {
            console.warn(`[MovementHandler] Recebido targetTile inválido de ${socket.id}:`, targetTile);
            return; // Ignora o pedido se os dados estiverem malformados
        }
        
        const { x: targetX, y: targetY } = targetTile;
        const characterId = socket.data.characterId;
        // const playerName = socket.data.characterDetails?.name || characterId; 

        if (!characterId) {
            return; 
        }
        
        const oldPos = { ...socket.data.characterPosition }; 

        // --- VALIDAÇÃO DE VELOCIDADE ---
        const now = Date.now();
        const lastMoveTime = socket.data.lastMoveTime || 0; 

        if (now - lastMoveTime < MOVEMENT_COOLDOWN_MS) {
            return; 
        }
        
        // --- VALIDAÇÃO DE POSIÇÃO ---
        // A função isValidPosition agora é mais segura
        if (!mapService.isValidPosition(targetX, targetY)) { 
            socket.emit('player:move:fail', { x: targetX, y: targetY });
            return;
        }

        // --- MOVIMENTO BEM-SUCEDIDO ---
        const newPos = { x: targetX, y: targetY };
        socket.data.characterPosition = newPos;
        socket.data.lastMoveTime = now; 

        socket.emit('player:move:success', newPos);

        // Chama o visibility handler para cuidar da AoI e do 'player:moved'
        handlePlayerMove(socket, oldPos); 
    });
}