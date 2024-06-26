const CONSTS = require('../../../../consts')

const { vampireTypeBehavior } = require('../common/vampire-type-behavior')

function main (ev) {
    const {
        manager,
        creature,
        action,
        combat
    } = ev
    // Is the target charmed ?
    const target = combat.defender
    if (target.getters.getSpecie.ref === CONSTS.SPECIE_HUMANOID) {
        const sAction = vampireTypeBehavior({
            combat,
            creature,
            target,
            charm: 'gaze',
            drain: 'kiss',
            attack: 'claws'
        })
        if (sAction) {
            action(sAction)
        }
    } else {
        action('claws')
    }
}
module.exports = main
