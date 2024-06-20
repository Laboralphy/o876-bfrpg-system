const CONSTS = require('../../consts')
const { aggregateModifiers } = require('../../aggregator')

module.exports = (state, getters, externals) => {
    const { sorter } = aggregateModifiers([
        CONSTS.ITEM_PROPERTY_SAVING_THROW_MODIFIER,
        CONSTS.EFFECT_SAVING_THROW_MODIFIER
    ], getters, {
        propSorter: prop => prop.data.threat,
        effectSorter: effect => effect.data.threat
    })
    const streg = {
        [CONSTS.SAVING_THROW_ANY]: 0,
        [CONSTS.SAVING_THROW_SPELL]: 0,
        [CONSTS.SAVING_THROW_DEATH_RAY_POISON]: 0,
        [CONSTS.SAVING_THROW_PARALYSIS_PETRIFY]: 0,
        [CONSTS.SAVING_THROW_DRAGON_BREATH]: 0,
        [CONSTS.SAVING_THROW_MAGIC_WAND]: 0,
        [CONSTS.THREAT_POISON]: 0,
        [CONSTS.THREAT_MIND_SPELL]: 0,
        [CONSTS.THREAT_ILLUSION]: 0
    }
    const rd = getters.getRace
    for (const [sThreat, value] of Object.entries(rd.savingThrows)) {
        streg[sThreat] += value
    }
    Object
        .entries(sorter)
        .forEach(([sThreat, { sum }]) => {
            streg[sThreat] += sum
        })
    return streg
}
