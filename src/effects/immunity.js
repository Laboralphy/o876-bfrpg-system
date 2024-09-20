const CONSTS = require('../consts')

function init ({ effect, immunityType }) {
    if (!CONSTS[immunityType]) {
        throw new Error('unknown immunity type ' + immunityType)
    }
    effect.data.immunityType = immunityType
    effect.key = immunityType
}

module.exports = {
    init
}