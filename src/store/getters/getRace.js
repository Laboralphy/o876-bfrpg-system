/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {{name:string, specie:string, abilityRestrictions:Object, maxHdPerLevel:number, savingThrows:Object, properties:Array }}
 */
module.exports = (state, getters, externals) => {
    const sRaceName = state.race
    const oRaceData = sRaceName in externals['races'] ? externals['races'][sRaceName] : { specie: getters.getSpecie }
    return {
        maxHdPerLevel: oRaceData.maxHdPerLevel,
        specie: oRaceData.specie,
        abilityRestrictions: oRaceData.abilityRestrictions || {},
        savingThrows: oRaceData.savingThrows || {},
        properties: oRaceData.properties || [],
        name: sRaceName
    }
}
