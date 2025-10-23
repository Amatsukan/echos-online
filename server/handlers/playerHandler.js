import { getCharacterDetailsById } from '../services/authService.js';
import { CharacterStats } from '../models/index.js'; // Precisamos disto para o novo handler

/**
 * Regista os handlers (ouvintes) do mundo/jogador.
 */
export function registerPlayerHandler(io, socket) {

    // Ouve quando o jogador entra no mundo (vindo do index.html)
    socket.on('player:join', async (data) => {
        if (!data || !data.characterId) {
            console.warn(`[PlayerHandler] Socket ${socket.id} tentou entrar no mundo sem ID de personagem.`);
            return;
        }
        
        const { characterId } = data;
        
        // 1. Busca os dados COMPLETOS (e aninhados) do personagem
        const charDetails = await getCharacterDetailsById(characterId);

        if (!charDetails) {
            console.error(`[PlayerHandler] Não foi possível encontrar detalhes para o char ID: ${characterId}`);
            return;
        }

        // 2. Guarda os dados no socket
        socket.data.characterId = characterId;
        socket.data.characterDetails = charDetails; // Guarda os dados aninhados completos

        console.log(`[PlayerHandler] Personagem ${characterId} (Socket: ${socket.id}) entrou no mundo.`);

        // 3. TRANSFORMA os dados para o formato que o CLIENTE (index.html) espera

        // a) Stats (HP/MP) - O cliente espera { hp, maxHp, mp, maxMp }
        const stats = {
            hp: charDetails.hp,
            maxHp: charDetails.maxHp,
            mp: charDetails.mp,
            maxMp: charDetails.maxMp
        };
        socket.emit('player:updateStats', stats);

        // b) Equipamentos - O cliente espera {"1": "Nome do Item", "9": "Nome do Item"}
        // De: [{"slot":"1", "Item":{"name":"Elmo de Ferro"}}]
        // Para: {"1": "Elmo de Ferro"}
        const equipment = charDetails.CharacterEquipments.reduce((acc, eq) => {
            acc[eq.slot] = eq.Item.name; // Mapeia slot -> nome do item
            return acc;
        }, {});
        socket.emit('player:updateEquipment', equipment);

        // c) Inventário - O cliente espera um array[12] com "null" ou {name, quantity}
        const inventory = new Array(12).fill(null); // Cria 12 slots vazios
        for (const invItem of charDetails.InventoryItems) {
            // Se o item tiver uma posição válida, coloca-o no array
            if (invItem.position != null && invItem.position < 12) {
                inventory[invItem.position] = {
                    name: invItem.Item.name,
                    quantity: invItem.quantity
                };
            }
        }
        socket.emit('player:updateInventory', inventory);
    });

    // --- FUNCIONALIDADE DO BOTÃO "ATRIBUTOS" ---
    socket.on('player:getAttributes', () => {
        // Pega os stats base que já buscámos quando o jogador entrou
        const stats = socket.data.characterDetails?.CharacterStat;

        if (stats) {
            // Envia os atributos de volta para o cliente
            // O formato {str, int, dex, con} já é o esperado
            socket.emit('player:showAttributes', stats);
        } else {
             console.warn(`[PlayerHandler] Socket ${socket.id} pediu atributos, mas não foram encontrados.`);
             socket.emit('player:showAttributes', null); // Envia nulo para o cliente
        }
    });
}