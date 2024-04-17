const CONSTS = require('../../consts')

/**
 * Return a Set of conditions afflicting the creature
 * @param state
 * @param getters
 * @return {Set<string>}
 */
module.exports = (state, getters) => {
    const aConditionSet = new Set()
    getters.getEffects.forEach(effect => {
        switch (effect.type) {
            case CONSTS.EFFECT_DAMAGE: {
                if (effect.data.type === CONSTS.DAMAGE_TYPE_POISON) {
                    aConditionSet.add(CONSTS.CONDITION_POISONED)
                }
                break
            }

            case CONSTS.EFFECT_STUN: {
                aConditionSet.add(CONSTS.CONDITION_STUNNED)
                break
            }
        }
    })
    return aConditionSet
}