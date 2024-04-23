const REQUIRED_PROPS = [
    'name',
    'attackType',
    'count',
    'conveys'
]

function checkCombatActionSchema (oAction) {
    const aMissingProps = REQUIRED_PROPS.filter(rp => !(rp in oAction))
    if (aMissingProps.length > 0) {
        throw new Error('Action definition error in "' + oAction.name + '", missing properties : ' + aMissingProps.join(', '))
    }
}

module.exports = {
    checkCombatActionSchema
}