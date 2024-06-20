/**
 *
 * @param state
 * @param getters
 * @param externals
 * @returns {{savingThrow: {fumble: number, success: number}, attack: {fumble: number, success: number}}}
 */
module.exports = (state, getters, externals) => externals['fumble-success']
