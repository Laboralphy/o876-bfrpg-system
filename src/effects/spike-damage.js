const CONSTS = require('../consts')
const { onAttacked } = require('../libs/spike-damage-logic')

function init ({ effect, damageType: sDamageType = CONSTS.DAMAGE_TYPE_PHYSICAL, maxDistance = Infinity, savingThrow = false }) {
    effect.data.damageType = sDamageType
    effect.data.savingThrow = savingThrow
    effect.data.maxDistance = maxDistance
}

function attacked ({ effectProcessor, effect: { amp, data }, attackOutcome }) {
    onAttacked(effectProcessor, attackOutcome, amp, data)
}

module.exports = {
    init,
    attacked
}