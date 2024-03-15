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
    effects: []
})