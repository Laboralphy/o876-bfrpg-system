const CONSTS = require('../../consts')
/**
 * @param state {BFStoreState}
 * @param externals {{}}
 * @param item {BFItem}
 * @param slot {string}
 * @param bByPassCurse {boolean}
 * @returns {BFEffect}
 */
module.exports = ({ state, externals }, { item, slot = '', bByPassCurse = false }) => {
    const oItemTypes = externals['item-types']
    const aAllowedSlots = []
    if (item.itemType === CONSTS.ITEM_TYPE_WEAPON) {
        if (item.attributes.includes(CONSTS.WEAPON_ATTRIBUTE_RANGED)) {
            aAllowedSlots.push(CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED)
        } else {
            aAllowedSlots.push(CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE)
        }
    } else {
        aAllowedSlots.push(...oItemTypes[item.itemType].slots)
    }
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
    if (oPrevItem) {
        // Verifier si l'objet est maudit
        if (!bByPassCurse && !!oPrevItem.properties.find(ip => ip.property === CONSTS.ITEM_PROPERTY_CURSED)) {
            return {
                previousItem: oPrevItem,
                newItem: item,
                slot: sUseSlot,
                cursed: true
            } // On ne retire pas l'objet, on ne s'équipe pas du nouvel objet
        }
    }
    state.equipment[sUseSlot] = item
    return {
        previousItem: oPrevItem,
        newItem: item,
        slot: sUseSlot,
        cursed: true
    }
}