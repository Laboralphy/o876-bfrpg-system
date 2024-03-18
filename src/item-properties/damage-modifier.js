function init (oItemProperty, { value, type: sDamageType }) {
    if (!sDamageType) {
        throw new Error('item property damage-modifier, damage type not specified')
    }
    oItemProperty.amp = value
    oItemProperty.data.type = sDamageType
}

module.exports = {
    init
}