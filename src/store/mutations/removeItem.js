/**
 * @param state {BFStoreState}
 * @param slot {string}
 * @returns {BFEffect}
 */
const CONSTS = require("../../consts");
module.exports = ({ state }, { slot, bypassCurse = false }) => {
    const oPrevItem = state.equipment[slot]
    if (oPrevItem) {
        // Verifier si l'objet est maudit
        if (!bypassCurse && !!oPrevItem.properties.find(ip => ip.property === CONSTS.ITEM_PROPERTY_CURSED)) {
            return {
                previousItem: oPrevItem,
                slot,
                cursed: true
            } // On ne retire pas l'objet, on ne s'équipe pas du nouvel objet
        }
    }
    state.equipment[slot] = null
    return {
        previousItem: oPrevItem,
        slot,
        cursed: false
    }
}