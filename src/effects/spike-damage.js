const CONSTS = require("../consts");

function init (oEffect, { type: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, savingThrow = false }) {
    oEffect.data.type = sDamageType
    oEffect.data.savingThrow = savingThrow
}

module.exports = {
    init
}