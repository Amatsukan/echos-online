import { getAvailableClasses, createCharacter, getCharactersByAccountId } from '../services/authService.js';
import { characterCreateSchema } from '../validators/characterCreateSchema.js';

// Certifica-te que a função aceita 'socket' como parâmetro
export function registerCharacterHandler(socket) {

    // Ouve o pedido do cliente (character-create.html) pela lista de classes
    socket.on('character:getClasses', async () => {
        // Se 'socket' for undefined aqui, a função acima não o recebeu.
        const classes = await getAvailableClasses();
        socket.emit('character:classList', classes);
    });

    // Ouve a tentativa de criar um novo personagem
    socket.on('character:createAttempt', async (data) => {
        const accountId = socket.data.accountId;

        // Se o utilizador não estiver logado (sem accountId no socket), rejeita.
        if (!accountId) {
            socket.emit('character:createFail', { message: 'Utilizador não autenticado.' });
            return;
        }

        // 1. Valida os dados recebidos (nome, classId)
        const { error, value } = characterCreateSchema.validate(data);
        if (error) {
            socket.emit('character:createFail', { message: `Dados inválidos: ${error.message}` });
            return;
        }

        // 2. Tenta criar o personagem no serviço
        const createResult = await createCharacter(
            accountId,
            value.name,
            value.classId
        );

        if (!createResult.success) {
            socket.emit('character:createFail', { message: createResult.error });
            return;
        }

        // 3. SUCESSO!
        console.log(`[CharHandler] Personagem '${value.name}' criado para a conta ${accountId}`);

        // 4. Precisamos de enviar a lista de personagens ATUALIZADA de volta.
        const characters = await getCharactersByAccountId(accountId);

        // Emite a nova lista para o 'accountInfo'
        socket.emit('account:updateCharacters', {
            accountId: accountId,
            username: socket.data.username, // Pega o username guardado no socket
            characters: characters
        });
    });
}