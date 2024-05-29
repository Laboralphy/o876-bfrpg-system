const CONSTS = require('../consts')

function init ({ itemProperty, immunityType }) {
    if (!CONSTS[immunityType]) {
        throw new Error('unknown immunity type ' + immunityType)
    }
    itemProperty.data.immunityType = immunityType
}

module.exports = {
    init
}