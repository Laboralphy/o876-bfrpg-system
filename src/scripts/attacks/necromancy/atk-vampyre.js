const CONSTS = require('../../../consts')

/**
 * @description This attack heals attacker, with an amount of hp equal to damage dealt by attack
 *
 * @param oActionPayload {BFActionPayload}
 */
function main (oActionPayload) {
    const { attacker, target, manager, attackOutcome } = oActionPayload
    if (target.getters.getSpecie.living) {
        const eHeal = manager.createEffect(CONSTS.EFFECT_HEAL, attackOutcome.damages.amount)
        manager.applyEffect(eHeal, attacker)
    }
}

module.exports = main