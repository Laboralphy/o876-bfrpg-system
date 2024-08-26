const CONSTS = require('../../consts')

/**
 * Retursna registry of thing that can do a creature
 * @param state
 * @param getters
 * @return {{act: boolean, fight: boolean, move: boolean, see: boolean, cast: { self: boolean, target: boolean } }}
 */
module.exports = (state, getters) => {
    const aConditionSet = getters.getConditionSet
    const alive = !getters.isDead
    const act = alive && !(
        aConditionSet.has(CONSTS.CONDITION_STUNNED) ||
        aConditionSet.has(CONSTS.CONDITION_PARALYZED) ||
        aConditionSet.has(CONSTS.CONDITION_PETRIFIED) ||
        aConditionSet.has(CONSTS.CONDITION_INCAPACITATED)
    )
    const fight = alive && act && !aConditionSet.has(CONSTS.CONDITION_DAZED)
    const move = alive && act && aConditionSet.has(CONSTS.CONDITION_RESTRAINED)
    const see = alive && !aConditionSet.has(CONSTS.CONDITION_BLINDED)
    const castSelf = alive && act && !aConditionSet.has(CONSTS.CONDITION_DAZED)
    const castTarget = alive && castSelf && see
    const cast = {
        self: castSelf,
        target: castTarget
    }
    const sClassTypeRef = getters.getClassTypeData.ref
    const sneak = alive && (
        sClassTypeRef === CONSTS.CLASS_TYPE_ROGUE ||
        sClassTypeRef === CONSTS.CLASS_TYPE_ROGUE_MAGIC_USER
    )
    return {
        act,
        move,
        cast,
        fight,
        see,
        sneak
    }
}
