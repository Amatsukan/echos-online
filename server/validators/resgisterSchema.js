import Joi from 'joi';

// Define o modelo para a criação de conta.
export const registerSchema = Joi.object({
    // Podes adicionar regras mais estritas (ex: alphanum())
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).max(50).required()
});