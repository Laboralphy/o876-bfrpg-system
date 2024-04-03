/**
 * @param state {BFStoreState}
 * @param externals {{}}
 * @param item {BFItem}
 * @param slot {string}
 * @returns {BFEffect}
 */
module.exports = ({ state, externals }, { item, slot = '' }) => {
    const oItemTypes = externals['item-types']
    const aAllowedSlots = oItemTypes[item.itemType].slots
    let sUseSlot = aAllowedSlots.includes(slot) ? slot : ''
    for (const s of aAllowedSlots) {
        if (!state.equipment[s]) {
            sUseSlot = s
            break
        }
    }
    if (!sUseSlot) {
        sUseSlot = aAllowedSlots[0]
    }
    const oPrevItem = state.equipment[sUseSlot]
    state.equipment[sUseSlot] = item
    return oPrevItem
}