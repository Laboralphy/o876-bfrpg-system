const CONSTS = require('../../consts')

/**
 * This attack damages an ability, attack must hit, and a saving throw against death ray is allowed.
 * Works on living creature only.
 * The amount of points and duration is specified in data.
 *
 * @param turn {number}
 * @param tick {number}
 * @param attackOutcome {BFAttackOutcome}
 * @param attacker {Creature}
 * @param target {Creature}
 * @param action {BFStoreStateAction}
 * @param script {string}
 * @param damage {string|number}
 * @param manager {{}}
 * @param ability {string} ability to be damaged
 * @param amount {number} amount of ability points
 * @param duration {number} if no duration then : infinity
 */
function main ({
    turn,
    tick,
    attackOutcome,
    attacker,
    target,
    action,
    script,
    damage,
    manager,
    data: {
       ability,
       amount = 1,
       duration = CONSTS.DURATION_PERMANENT
    }
}) {
    if (target.getters.getSpecie.living && attackOutcome.hit && !target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success) {
        const eCurse = manager.createEffect(CONSTS.EFFECT_ABILITY_MODIFIER, amount, { ability })
        eCurse.subtype = CONSTS.EFFECT_SUBTYPE_SUPERNATURAL
        manager.applyEffect(eCurse, target, duration, attacker)
    }
}

module.exports = main