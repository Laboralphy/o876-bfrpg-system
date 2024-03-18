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
        [CONSTS.ABILITY_STRENGTH]: 1,
        [CONSTS.ABILITY_DEXTERITY]: 1,
        [CONSTS.ABILITY_CONSTITUTION]: 1,
        [CONSTS.ABILITY_INTELLIGENCE]: 1,
        [CONSTS.ABILITY_WISDOM]: 1,
        [CONSTS.ABILITY_CHARISMA]: 1,
    },
    classType: 'CLASS_TYPE_FIGHTER',
    level: 1,
    gauges: {
        hitPoints: 1
    },
    effects: [],
    properties: [],
    equipment: {
        [CONSTS.EQUIPMENT_SLOT_HEAD]: null,
        [CONSTS.EQUIPMENT_SLOT_NECK]: null,
        [CONSTS.EQUIPMENT_SLOT_CHEST]: null,
        [CONSTS.EQUIPMENT_SLOT_BACK]: null,
        [CONSTS.EQUIPMENT_SLOT_ARMS]: null,
        [CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]: null,
        [CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]: null,
        [CONSTS.EQUIPMENT_SLOT_SHIELD]: null,
        [CONSTS.EQUIPMENT_SLOT_LEFT_FINGER]: null,
        [CONSTS.EQUIPMENT_SLOT_RIGHT_FINGER]: null,
        [CONSTS.EQUIPMENT_SLOT_AMMO]: null,
        [CONSTS.EQUIPMENT_SLOT_WAIST]: null,
        [CONSTS.EQUIPMENT_SLOT_FEET]: null
    }
})