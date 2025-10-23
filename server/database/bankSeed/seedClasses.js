
import { Class } from "../../models/index.js"

async function seedClass(classData) {
    try {
        return await Class.create(classData);
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear classe ${classData.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_classes(civilizations) {
    const civMap = civilizations.reduce((acc, civ) => {
        acc[civ.name] = civ.id;
        return acc;
    }, {});

    const classes = [
        { name: 'Bárbaro', civilizationId: civMap['Nórdicos'] },
        { name: 'Matemágico', civilizationId: civMap['Árabes'] },
        { name: 'Bardo', civilizationId: civMap['Celtas'] },
    ];

    const promises = classes.map(seedClass);
    const createdClasses = await Promise.all(promises);

    // Return a map for easy lookup
    return createdClasses.reduce((acc, charClass) => {
        acc[charClass.name] = charClass;
        return acc;
    }, {});
}
