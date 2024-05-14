const CONSTS = require('../../../consts')
const { 'weapon-ranges': WEAPON_RANGES, durations: DURATIONS } = require('../../../data')

const FLAG_TOXIC_STENCH_IMMUNITY = 'ATK_TOXIC_STENCH_IMMUNITY'
const SLA_TAGS = 'SLA_TOXIC_STENCH'

/**
 * Effect:
 * All melee offender (closer than a certain range) are affected by a -2 to attack & ac debuff
 * the debuff lasts for a certain duration
 *
 * Saving throw:
 * Save against POISON for avoidance and immunity for 24 hours (for this particular caster)
 *
 * Data:
 * - duration : debuff duration once applied (default 2d6)
 * - potency : adjustment for saving throw (default 0). positive value = easier to resist, negative value = harder to resist
 * - range : range of the stench (default 10 - reach range)
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
    data: {
        potency = 0,
        duration = '2d6',
        range = WEAPON_RANGES.WEAPON_RANGE_REACH
    }
}) {
    manager
        .getOffenders(attacker, range)
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
            const bSuccess = oCreature.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, { adjustment: potency }).success
            if (bSuccess) {
                // creature gains immunity for 24 hours, for this attacker only.
                const eFlag = manager.createEffect(CONSTS.EFFECT_FLAG, 0, {
                    flag: FLAG_TOXIC_STENCH_IMMUNITY,
                    value: attacker.id
                })
                manager.applyEffect(eFlag, oCreature, DURATIONS.DURATION_DAY, attacker)
                return
            }
            // saving throw failed : applying debuff or updating duration
            const eAtkDebuff = manager.createEffect(CONSTS.EFFECT_ATTACK_MODIFIER, -2)
            eAtkDebuff.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
            eAtkDebuff.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
            const eACDebuff = manager.createEffect(CONSTS.EFFECT_ARMOR_CLASS_MODIFIER, -2)
            eACDebuff.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
            eACDebuff.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
            manager.applyEffectGroup([eAtkDebuff, eACDebuff], [SLA_TAGS], oCreature, attacker.dice.evaluate(duration), attacker)
        })
}

module.exports = main