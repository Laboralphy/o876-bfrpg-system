const CONSTS = require('../consts')

function init (oItemProperty, { immunityType }) {
    if (!CONSTS[immunityType]) {
        throw new Error('unknown immunity type ' + immunityType)
    }
    oItemProperty.data.immunityType = immunityType
}

module.exports = {
    init
}