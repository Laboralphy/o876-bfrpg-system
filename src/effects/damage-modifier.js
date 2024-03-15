const CONSTS = require('../consts')

function create (oEffect, { value, type: sDamageType }) {
    oEffect.amp = value
    oEffect.data.type = sDamageType
}

module.exports = {
    create
}