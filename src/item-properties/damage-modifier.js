const CONSTS = require('../consts')

function init (oItemProperty, { value, damageType: sDamageType = CONSTS.DAMAGE_TYPE_WEAPON }) {
    if (!CONSTS[sDamageType]) {
        throw new Error('unknown damage type ' + sDamageType)
    }
    oItemProperty.amp = value
    oItemProperty.data.type = sDamageType
}

module.exports = {
    init
}