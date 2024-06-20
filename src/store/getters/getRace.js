/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {{name:string, specie:{ ref: string, living: boolean, mind: boolean }, abilityRestrictions:Object, maxHdPerLevel:number, savingThrows:Object, properties:Array }}
 */
module.exports = (state, getters, externals) => {
    const sRaceName = state.race
    const oRaceData = sRaceName in externals['races'] ? externals['races'][sRaceName] : {
        maxHdPerLevel: Infinity,
        specie: getters.getSpecie,
        abilityRestrictions: {},
        weaponRestrictions: {},
        savingThrows: {},
        properties: [],
        ref: sRaceName
    }
    return {
        maxHdPerLevel: oRaceData.maxHdPerLevel || Infinity,
        specie: getters.getSpecie,
        abilityRestrictions: oRaceData.abilityRestrictions || {},
        weaponRestrictions: oRaceData.weaponRestrictions || {},
        savingThrows: oRaceData.savingThrows || {},
        properties: oRaceData.properties || [],
        ref: sRaceName
    }
}
