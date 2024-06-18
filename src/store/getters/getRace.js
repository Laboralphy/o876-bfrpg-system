/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {string|(<T extends any[] | []>(values: T) => Promise<Awaited<T[number]>>)|(<T>(values: Iterable<PromiseLike<T> | T>) => Promise<Awaited<T>>)|*}
 */
module.exports = (state, getters, externals) => {
    const sRaceName = state.race
    const oRaceData = sRaceName in externals['races'] ? externals['races'][sRaceName] : { specie: getters.getSpecie }
    return {
        ...oRaceData,
        name: sRaceName
    }
}
