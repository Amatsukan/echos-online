import Joi from 'joi';

export const characterCreateSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    classId: Joi.number().integer().positive().required()
});