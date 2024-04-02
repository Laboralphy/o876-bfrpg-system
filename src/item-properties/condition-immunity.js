const CONSTS = require('../consts')

function init (oItemProperty, { condition }) {
    if (!CONSTS[condition]) {
        throw new Error('unknown condition ' + condition)
    }
    oItemProperty.data.type = sDamageType
}

module.exports = {
    init
}