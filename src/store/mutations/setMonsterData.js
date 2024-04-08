/**
 *
 * @param state {BFStoreState}
 * @param data {{ modifiers: { attack: number, hp: number}, saveAs: { classType: string, levelAdjust }}}
 */
module.exports = ({ state }, { data }) => {
    const md = state.monsterData
    md.modifiers.attack = data.modifiers.attack
    md.modifiers.hp = data.modifiers.hp
    md.saveAs.levelAdjust = data.saveAs.levelAdjust
    md.saveAs.classType = data.saveAs.classType
}