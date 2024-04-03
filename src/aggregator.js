/**
 * Aggrège les effets spécifiés dans la liste, selon un prédicat
 * @param aTags {string[]} liste des effets désirés
 * @param getters {BFStoreGetters}
 * @param effectFilter {function}
 * @param effectAmpMapper {function}
 * @param effectSorter {function}
 * @param effectForEach {function}
 * @param propFilter {function}
 * @param propAmpMapper {function}
 * @param propSorter {function}
 * @param propForEach {function}
 * @returns {{sorter: Object<String, {sum: number, max: number, count: number}>, max: number, min: number, sum: number, count: number, effects: number, ip: number }}
 */
function aggregateModifiers (aTags, getters, {
    effectFilter = null,
    propFilter = null,
    effectAmpMapper = null,
    propAmpMapper = null,
    effectSorter = null,
    propSorter = null,
    effectForEach = null,
    propForEach = null
} = {}) {
    const aTypeSet = new Set(
        Array.isArray(aTags)
            ? aTags
            : [aTags]
    )
    const aFilteredEffects = getters
        .getEffects
        .filter(eff =>
            aTypeSet.has(eff.type) &&
            (effectFilter ? effectFilter(eff) : true)
        )
        .map(eff => ({
            ...eff,
            amp: effectAmpMapper ? effectAmpMapper(eff) : eff.amp
        }))
    if (effectForEach) {
        aFilteredEffects.forEach(effectForEach)
    }
    const aFilteredItemProperties = getters
        .getProperties
        .filter(ip =>
            aTypeSet.has(ip.property) &&
            (propFilter ? propFilter(ip) : true)
        )
        .map(prop => ({
            ...prop,
            amp: propAmpMapper ? propAmpMapper(prop) : prop.amp
        }))
    if (propForEach) {
        aFilteredItemProperties.forEach(propForEach)
    }
    const oSorter = {}
    const rdisc = sDisc => {
        if (typeof sDisc !== 'string') {
            throw new Error('invalid sorting key for aggregateModifiers prop/effect sorter "' + sDisc + '"')
        }
        if (!(sDisc in oSorter)) {
            oSorter[sDisc] = {
                sum: 0,
                max: 0,
                count: 0
            }
        }
        return oSorter[sDisc]
    }
    if (effectSorter) {
        aFilteredEffects.forEach(f => {
            const sDisc = effectSorter(f)
            const sd = rdisc(sDisc)
            const amp = f.amp
            if (typeof amp !== 'number') {
                throw TypeError('Effect amp has not been properly evaluated')
            }
            sd.max = Math.max(sd.max, amp)
            sd.sum += amp
            ++sd.count
        })
    }
    if (propSorter) {
        aFilteredItemProperties.forEach(f => {
            const sDisc = propSorter(f)
            const sd = rdisc(sDisc)
            const amp = f.amp || 0
            sd.max = Math.max(sd.max, amp)
            sd.sum += amp
            ++sd.count
        })
    }

    let nIPAcc = 0, nEffAcc = 0, nMin = Infinity, nMax = -Infinity
    aFilteredEffects.forEach(({ amp }) => {
        nEffAcc += amp
        nMax = Math.max(nMax, amp)
        nMin = Math.max(nMin, amp)
    })
    aFilteredItemProperties.forEach(({ amp }) => {
        nIPAcc += amp
        nMax = Math.max(nMax, amp)
        nMin = Math.max(nMin, amp)
    })
    return {
        sum: nEffAcc + nIPAcc,
        effects: nEffAcc,
        ip: nIPAcc,
        max: nMax,
        min: nMin,
        count: aFilteredEffects.length + aFilteredItemProperties.length,
        sorter: oSorter
    }
}

module.exports = {
    aggregateModifiers
}