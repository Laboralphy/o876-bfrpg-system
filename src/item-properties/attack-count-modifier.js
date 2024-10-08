const CONSTS = require('../consts')

function init ({ itemProperty, attackType = CONSTS.ATTACK_TYPE_ANY }) {
    itemProperty.data.attackType = attackType
}

module.exports = {
    init
}