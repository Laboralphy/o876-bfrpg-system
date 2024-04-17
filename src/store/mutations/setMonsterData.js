/**
 *
 * @param state {BFStoreState}
 * @param data {{ saveAs: { classType: string, level }}}
 */
module.exports = ({ state }, { data }) => {
    const md = state.monsterData
    if (data.saveAs.level === undefined) {
        throw new Error('missing or undefined property saveAs.level')
    }
    if (data.saveAs.classType === undefined) {
        throw new Error('missing or undefined property saveAs.classType')
    }
    md.saveAs.level = data.saveAs.level
    md.saveAs.classType = data.saveAs.classType
}