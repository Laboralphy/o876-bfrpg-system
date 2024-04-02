const CONSTS = require('../consts')

function init (oItemProperty, { damageType: sDamageType }) {
    if (!CONSTS[sDamageType]) {
        throw new Error('unknown damage type ' + sDamageType)
    }
    oItemProperty.data.type = sDamageType
}

module.exports = {
    init
}