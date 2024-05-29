const CONSTS = require('../consts')
const { onAttacked } = require('../libs/spike-damage-logic')

function init ({ itemProperty, damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, savingThrow = false }) {
    itemProperty.data.damageType = sDamageType
    itemProperty.data.savingThrow = savingThrow
}

function attacked ({ itemProperty: { amp, data }, manager, attackOutcome }) {
    onAttacked(manager.effectProcessor, attackOutcome, amp, data)
}

module.exports = {
    init,
    attacked
}
