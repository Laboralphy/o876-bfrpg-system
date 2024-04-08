/**
 * Add an action to character action list
 * @param state {BFStoreState}
 * @param count {number}
 * @param attackType {string}
 * @param name {string}
 * @param conveys {{script: string, data: {}}[]}
 * @param amp {string|number}
 */
module.exports = ({ state }, { name, attackType, count = 1, amp = 0, conveys = [] }) => {
    state.monsterData.actions[name] = {
        attackType,
        count,
        conveys,
        amp
    }
}