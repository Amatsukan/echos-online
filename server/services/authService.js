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
            // --- CORREÇÃO AQUI ---
            // Inclui os stats base (str, int, etc.)
            // Em vez de passar o objeto ENUM (BasicStats), passamos
            // um array de strings com os nomes das colunas.
            { model: CharacterStats, attributes: ['str', 'int', 'dex', 'con'] },
            // --- FIM DA CORREÇÃO ---
            
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


// --- NOVAS FUNÇÕES ADICIONADAS ABAIXO ---

/**
 * Cria uma nova conta de utilizador.
 */
export async function createAccount(username, password) {
    console.log(`[AuthService] Tentativa de registo para: ${username}`);
    
    // 1. Verifica se a conta já existe
    const existingAccount = await Account.findOne({ where: { username: username } });
    if (existingAccount) {
        return { success: false, error: 'Esse nome de usuário já existe.' };
    }

    // 2. Cria a nova conta
    try {
        // O 'password' é passado para 'passwordHash' e o hook beforeCreate (em Account.js)
        // irá automaticamente fazer o hash antes de salvar.
        const newAccount = await Account.create({
            username: username,
            passwordHash: password // O hook trata disto
        });
        
        return { success: true, data: { id: newAccount.id, username: newAccount.username } };

    } catch (error) {
        console.error(`[AuthService] Erro ao criar conta: ${error.message}`);
        return { success: false, error: 'Erro ao criar a conta no banco de dados.' };
    }
}

/**
 * Busca todas as classes jogáveis disponíveis.
 */
export async function getAvailableClasses() {
    console.log(`[AuthService] Buscando lista de classes disponíveis...`);
    try {
        const classes = await Class.findAll({
            attributes: ['id', 'name']
        });
        return classes.map(cls => cls.toJSON());
    } catch (error) {
        console.error(`[AuthService] Erro ao buscar classes: ${error.message}`);
        return [];
    }
}

/**
 * Cria um novo personagem para uma conta.
 */
export async function createCharacter(accountId, name, classId) {
    console.log(`[AuthService] Tentativa de criar personagem '${name}' (Classe ID: ${classId}) para conta ${accountId}`);
    
    // 1. Verifica limite de personagens (ex: 3 por conta)
    const charCount = await Character.count({ where: { accountId: accountId } });
    if (charCount >= 3) {
        return { success: false, error: 'Limite de personagens (3) atingido.' };
    }

    // 2. Verifica se o nome do personagem já existe
    const existingName = await Character.findOne({ where: { name: name } });
    if (existingName) {
        return { success: false, error: 'Esse nome de personagem já existe.' };
    }

    // 3. Define stats base com base na classe (Podes personalizar isto!)
    let baseHp = 50, baseMp = 50;
    let baseStats = { str: 5, int: 5, dex: 5, con: 5 };

    const className = (await Class.findByPk(classId))?.name;

    if (className === 'Bárbaro') {
        baseHp = 100; baseMp = 20;
        baseStats = { str: 10, int: 3, dex: 5, con: 8 };
    } else if (className === 'Matemágico') {
        baseHp = 60; baseMp = 80;
        baseStats = { str: 3, int: 10, dex: 5, con: 6 };
    } else if (className === 'Bardo') {
        baseHp = 70; baseMp = 50;
        baseStats = { str: 5, int: 8, dex: 8, con: 7 };
    } else {
        return { success: false, error: 'Classe inválida selecionada.' };
    }

    // 4. Cria o personagem e os stats no banco de dados
    try {
        // Cria o personagem principal
        const newCharacter = await Character.create({
            accountId: accountId,
            name: name,
            classId: classId,
            level: 1,
            hp: baseHp,
            maxHp: baseHp,
            mp: baseMp,
            maxMp: baseMp
        });

        // Cria a entrada de stats associada
        await CharacterStats.create({
            ...baseStats,
            characterId: newCharacter.id
        });
        
        return { success: true, data: newCharacter.toJSON() };

    } catch (error) {
        console.error(`[AuthService] Erro ao criar personagem: ${error.message}`);
        return { success: false, error: 'Erro ao salvar o personagem no banco de dados.' };
    }
}