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

function main ({
    manager,
    creature,
    action,
    target,
    combat
}) {
    // Is the target charmed ?
    if (isCreatureCharmedByMe(target, creature)) {
        // yes : go for level draining kiss
        action('kiss')
        return
    }
    // no : try to charm, if fail, then retry next odd-turn, if fail again, uses claws
    if (combat.turn % 2 === 0 && combat.turn < 5) {
        action('gaze')
        return
    }
    if (combat.nextActionName !== combat.defaultActionWeapon.name) {
        action('claws')
    }
}

module.exports = main
