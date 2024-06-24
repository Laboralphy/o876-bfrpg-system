const CONSTS = require('../../../../consts')

const TAG_GOLEM_IRON_ELEC_SLOW = 'TAG_GOLEM_IRON_ELEC_SLOW'

/**
 *
 * @param manager {Manager}
 * @param creature {Creature}
 * @param sDamageType {string}
 * @param amount {number}
 * @param resisted {number}
 */
function main ({ manager, creature, damageType: sDamageType, amount, resisted }) {
    switch (sDamageType) {
        case CONSTS.DAMAGE_TYPE_ELECTRICITY: {
            // Applique un effet de ralenti pendant 2d6 tours
            const eSlow = manager.createEffect(CONSTS.EFFECT_SPEED_FACTOR, 0.5)
            eSlow.tags.push(TAG_GOLEM_IRON_ELEC_SLOW)
            manager.applyEffect(eSlow, creature, creature.dice.evaluate('1d6'))
            break
        }

        case CONSTS.DAMAGE_TYPE_FIRE: {
            // Fire will get rid of slow effect, and will heal golem
            const nDamage = amount + resisted
            const nHealing = Math.max(1, Math.floor(nDamage / 3))
            const eHeal = manager.createEffect(CONSTS.EFFECT_HEAL, nHealing)
            manager.applyEffect(eHeal, creature)
            creature.getters.getEffects.forEach(effect => {
                if (effect.tags.includes(TAG_GOLEM_IRON_ELEC_SLOW)) {
                    manager.dispelEffect(effect)
                }
            })
            break
        }
    }
}

module.exports = main
