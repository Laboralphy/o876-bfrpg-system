const CONSTS = require('../consts')

function init ({ effect, attackType: sAttackType = CONSTS.ATTACK_TYPE_ANY } = {}) {
    effect.data.attackType = sAttackType
    effect.key = sAttackType
}

module.exports = {
    init
}