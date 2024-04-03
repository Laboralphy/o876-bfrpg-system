const ITEM_PROPERTIES = require('./item-properties')

/**
 * @typedef BFItemProperty {object}
 * @property amp {number|string}
 * @property data {{}}
 * @property property {string}
 *
 * @class
 */
class ItemProperties {
    static build (sProperty, amp, oParameters) {
        if (sProperty in ITEM_PROPERTIES) {
            const oItemProperty = {
                property: sProperty,
                amp,
                data: {}
            }
            ItemProperties.runScript(oItemProperty, 'init', oParameters)
            return oItemProperty
        } else {
            throw new Error('Unknown item property : ' + sProperty)
        }
    }

    static runScript (oItemProperty, sScript, oParameters) {
        const sProperty = oItemProperty.property
        if (ITEM_PROPERTIES[sProperty] && ITEM_PROPERTIES[sProperty][sScript]) {
            ITEM_PROPERTIES[sProperty][sScript](oItemProperty, oParameters)
        }
    }
}

module.exports = ItemProperties