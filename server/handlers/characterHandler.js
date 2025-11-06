import { getAvailableClasses, createCharacter, getCharactersByAccountId } from '../services/authService.js';
import { characterCreateSchema } from '../validators/characterCreateSchema.js';

const handleGetClasses = async (socket) => {
    const classes = await getAvailableClasses();
    socket.emit('character:classList', classes);
};

const validateCharacterCreation = (socket, data) => {
    const accountId = socket.data.accountId;
    if (!accountId) {
        return { error: 'Utilizador não autenticado.', value: null };
    }

    const { error, value } = characterCreateSchema.validate(data);
    if (error) {
        return { error: `Dados inválidos: ${error.message}`, value: null };
    }

    return { error: null, value, accountId };
};

const createCharacterAndUpdateClient = async (socket, accountId, name, classId) => {
    const createResult = await createCharacter(accountId, name, classId);

    if (!createResult.success) {
        socket.emit('character:createFail', { message: createResult.error });
        return;
    }

    console.log(`[CharHandler] Personagem '${name}' criado para a conta ${accountId}`);

    const characters = await getCharactersByAccountId(accountId);
    socket.emit('account:updateCharacters', {
        accountId: accountId,
        username: socket.data.username,
        characters: characters,
    });
};

const handleCharacterCreateAttempt = async (socket, data) => {
    const { error, value, accountId } = validateCharacterCreation(socket, data);

    if (error) {
        socket.emit('character:createFail', { message: error });
        return;
    }

    await createCharacterAndUpdateClient(socket, accountId, value.name, value.classId);
};

export function registerCharacterHandler(socket) {
    socket.on('character:getClasses', () => handleGetClasses(socket));
    socket.on('character:createAttempt', (data) => handleCharacterCreateAttempt(socket, data));
}
