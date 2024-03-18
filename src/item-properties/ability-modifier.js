function init (oItemProperty, { ability, value }) {
    oItemProperty.amp = value
    oItemProperty.data.ability = ability
}

module.exports = {
    init
}