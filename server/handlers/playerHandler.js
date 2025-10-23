import { getCharacterDetailsById } from '../services/authService.js';
// (NOVO/VERIFICAR) Importar Character para aceder ao defaultValue
import { Character, CharacterStats } from '../models/index.js'; 
import { mapService } from '../services/mapService.js';
// Importa a função do visibility handler
import { handlePlayerJoin } from './visibilityHandler.js';

// Define o alcance da visão (em tiles) - movido para visibilityHandler, mas pode ser útil ter aqui temporariamente se precisar
// const VISION_RANGE = 20; // Um quadrado de 40x40 centrado no jogador

// Remove 'io' dos parâmetros
export function registerPlayerHandler(socket) {

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
            // (Opcional: Enviar uma mensagem de erro para o cliente?)
            // socket.emit('player:join:fail', { message: 'Personagem não encontrado.' });
            return;
        }

        // 2. GUARDA OS DADOS NO SOCKET
        socket.data.characterId = characterId;
        socket.data.characterDetails = charDetails; 
        
        let startPos; // Define startPos aqui
        
        // --- VERIFICAÇÃO IMPORTANTE ---
        // Garante que 'charDetails' tem 'x' e 'y' antes de usá-los
        if (typeof charDetails.x !== 'number' || typeof charDetails.y !== 'number' || isNaN(charDetails.x) || isNaN(charDetails.y)) {
             console.error(`### ERRO CRÍTICO no playerHandler: charDetails para ID ${characterId} não contém x ou y válidos!`, charDetails);
             // Usa o spawn padrão seguro do modelo Character
             try {
                // Acede aos atributos do modelo para obter o defaultValue
                const defaultX = Character.getAttributes().x.defaultValue;
                const defaultY = Character.getAttributes().y.defaultValue;
                startPos = { x: defaultX, y: defaultY };
                console.warn(`[PlayerHandler] Usando posição de spawn padrão (${startPos.x},${startPos.y}) para ${characterId}`);
             } catch (modelError) {
                 // Fallback ainda mais seguro se houver erro ao buscar defaultValue
                 console.error("[PlayerHandler] Erro ao buscar defaultValue do modelo Character:", modelError);
                 startPos = { x: 24, y: 24 }; // Usa um valor hardcoded seguro
                 console.warn(`[PlayerHandler] Usando posição de spawn hardcoded segura (24,24) para ${characterId}`);
             }
        } else {
            // Usa as coordenadas vindas do banco de dados
            startPos = { x: charDetails.x, y: charDetails.y };
        }
        socket.data.characterPosition = startPos; // Define a posição no socket
        // --- FIM DA VERIFICAÇÃO ---
        
        console.log(`[PlayerHandler] Personagem ${characterId} (${charDetails.name || 'Nome não encontrado'}) (Socket: ${socket.id}) entrou no mundo em [${startPos.x}, ${startPos.y}].`);

        // 3. ENVIA O MAPA PARA O CLIENTE
        socket.emit('map:load', {
            mapData: mapService.getMap(),
            tileSize: mapService.TILE_SIZE
        });

        // 4. ENVIA OS DADOS DE SPAWN PARA O JOGADOR (Usando o 'startPos' verificado)
        socket.emit('player:spawn', {
            characterId: characterId,
            x: startPos.x, // Garante que envia os valores corretos
            y: startPos.y
            // (Futuro) Adicionar mais dados se necessário (nome, sprite, etc.)
        });
        
        // (NOVO) Chama o visibility handler para cuidar da lógica AoI
        handlePlayerJoin(socket); 

        // 6. TRANSFORMA os dados para a UI (stats, inventário, etc.)
        // a) Stats (HP/MP)
        const stats = {
            hp: charDetails.hp,
            maxHp: charDetails.maxHp,
            mp: charDetails.mp,
            maxMp: charDetails.maxMp
        };
        socket.emit('player:updateStats', stats);

        // b) Equipamentos
        // Verifica se CharacterEquipments existe e é um array
        const equipment = Array.isArray(charDetails.CharacterEquipments) 
            ? charDetails.CharacterEquipments.reduce((acc, eq) => {
                // Verifica se o item dentro do equipamento existe
                if (eq && eq.Item && eq.Item.name) {
                    acc[eq.slot] = eq.Item.name;
                }
                return acc;
              }, {})
            : {}; // Retorna objeto vazio se não houver equipamentos
        socket.emit('player:updateEquipment', equipment);

        // c) Inventário
        const inventory = new Array(12).fill(null);
        // Verifica se InventoryItems existe e é um array
        if (Array.isArray(charDetails.InventoryItems)) {
            for (const invItem of charDetails.InventoryItems) {
                // Verifica se o item e suas propriedades existem
                if (invItem && invItem.Item && invItem.Item.name && invItem.position != null && invItem.position < 12) {
                    inventory[invItem.position] = {
                        name: invItem.Item.name,
                        quantity: invItem.quantity
                    };
                }
            }
        }
        socket.emit('player:updateInventory', inventory);
    });

    // --- FUNCIONALIDADE DO BOTÃO "ATRIBUTOS" ---
    socket.on('player:getAttributes', () => {
        // Pega os stats base que já buscámos quando o jogador entrou
        // Adiciona verificação se CharacterStat existe
        const stats = socket.data.characterDetails?.CharacterStat; 

        if (stats) {
            // Envia os atributos de volta para o cliente
            // O formato {str, int, dex, con} já é o esperado
            socket.emit('player:showAttributes', stats);
        } else {
             console.warn(`[PlayerHandler] Socket ${socket.id} pediu atributos, mas não foram encontrados nos dados do socket.`);
             // Informa o cliente que não foi possível buscar
             socket.emit('player:showAttributes', null); // Envia nulo para o cliente tratar
        }
    });
}