const CONSTS = require('../../../consts')

const FLAG_TOXIC_STENCH_IMMUNITY = 'ATK_TOXIC_STENCH_IMMUNITY'
const SLA_TAGS = 'SLA_TOXIC_STENCH'

/**
 * @description All melee offender (closer than a certain range) are affected by a -2 to attack & ac debuff
 * the debuff lasts for a certain duration. Save against POISON for avoidance and immunity for 24 hours (for this particular caster)
 * Parameters:
 * - duration : debuff duration once applied
 * - potency : adjustment for saving throw (default 0). positive value = easier to resist, negative value = harder to resist
 * - range : range of the stench (default 10 - reach range)
 */
function main (oActionPayload) {
    const { attacker, manager, data } = oActionPayload
    const {
        duration = manager.data['durations'].DURATION_DEFAULT,
        potency = 0,
        range = manager.data['weapon-ranges'].WEAPON_RANGE_MELEE
    } = data
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