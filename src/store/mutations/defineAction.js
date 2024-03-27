/**
 * Add an action to character action list
 * @param state {BFStoreState}
 * @param count {number} number of times this action may be used per day
 * @param name {string} action name
 * @param script {string} action script
 * @param amp {string|number} amplitude
 * @param parameters {object} action parameter passed to the script
 */
module.exports = ({ state }, { count = 1, name, script = 'damage', amp = 0, parameters = {} }) => {
    state.monsterData.actions.push({
        name,
        count,
        script,
        amp
    })
}