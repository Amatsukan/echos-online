import { getCharacterDetailsById } from '../services/authService.js';
import { Character } from '../models/index.js';
import { mapService } from '../services/mapService.js';
import { handlePlayerJoin } from './visibilityHandler.js';

const getAndStoreCharacterDetails = async (socket, characterId) => {
    const charDetails = await getCharacterDetailsById(characterId);
    if (!charDetails) {
        console.error(`[PlayerHandler] Não foi possível encontrar detalhes para o char ID: ${characterId}`);
        return null;
    }
    socket.data.characterId = characterId;
    socket.data.characterDetails = charDetails;
    return charDetails;
};

const determineStartPosition = (charDetails) => {
    if (typeof charDetails.x !== 'number' || typeof charDetails.y !== 'number' || isNaN(charDetails.x) || isNaN(charDetails.y)) {
        console.error(`### ERRO CRÍTICO no playerHandler: charDetails para ID ${charDetails.id} não contém x ou y válidos!`, charDetails);
        try {
            const defaultX = Character.getAttributes().x.defaultValue;
            const defaultY = Character.getAttributes().y.defaultValue;
            console.warn(`[PlayerHandler] Usando posição de spawn padrão (${defaultX},${defaultY}) para ${charDetails.id}`);
            return { x: defaultX, y: defaultY };
        } catch (modelError) {
            console.error("[PlayerHandler] Erro ao buscar defaultValue do modelo Character:", modelError);
            console.warn(`[PlayerHandler] Usando posição de spawn hardcoded segura (24,24) para ${charDetails.id}`);
            return { x: 24, y: 24 };
        }
    }
    return { x: charDetails.x, y: charDetails.y };
};

const transformUiData = (charDetails) => {
    const stats = {
        hp: charDetails.hp,
        maxHp: charDetails.maxHp,
        mp: charDetails.mp,
        maxMp: charDetails.maxMp,
    };

    const equipment = Array.isArray(charDetails.CharacterEquipments)
        ? charDetails.CharacterEquipments.reduce((acc, eq) => {
            if (eq && eq.Item && eq.Item.name) {
                acc[eq.slot] = eq.Item.name;
            }
            return acc;
        }, {})
        : {};

    const inventory = new Array(12).fill(null);
    if (Array.isArray(charDetails.InventoryItems)) {
        for (const invItem of charDetails.InventoryItems) {
            if (invItem && invItem.Item && invItem.Item.name && invItem.position != null && invItem.position < 12) {
                inventory[invItem.position] = {
                    name: invItem.Item.name,
                    quantity: invItem.quantity,
                };
            }
        }
    }

    return { stats, equipment, inventory };
};

const sendInitialGameData = (socket, charDetails, startPos) => {
    socket.emit('map:load', {
        mapData: mapService.getMap(),
        tileSize: mapService.TILE_SIZE,
    });

    socket.emit('player:spawn', {
        characterId: charDetails.id,
        x: startPos.x,
        y: startPos.y,
    });

    const { stats, equipment, inventory } = transformUiData(charDetails);
    socket.emit('player:updateStats', stats);
    socket.emit('player:updateEquipment', equipment);
    socket.emit('player:updateInventory', inventory);
};

const handlePlayerJoinRequest = async (socket, data) => {
    if (!data || !data.characterId) {
        console.warn(`[PlayerHandler] Socket ${socket.id} tentou entrar no mundo sem ID de personagem.`);
        return;
    }

    const { characterId } = data;
    const charDetails = await getAndStoreCharacterDetails(socket, characterId);
    if (!charDetails) {
        return;
    }

    const startPos = determineStartPosition(charDetails);
    socket.data.characterPosition = startPos;

    console.log(`[PlayerHandler] Personagem ${characterId} (${charDetails.name || 'Nome não encontrado'}) (Socket: ${socket.id}) entrou no mundo em [${startPos.x}, ${startPos.y}].`);

    sendInitialGameData(socket, charDetails, startPos);
    handlePlayerJoin(socket);
};

const handleGetAttributes = (socket) => {
    const stats = socket.data.characterDetails?.CharacterStat;
    if (stats) {
        socket.emit('player:showAttributes', stats);
    } else {
        console.warn(`[PlayerHandler] Socket ${socket.id} pediu atributos, mas não foram encontrados nos dados do socket.`);
        socket.emit('player:showAttributes', null);
    }
};

export function registerPlayerHandler(socket) {
    socket.on('player:join', (data) => handlePlayerJoinRequest(socket, data));
    socket.on('player:getAttributes', () => handleGetAttributes(socket));
}
