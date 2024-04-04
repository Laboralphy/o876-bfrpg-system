/**
 * Add an action to character action list
 * @param state {BFStoreState}
 * @param count {number}
 * @param attackType {string}
 * @param name {string}
 * @param scripts {{script: string, data: {}}[]}
 * @param amp {string|number}
 */
module.exports = ({ state }, { name, attackType, count = 1, amp = 0, scripts = [] }) => {
    state.monsterData.actions.push({
        name,
        attackType,
        count,
        scripts,
        amp
    })
}