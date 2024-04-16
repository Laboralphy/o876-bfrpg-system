/**
 * Add an action to character action list
 *
 * @typedef DefineActionDTO {object}
 * @property count {number}
 * @property attackType {string}
 * @property name {string}
 * @property conveys {{script: string, data: {}}[]}
 * @property amp {string|number}
 *
 * @param state {BFStoreState}
 * @param actions {DefineActionDTO[]}
 */
module.exports = ({ state }, { actions }) => {
    const mda = state.monsterData.actions
    const aPrevKeys = new Set(Object.keys(mda))
    actions.forEach(a => {
        mda[a.name] = {
            name: a.name,
            attackType: a.attackType,
            count: a.count,
            conveys: a.conveys.slice(0),
            damage: a.damage,
            damageType: a.damageType
        }
        aPrevKeys.delete(a.name)
    })
    aPrevKeys.forEach(k => {
        delete mda[k]
    })
}