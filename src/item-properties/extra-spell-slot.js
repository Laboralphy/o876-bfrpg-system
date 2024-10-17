const CONSTS = require('../consts')

function init ({ itemProperty, slotLevel, spellcastingType = CONSTS.SPELLCASTING_TYPE_ARCANE }) {
    if (!CONSTS[spellcastingType]) {
        throw new Error('unknown spellcasting type ' + spellcastingType)
    }
    itemProperty.data.spellcastingType = spellcastingType
    itemProperty.data.slotLevel = slotLevel
}

module.exports = {
    init
}