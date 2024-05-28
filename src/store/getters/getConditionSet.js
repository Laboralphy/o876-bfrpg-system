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
                if (effect.data.damageType === CONSTS.DAMAGE_TYPE_POISON) {
                    aConditionSet.add(CONSTS.CONDITION_POISONED)
                }
                break
            }

            case CONSTS.EFFECT_STUN: {
                aConditionSet.add(CONSTS.CONDITION_STUNNED)
                break
            }

            case CONSTS.EFFECT_DAZE: {
                aConditionSet.add(CONSTS.CONDITION_DAZED)
                break
            }

            case CONSTS.EFFECT_CHARM: {
                aConditionSet.add(CONSTS.CONDITION_CHARMED)
                break
            }

            case CONSTS.EFFECT_PARALYSIS: {
                aConditionSet.add(CONSTS.CONDITION_PARALYZED)
                break
            }

            case CONSTS.EFFECT_PETRIFICATION: {
                aConditionSet.add(CONSTS.CONDITION_PETRIFIED)
                break
            }

            case CONSTS.EFFECT_SPEED_MODIFIER: {
                if (effect.amp <= 0) {
                    if (getters.getSpeed <= 0) {
                        aConditionSet.add(CONSTS.CONDITION_RESTRAINED)
                    }
                }
                break
            }

            case CONSTS.EFFECT_BLINDNESS: {
                aConditionSet.add(CONSTS.CONDITION_BLINDED)
                break
            }

            case CONSTS.EFFECT_DISEASE: {
                aConditionSet.add(CONSTS.CONDITION_DISEASE)
                break
            }
        }
    })
    if (getters.getHitPoints <= 0) {
        aConditionSet.add(CONSTS.CONDITION_INCAPACITATED)
    }
    return aConditionSet
}