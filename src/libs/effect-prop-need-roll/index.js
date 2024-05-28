const CONSTS = require('../../consts')


/**
 * only ATTACK_TYPE_MELEE or ATTACK_TYPE_ANY are used to specify attack or ac bonus
 * no need multimelee or touch here
 * @param effectOrProp {{ data: { attackType: string }}}
 * @returns {boolean}
 */
function filterMeleeAttackTypes (effectOrProp) {
    return effectOrProp.data.attackType === CONSTS.ATTACK_TYPE_MELEE ||
        effectOrProp.data.attackType === CONSTS.ATTACK_TYPE_ANY
}

/**
 * only ATTACK_TYPE_MELEE or ATTACK_TYPE_ANY are used to specify attack or ac bonus
 * no need multimelee or touch here
 * @param effectOrProp {{ data: { attackType: string }}}
 * @returns {boolean}
 */
function filterRangedAttackTypes (effectOrProp) {
    return effectOrProp.data.attackType === CONSTS.ATTACK_TYPE_RANGED ||
        effectOrProp.data.attackType === CONSTS.ATTACK_TYPE_ANY
}

module.exports = {
    filterMeleeAttackTypes,
    filterRangedAttackTypes
}
