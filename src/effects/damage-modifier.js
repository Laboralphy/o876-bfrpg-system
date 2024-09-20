function init ({ effect,  damageType: sDamageType }) {
    effect.data.damageType = sDamageType
    effect.key = sDamageType
}

module.exports = {
    init
}