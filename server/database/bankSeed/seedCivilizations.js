import { Civilization } from "../../models/index.js"

export default async function seed_civilizations()
{
    return [ 
        await seed('Nórdicos'), 
        await seed('Árabes'), 
        await seed('Celtas')
    ]
}
async function seed(name)
{
    try
    { 
        return await Civilization.create({ name });
    } 
    catch(err) 
    {
        console.error("[SEED BANK] Erro ao semear civilização",name,"no banco de dados:", err);
        process.exit(1)
    }
}