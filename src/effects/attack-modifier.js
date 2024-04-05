const CONSTS = require('../consts')

function init (oEffect, value, { type: sAttackType = CONSTS.ATTACK_TYPE_ANY }) {
    oEffect.data.type = sAttackType
}

module.exports = {
    init
}