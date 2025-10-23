import { authenticateUser, getCharactersByAccountId } from '../services/authService.js';
import { loginSchema } from '../validators/loginSchema.js';

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
}