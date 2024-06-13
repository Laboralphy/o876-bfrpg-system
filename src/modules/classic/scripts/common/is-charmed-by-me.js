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

module.exports = {
    isCharmedByMe: isCreatureCharmedByMe
}