import { EquipmentSlotEnum } from '../../../models/Enums/EquipmentSlots.js';

export const characterData = [
    {
        main: { name: 'Thorin', level: 10, hp: 80, maxHp: 100, mp: 20, maxMp: 20 },
        account: 'jogador1',
        class: 'Bárbaro',
        stats: { str: 15, int: 5, dex: 8, con: 12 },
        equipment: [
            { itemName: 'Elmo de Ferro', slot: EquipmentSlotEnum.HEAD },
            { itemName: 'Peitoral de Aço', slot: EquipmentSlotEnum.CHEST },
            { itemName: 'Espada Longa', slot: EquipmentSlotEnum.MAIN_HAND },
            { itemName: 'Calças de Couro', slot: EquipmentSlotEnum.LEGS },
            { itemName: 'Botas Velhas', slot: EquipmentSlotEnum.FEET },
        ],
        inventory: [
            { itemName: 'Maçã', quantity: 5, position: 0 },
            { itemName: 'Poção de HP', quantity: 10, position: 2 },
        ],
    },
    {
        main: { name: 'Elara', level: 8, hp: 50, maxHp: 50, mp: 80, maxMp: 80 },
        account: 'jogador1',
        class: 'Matemágico',
        stats: { str: 4, int: 18, dex: 7, con: 6 },
        equipment: [
            { itemName: 'Cajado Básico', slot: EquipmentSlotEnum.MAIN_HAND },
            { itemName: 'Manto Simples', slot: EquipmentSlotEnum.CAPE },
        ],
        inventory: [
            { itemName: 'Poção de MP', quantity: 15, position: 0 },
        ],
    },
    {
        main: { name: 'Shadow', level: 12, hp: 65, maxHp: 65, mp: 30, maxMp: 30 },
        account: 'admin',
        class: 'Bardo',
        stats: { str: 9, int: 8, dex: 16, con: 9 },
        equipment: [
            { itemName: 'Armadura de Couro', slot: EquipmentSlotEnum.CHEST },
            { itemName: 'Adaga Afiada', slot: EquipmentSlotEnum.MAIN_HAND },
            { itemName: 'Adaga Curta', slot: EquipmentSlotEnum.OFF_HAND },
        ],
        inventory: [
            { itemName: 'Gazuas', quantity: 3, position: 0 },
        ],
    },
];