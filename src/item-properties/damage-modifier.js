const CONSTS = require('../consts')

function init (oItemProperty, { damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL }) {
    if (!CONSTS[sDamageType]) {
        throw new Error('unknown damage type ' + sDamageType)
    }
    oItemProperty.data.damageType = sDamageType
}

module.exports = {
    init
}