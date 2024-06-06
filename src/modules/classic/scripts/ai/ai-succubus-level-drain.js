const CONSTS = require('../../../../consts')

function isCreatureCharmedByMe (oCreature, oMe) {
    if (oCreature.getters.getConditionSet.has(CONSTS.CONDITION_CHARMED)) {
        if (oCreature.aggregateModifiers([
            CONSTS.EFFECT_CHARM
        ], {
            effectFilter: effect => effect.source === oMe.id
        }).count > 0) {
            return true
        }
    }
    return false
}

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
        if (isCreatureCharmedByMe(target, creature)) {
            // yes : go for level draining kiss
            creature.events.emit('info', { info: 'my target is charmed, i will use kiss action'})
            action('kiss')
            return
        }
        // no : try to charm, if fail, then retry next odd-turn, if fail again, uses claws
        if (combat.turn % 2 === 0 && combat.turn < 5) {
            creature.events.emit('info', { info: 'my target is not charmed, combat turn is ' + combat.turn + ' = even and < 5. i will try to charm target'})
            action('gaze')
            return
        }
        if (combat.nextActionName !== combat.defaultActionWeapon.name) {
            creature.events.emit('info', { info: 'target is hard to charm after ' + combat.turn + ' turns, using claws'})
            action('claws')
        }
    } else {
        creature.events.emit('info', { info: 'target is no humanoid : go for claws'})
        action('claws')
    }
}

module.exports = main
