const ITEM_PROPERTIES = require('./item-properties')

class ItemProperties {
    static build (sProperty, oParameters) {
        if (sProperty in ITEM_PROPERTIES) {
            const oItemProperty = {
                property: sProperty,
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