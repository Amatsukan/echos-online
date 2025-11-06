import { authenticateUser, getCharactersByAccountId, createAccount } from '../services/authService.js';
import { loginSchema } from '../validators/loginSchema.js';
import { registerSchema } from '../validators/resgisterSchema.js';

const validateAndAuthenticate = async (username, password) => {
    return await authenticateUser(username, password);
};

const validateAndRegister = async (username, password) => {
    return await createAccount(username, password);
};

const sendLoginSuccess = (socket, authResult, characters) => {
    socket.emit('login:success', {
        accountId: authResult.data.id,
        username: authResult.data.username,
        characters: characters,
    });
};

const sendLoginFailure = (socket, message) => {
    socket.emit('login:fail', { message });
};

const sendRegisterSuccess = (socket, message) => {
    socket.emit('register:success', { message });
};

const sendRegisterFailure = (socket, message) => {
    socket.emit('register:fail', { message });
};

const handleLoginAttempt = async (socket, data) => {
    console.log(`[LoginHandler] Recebido 'login:attempt' do socket ${socket.id}`);
    const { error, value } = loginSchema.validate(data);

    if (error) {
        console.warn(`[LoginHandler] Pacote inválido de ${socket.id}: ${error.message}`);
        sendLoginFailure(socket, 'Dados de login inválidos.');
        return;
    }

    const authResult = await validateAndAuthenticate(value.username, value.password);

    if (!authResult.success) {
        sendLoginFailure(socket, authResult.error);
        return;
    }

    socket.data.accountId = authResult.data.id;
    socket.data.username = authResult.data.username;

    const characters = await getCharactersByAccountId(authResult.data.id);
    console.log(`[LoginHandler] Usuário '${socket.data.username}' logado com sucesso.`);
    sendLoginSuccess(socket, authResult, characters);
};

const handleRegisterAttempt = async (socket, data) => {
    console.log(`[LoginHandler] Recebido 'register:attempt' do socket ${socket.id}`);
    const { error, value } = registerSchema.validate(data);

    if (error) {
        console.warn(`[LoginHandler] Pacote de registo inválido de ${socket.id}: ${error.message}`);
        sendRegisterFailure(socket, 'Dados de registo inválidos.');
        return;
    }

    const registerResult = await validateAndRegister(value.username, value.password);

    if (!registerResult.success) {
        sendRegisterFailure(socket, registerResult.error);
        return;
    }

    console.log(`[LoginHandler] Usuário '${registerResult.data.username}' registado com sucesso.`);
    sendRegisterSuccess(socket, 'Conta criada com sucesso!');
};

export function registerLoginHandler(socket) {
    socket.on('login:attempt', (data) => handleLoginAttempt(socket, data));
    socket.on('register:attempt', (data) => handleRegisterAttempt(socket, data));
}
