/**
 * Add an action to character action list
 * @param state {BFStoreState}
 * @param count {number}
 * @param name {string}
 * @param script {string}
 * @param amp {string|number}
 * @param parameters {object}
 */
module.exports = ({ state }, { count = 1, name, script = 'damage', amp = 0, parameters = {} }) => {
    state.monsterData.actions.push({
        name,
        count,
        script,
        amp
    })
}