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
 */
module.exports = ({ state }, { value }) => {
    state.race = value
}
