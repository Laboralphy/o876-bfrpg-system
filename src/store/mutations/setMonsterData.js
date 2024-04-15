/**
 *
 * @param state {BFStoreState}
 * @param data {{ saveAs: { classType: string, levelAdjust }}}
 */
module.exports = ({ state }, { data }) => {
    const md = state.monsterData
    md.saveAs.levelAdjust = data.saveAs.levelAdjust
    md.saveAs.classType = data.saveAs.classType
}