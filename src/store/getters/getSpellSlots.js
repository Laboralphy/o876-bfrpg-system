const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

/**
 * Returns all spells slots for the current creature level
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {number[]}
 */
module.exports = (state, getters, externals) => {
    const sClassType = state.classType
    const ctd = externals['class-types'][state.classType]
    let sSpellCastingType = ''
    switch (sClassType) {
        case CONSTS.CLASS_TYPE_ROGUE_MAGIC_USER:
        case CONSTS.CLASS_TYPE_FIGHTER_MAGIC_USER:
        case CONSTS.CLASS_TYPE_MAGIC_USER: {
            sSpellCastingType = CONSTS.SPELLCASTING_TYPE_ARCANE
            break
        }

        case CONSTS.CLASS_TYPE_CLERIC: {
            sSpellCastingType = CONSTS.SPELLCASTING_TYPE_DIVINE
            break
        }
    }
    if (sSpellCastingType === '') {
        return []
    }
    const { sorter } = aggregateModifiers([CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT], getters, {
        propFilter: prop => prop.data.spellcastingType === sSpellCastingType,
        propSorter: prop => prop.data.slotLevel.toString()
    })

    const iLevel = Math.max(0, Math.min(ctd.spells.length, getters.getLevel)) - 1
    const slots = [...ctd.spells[iLevel]]
    Object.entries(sorter).forEach(([sSlotLevel, { sum }]) => {
        const nSlotLevel = parseInt(sSlotLevel)
        slots[nSlotLevel - 1] = slots[nSlotLevel - 1] === 0
            ? 0
            : slots[nSlotLevel - 1] + sum
    })
    return slots
}