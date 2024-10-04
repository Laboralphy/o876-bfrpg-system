/**
 *
 * @typedef BFRaceData {object}
 * @property maxHdPerLevel {number}
 * @property specie {{ ref: string }}
 * @property abilityRestrictions {Object<string, {min?: number, max?: number}>}
 * @property weaponRestrictions {Object<string, {weaponSize?: string[]}>}
 * @property savingThrows {Object<string, number>}
 * @property properties {[]}
 * @property ref {string}
 * @property rogueSkills {Object<string, number>}
 *
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param externals {*}
 * @returns {BFRaceData}
 */
module.exports = (state, getters, externals) => {
    /**
     * @type {string}
     */
    const sRaceName = state.race
    const oRaceData = sRaceName in externals['races'] ? externals['races'][sRaceName] : {
        maxHdPerLevel: Infinity,
        specie: getters.getSpecie,
        abilityRestrictions: {},
        weaponRestrictions: {},
        savingThrows: {},
        properties: [],
        ref: sRaceName,
        rogueSkills: {}
    }
    return {
        maxHdPerLevel: oRaceData.maxHdPerLevel || Infinity,
        specie: getters.getSpecie,
        abilityRestrictions: oRaceData.abilityRestrictions || {},
        weaponRestrictions: oRaceData.weaponRestrictions || {},
        savingThrows: oRaceData.savingThrows || {},
        properties: oRaceData.properties || [],
        ref: sRaceName,
        rogueSkills: oRaceData.rogueSkills || {}
    }
}
