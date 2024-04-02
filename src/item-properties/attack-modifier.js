const CONSTS = require('../consts')

function init (oItemProperty, { value, attackType = CONSTS.ATTACK_TYPE_ANY }) {
    oItemProperty.amp = value
    oItemProperty.data = {
        attackType
    }
}

module.exports = {
    init
}