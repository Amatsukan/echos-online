
import { DataTypes } from 'sequelize';

export const EquipmentSlotEnum = {
    HEAD: '1',
    CHEST: '2',
    LEGS: '3',
    FEET: '4',
    CAPE: '5',
    OFF_HAND: '6',
    AUX_1: '7',
    NECK: '8',
    MAIN_HAND: '9',
    AUX_2: '0'
};

const EquipmentSlots = DataTypes.ENUM(...Object.values(EquipmentSlotEnum));

export default EquipmentSlots;
