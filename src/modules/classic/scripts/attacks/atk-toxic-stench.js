const CONSTS = require('../../../../consts')

const FLAG_TOXIC_STENCH_IMMUNITY = 'ATK_TOXIC_STENCH_IMMUNITY'

/**
 * Effect:
 * All melee offender (closer than 10') are affected by a -2 to attack debuff
 *
 * Saving throw:
 * Save against POISON for avoidance and immunity for 24 hours (for this particular caster)
 *
 * Data:
 * None
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
 * @param data {{}}
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
    data
}) {
    manager
        .getOffenders(attacker, 10)
        .forEach(oCreature => {
            // Is creature temporary immune ?
            const bImmune = this.aggregateModifiers([CONSTS.EFFECT_FLAG], {
                effectFilter: effect => effect.data.flag === FLAG_TOXIC_STENCH_IMMUNITY && effect.data.value === attacker.id
            }).count > 0
            if (bImmune) {
                // Yes -> exit
                return
            }
            // creature not immune : saving throw
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON).success
            if (bSuccess) {
                // creature gains immunity for 24 hours, for this attacker only.
                const eFlag = manager.createEffect(CONSTS.EFFECT_FLAG, 0, {
                    flag: FLAG_TOXIC_STENCH_IMMUNITY,
                    value: attacker.id
                })
                manager.applyEffect(eFlag, oCreature, CONSTS.DURATION_DAY, attacker)
                return
            }
            // saving throw failed : applying debuff or updating duration
            const eDebuff = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
            eDebuff.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
            eDebuff.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
            manager.applyEffect(eDebuff, oCreature, attacker.dice.evaluate('2d6'), attacker)
        })
}

module.exports = main