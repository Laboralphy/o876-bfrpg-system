const CONSTS = require('../../consts')

/**
 *
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @returns {Set<string>}
 */
module.exports = (state, getters) => {
    const rd = getters.getRace
    if ('weaponSize' in rd.weaponRestrictions) {
        return new Set(rd.weaponRestrictions.weaponSize)
    } else {
        return new Set([
            CONSTS.WEAPON_SIZE_SMALL,
            CONSTS.WEAPON_SIZE_MEDIUM,
            CONSTS.WEAPON_SIZE_LARGE
        ])
    }
}