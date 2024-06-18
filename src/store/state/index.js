const CONSTS = require('../../consts')

/**
 * @typedef BFStoreStateGauges {Object}
 * @property hitPoints {number}
 *
 * @typedef BFStoreStateAction {object}
 * @property name {string}
 * @property attackType {string}
 * @property damageType: {string}
 * @property count {number}
 * @property cooldown {number}
 * @property conveys {{ script: string data: {} }[]}
 * @property damage {string|number}
 *
 * @typedef BFStoreState {object}
 * @property abilities {Object<string, number>}
 * @property classType {string}
 * @property specie {string}
 * @property speed {number}
 * @property race {string}
 * @property naturalArmorClass {number}
 * @property level {number}
 * @property actions {object<string, BFStoreStateAction>}
 * @property selectedAction {string}
 * @property gauges {BFStoreStateGauges}
 * @property effect {BFEffect[]}
 * @property properties {BFItemProperty[]}
 * @property offensiveSlot {string}
 * @property equipment {{}}
 * @property encumbrance {number}
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
    speed: 30,
    race: 'RACE_UNKNOWN',
    naturalArmorClass: 11,
    level: 1,
    actions: {
    },
    selectedAction: CONSTS.DEFAULT_ACTION_WEAPON,
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
        [CONSTS.EQUIPMENT_SLOT_FEET]: null
    },
    encumbrance: 0
})