const CONSTS = require('../consts')

function init (oItemProperty, { damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, savingThrow = false }) {
    oItemProperty.data.type = sDamageType
    oItemProperty.data.savingThrow = savingThrow
}

module.exports = {
    init
}
