const CONSTS = require('../consts')

function init (oEffect, { attackType: sAttackType = CONSTS.ATTACK_TYPE_ANY }) {
    oEffect.data.attackType = sAttackType
}

module.exports = {
    init
}