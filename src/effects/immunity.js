const CONSTS = require('../consts')

function init (oEffect, { immunityType }) {
    if (!CONSTS[immunityType]) {
        throw new Error('unknown immunity type ' + immunityType)
    }
    oEffect.data.immunityType = immunityType
}

module.exports = {
    init
}