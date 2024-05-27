const CONSTS = require('../../../../consts')

const TAG_GOLEM_FLESH_FIRE_COLD_SLOW = 'TAG_GOLEM_FLESH_FIRE_COLD_SLOW'

/**
 *
 * @param manager {Manager}
 * @param creature {Creature}
 * @param sDamageType {string}
 * @param amount {number}
 * @param resisted {number}
 */
function main ({ manager, creature, type: sDamageType, amount, resisted }) {
    switch (sDamageType) {
        case CONSTS.DAMAGE_TYPE_COLD:
        case CONSTS.DAMAGE_TYPE_FIRE: {
            // Applique un effet de ralenti pendant 2d6 tours
            const eSlow = manager.createEffect(CONSTS.EFFECT_SPEED_MODIFIER, -15)
            eSlow.tags.push(TAG_GOLEM_FLESH_FIRE_COLD_SLOW)
            manager.applyEffect(eSlow, creature, creature.dice.evaluate('2d6'))
            break
        }

        case CONSTS.DAMAGE_TYPE_ELECTRICITY: {
            // "Ça fait du bien par où ça passe !"
            // - Franky, dans le Croque Monstre Show
            const nDamage = amount + resisted
            const nHealing = Math.floor(nDamage / 3)
            const eHeal = manager.createEffect(CONSTS.EFFECT_HEAL, nHealing)
            manager.applyEffect(eHeal, creature)
            creature.getters.getEffects.forEach(effect => {
                if (effect.tags.includes(TAG_GOLEM_FLESH_FIRE_COLD_SLOW)) {
                    manager.dispelEffect(effect)
                }
            })
            break
        }
    }
}

module.exports = main
