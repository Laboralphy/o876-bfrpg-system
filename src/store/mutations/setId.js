/**
 * set creature id, usefull for debug purpose, and cheap
 * @param state {BFStoreState}
 * @param getters {BFStoreGetters}
 * @param value {string}
 */
module.exports = ({ state, getters }, { value }) => {
    state.id = value
}
