import Joi from 'joi';

// Define o modelo exato que a mensagem 'login:attempt' deve ter.
// O cliente DEVE enviar um objeto com 'username' e 'password'.
// Ambos devem ser strings e são obrigatórios.
export const loginSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(50).required()
});