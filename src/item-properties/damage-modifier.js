const CONSTS = require('../consts')

function init ({ itemProperty, damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL }) {
    if (!CONSTS[sDamageType]) {
        throw new Error('unknown damage type ' + sDamageType)
    }
    itemProperty.data.damageType = sDamageType
}

module.exports = {
    init
}