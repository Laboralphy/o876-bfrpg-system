const CONSTS = require('../../consts')

/**
 * @typedef BFStoreStateGauges {Object}
 * @property hitPoints {number}
 *
 * @typedef BFStoreState {object}
 * @property abilities {Object<string, number>}
 * @property classType {string}
 * @property level {number}
 * @property gauges {BFStoreStateGauges}
 * @property effect {[]}
 */

/**
 *
 * @returns {BFStoreState}
 */
module.exports = () => ({
    abilities: {
        [CONSTS.ABILITY_STRENGTH]: 10,
        [CONSTS.ABILITY_DEXTERITY]: 10,
        [CONSTS.ABILITY_CONSTITUTION]: 10,
        [CONSTS.ABILITY_INTELLIGENCE]: 10,
        [CONSTS.ABILITY_WISDOM]: 10,
        [CONSTS.ABILITY_CHARISMA]: 10,
    },
    classType: 'CLASS_TYPE_TOURIST',
    specie: 'SPECIE_HUMANOID',
    race: 'RACE_HUMAN',
    naturalArmorClass: 10,
    level: 1,
    monsterData: {
        saveAs: {
            classType: 'CLASS_TYPE_FIGHTER',
            levelAdjust: 0
        },
        actions: []
    },
    gauges: {
        hitPoints: 1
    },
    effects: [],
    properties: [],
    offensiveSlot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE,
    equipment: {
        [CONSTS.EQUIPMENT_SLOT_HEAD]: null,
        [CONSTS.EQUIPMENT_SLOT_NECK]: null,
        [CONSTS.EQUIPMENT_SLOT_CHEST]: null,
        [CONSTS.EQUIPMENT_SLOT_BACK]: null,
        [CONSTS.EQUIPMENT_SLOT_ARMS]: null,
        [CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]: null,
        [CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]: null,
        [CONSTS.EQUIPMENT_SLOT_SHIELD]: null,
        [CONSTS.EQUIPMENT_SLOT_FINGER_LEFT]: null,
        [CONSTS.EQUIPMENT_SLOT_FINGER_RIGHT]: null,
        [CONSTS.EQUIPMENT_SLOT_AMMO]: null,
        [CONSTS.EQUIPMENT_SLOT_WAIST]: null,
        [CONSTS.EQUIPMENT_SLOT_FEET]: null,
        [CONSTS.EQUIPMENT_SLOT_NATURAL_WEAPON_0]: null,
        [CONSTS.EQUIPMENT_SLOT_NATURAL_WEAPON_1]: null,
        [CONSTS.EQUIPMENT_SLOT_NATURAL_WEAPON_2]: null
    }
})