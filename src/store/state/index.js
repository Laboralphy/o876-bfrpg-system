const CONSTS = require('../../consts')

/**
 * @typedef BFStoreStateGauges {Object}
 * @property hitPoints {number}
 *
 * @typedef BFStoreStateAction {object}
 * @property attackType {string}
 * @property count {number}
 * @property conveys {{ script: string data: {} }[]}
 * @property amp {string|number}
 *
 * @typedef BFStoreStateMonsterData {object}
 * @property actions {object<string, BFStoreStateAction>}
 * @property saveAs {{ classType: string, level: number }}
 *
 *
 * @typedef BFStoreState {object}
 * @property abilities {Object<string, number>}
 * @property classType {string}
 * @property specie {string}
 * @property speed {number}
 * @property race {string}
 * @property naturalArmorClass {number}
 * @property level {number}
 * @property monsterData {BFStoreStateMonsterData}
 * @property gauges {BFStoreStateGauges}
 * @property effect {BFEffect[]}
 * @property properties {BFItemProperty[]}
 * @property offensiveSlot {string}
 * @property equipment {{}}
 * @property recentDamages {{ type:string, amount:number, resisted:number, source:string }[]}
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
    race: 'RACE_HUMAN',
    naturalArmorClass: 11,
    level: 1,
    monsterData: {
        saveAs: {
            classType: 'CLASS_TYPE_FIGHTER',
            levelAdjust: 0
        },
        actions: {
        },
        selectedAction: CONSTS.DEFAULT_ACTION_WEAPON,
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
        [CONSTS.EQUIPMENT_SLOT_FEET]: null
    },
    recentDamages: []
})