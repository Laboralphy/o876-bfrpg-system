/**
 * Returns all effects that have a duration longer than 0
 * (all effect with 0 duration are to be deleted very soon)
 * @param state
 * @returns {{}[]}
 */
module.exports = state => state.effects.filter(effect => effect.duration > 0)