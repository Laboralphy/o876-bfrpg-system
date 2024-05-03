/**
 * returns the creature specie
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {{ ref: string, living: boolean, mind: boolean }}
 */
module.exports = (state, getters, externals) => {
    const oSpecieData = externals['species'][state.specie]
    return {
        ref: state.specie,
        living: oSpecieData.living,
        mind: oSpecieData.mind
    }
}