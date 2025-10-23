import BasicStats from '../models/Enums/BasicStats.js';
import { Account, Character, Class, CharacterStats, CharacterEquipment, InventoryItem, Item } from '../models/index.js';

/**
 * Autentica um utilizador.
 */
export async function authenticateUser(username, password) {
    console.log(`[AuthService] Tentativa de login para: ${username}`);
    
    // 1. Encontra a conta (Account) no banco de dados
    const account = await Account.findOne({ where: { username: username } });

    if (!account) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    // 2. Compara a senha
    const isValid = await account.comparePassword(password);

    if (!isValid) {
        return { success: false, error: 'Senha incorreta.' };
    }

    return { success: true, data: { id: account.id, username: account.username } };
}

/**
 * Busca os personagens (preview) de uma conta.
 */
export async function getCharactersByAccountId(accountId) {
    console.log(`[AuthService] Buscando personagens para a conta ID: ${accountId}`);
    
    const characters = await Character.findAll({
        where: { accountId: accountId },
        // Faz o "join" com a tabela Class para podermos mostrar o nome da classe
        include: {
            model: Class,
            attributes: ['name'] // Só queremos o nome da classe
        },
        attributes: ['id', 'name', 'level'] // Do personagem, só queremos isto
    });

    // Transforma os dados complexos do Sequelize em JSON simples
    return characters.map(char => {
        const charJSON = char.toJSON();
        return {
            id: charJSON.id,
            name: charJSON.name,
            level: charJSON.level,
            class: charJSON.Class ? charJSON.Class.name : 'Sem Classe' // Mapeia Class.name para "class"
        };
    });
}

/**
 * Busca os detalhes COMPLETOS de um personagem específico.
 */
export async function getCharacterDetailsById(characterId) {
    console.log(`[AuthService] Buscando detalhes para o personagem ID: ${characterId}`);
    
    // Busca o personagem e faz "include" (join) de todas as tabelas relacionadas
    const character = await Character.findByPk(characterId, {
        include: [
            // Inclui os stats base (str, int, etc.)
            { model: CharacterStats, attributes: BasicStats },
            // Inclui os itens equipados
            { 
                model: CharacterEquipment,
                attributes: ['slot'], // Do equipamento, só queremos o slot
                include: { model: Item, attributes: ['name'] } // Do item, só queremos o nome
            },
            // Inclui os itens do inventário
            {
                model: InventoryItem,
                attributes: ['quantity', 'position'], // Do item de inventário, queremos isto
                include: { model: Item, attributes: ['name'] } // E o nome do item
            }
        ]
    });

    if (!character) {
        return null;
    }
    
    return character.toJSON();
}