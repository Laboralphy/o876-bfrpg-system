const { truncate } = require('../../libs/array-mutations')

/**
 *
 * @param state {BFStoreState}
 */
module.exports = ({ state }) => {
    truncate(state.recentDamages)
}