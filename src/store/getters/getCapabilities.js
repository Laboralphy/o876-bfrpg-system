const CONSTS = require('../../consts')

/**
 * Retursna registry of thing that can do a creature
 * @param state
 * @param getters
 * @return {{act: boolean, attack: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 */
module.exports = (state, getters) => {
    const aConditionSet = getters.getConditionSet
    const act = !(
        aConditionSet.has(CONSTS.CONDITION_STUNNED) ||
        aConditionSet.has(CONSTS.CONDITION_PARALYZED) ||
        aConditionSet.has(CONSTS.CONDITION_PETRIFIED) ||
        aConditionSet.has(CONSTS.CONDITION_INCAPACITATED)
    )
    const fight = act && !aConditionSet.has(CONSTS.CONDITION_DAZED)
    const move = act && aConditionSet.has(CONSTS.CONDITION_RESTRAINED)
    const see = !aConditionSet.has(CONSTS.CONDITION_BLINDED)
    const castSelf = act && !aConditionSet.has(CONSTS.CONDITION_DAZED)
    const castTarget = castSelf && see
    const cast = {
        self: castSelf,
        target: castTarget
    }

    return {
        act,
        move,
        cast,
        fight,
        see
    }
}
