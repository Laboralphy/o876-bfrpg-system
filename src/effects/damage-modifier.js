const CONSTS = require('../consts')

function create (oEffect, { value, type: sDamageType }) {
    oEffect.type = CONSTS.EFFECT_DAMAGE_MODIFIER
    oEffect.amp = value
    oEffect.data.type = sDamageType
}

module.exports = {
    create
}