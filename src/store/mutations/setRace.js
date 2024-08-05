/**
 * changes creature race.
 * choose race in constant group RACE_*
 * available races are :
 * RACE_HUMAN
 * RACE_ELF
 * RACE_DWARF
 * RACE_HOBBIT
 * RACE_UNKNOWN - means the specie may not be SPECIE_HUMANOID
 *
 * @param state {BFStoreState}
 * @param value {string}
 * @param externals {*}
 */
module.exports = ({ state, externals }, { value }) => {
    const oRaceData = externals['races'][value]
    if (oRaceData) {
        state.specie = oRaceData.specie
        state.race = value
    } else {
        throw new Error('Unknown race : ' + value)
    }
}
