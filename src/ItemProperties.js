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
    static build (ip) {
        const { property: sProperty, amp = 0, ...data } = ip
        if (sProperty in ITEM_PROPERTIES) {
            const oItemProperty = {
                property: sProperty,
                amp,
                data
            }
            ItemProperties.runScript(oItemProperty, 'init', data)
            return oItemProperty
        } else {
            throw new Error('Unknown item property : ' + sProperty)
        }
    }

    static runScript (oItemProperty, sScript, oParameters) {
        const sProperty = oItemProperty.property
        if (ITEM_PROPERTIES[sProperty] && ITEM_PROPERTIES[sProperty][sScript]) {
            ITEM_PROPERTIES[sProperty][sScript]({
                itemProperty: oItemProperty,
                ...oParameters
            })
        }
    }
}

module.exports = ItemProperties