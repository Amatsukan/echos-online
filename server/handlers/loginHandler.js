import { authenticateUser, getCharactersByAccountId, createAccount } from '../services/authService.js';
import { loginSchema } from '../validators/loginSchema.js';
import { registerSchema } from '../validators/resgisterSchema.js';

export function registerLoginHandler(socket) {
    
    socket.on('login:attempt', async (data) => {
        console.log(`[LoginHandler] Recebido 'login:attempt' do socket ${socket.id}`);
        
        const { error, value } = loginSchema.validate(data);

        if (error) {
            console.warn(`[LoginHandler] Pacote inválido de ${socket.id}: ${error.message}`);
            socket.emit('login:fail', { message: 'Dados de login inválidos.' });
            return;
        }

        // 1. Autentica usando o novo authService (que usa Account)
        const authResult = await authenticateUser(value.username, value.password);

        if (!authResult.success) {
            socket.emit('login:fail', { message: authResult.error });
            return;
        }
        
        socket.data.accountId = authResult.data.id;
        socket.data.username = authResult.data.username;

        // 2. Busca personagens (que agora inclui o nome da Classe)
        const characters = await getCharactersByAccountId(authResult.data.id);

        console.log(`[LoginHandler] Usuário '${socket.data.username}' logado com sucesso.`);
        
        // 3. Envia os dados para o character-select.html
        // O formato de 'characters' [{id, name, level, class}] 
        // já é o esperado pelo cliente.
        socket.emit('login:success', { 
            accountId: authResult.data.id,
            username: authResult.data.username,
            characters: characters 
        });
    });

    // 2. ADICIONAR NOVO OUVINTE PARA REGISTO
    socket.on('register:attempt', async (data) => {
        console.log(`[LoginHandler] Recebido 'register:attempt' do socket ${socket.id}`);
        
        const { error, value } = registerSchema.validate(data);

        if (error) {
            console.warn(`[LoginHandler] Pacote de registo inválido de ${socket.id}: ${error.message}`);
            socket.emit('register:fail', { message: 'Dados de registo inválidos.' });
            return;
        }

        // 1. Tenta criar a conta usando o authService
        const registerResult = await createAccount(value.username, value.password);

        if (!registerResult.success) {
            socket.emit('register:fail', { message: registerResult.error });
            return;
        }

        console.log(`[LoginHandler] Usuário '${registerResult.data.username}' registado com sucesso.`);
        
        // 2. Envia sucesso de volta ao cliente
        socket.emit('register:success', { 
            message: 'Conta criada com sucesso!'
        });
    });
}