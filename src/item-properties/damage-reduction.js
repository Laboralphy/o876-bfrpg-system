const CONSTS = require('../consts')

function init ({ itemProperty, damageType: sDamageType }) {
    if (!CONSTS[sDamageType]) {
        throw new Error('unknown damage type ' + sDamageType)
    }
    itemProperty.data.damageType = sDamageType
}

module.exports = {
    init
}