const CONSTS = require('../../consts')


/**
 * @param attackOutcome {BFAttackOutcome}
 */
function damageWithAction (attackOutcome) {
    const {
        manager,
        action: {
            damage,
            data: actionData
        },
        attacker,
        target,
        hit
    } = attackOutcome
    if (hit) {
        const nDamage = attacker.dice.evaluate(damage)
        const sDamageType = actionData.type || CONSTS.DAMAGE_TYPE_WEAPON
        const eDamage = manager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, nDamage, { type: sDamageType })
        eDamage.subtype = CONSTS.EFFECT_SUBTYPE_WEAPON
        manager.effectProcessor.applyEffect(eDamage, target, 0, attacker)
    }
}

function main ({ attackOutcome }) {
}