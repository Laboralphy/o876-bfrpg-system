const CONSTS = require('../consts')

function init (oItemProperty, { attackType = CONSTS.ATTACK_TYPE_ANY }) {
    oItemProperty.data.type = attackType
}

module.exports = {
    init
}