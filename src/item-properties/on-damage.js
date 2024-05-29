const CONSTS = require('../consts')

function init ({ itemProperty, script }) {
    itemProperty.data.script = script
}

function damage ({ itemProperty, manager, creature, damageType: sDamageType, amount, resisted }) {
    manager.runScript(itemProperty.data.script, {
        manager,
        creature,
        damageType: sDamageType,
        amount,
        resisted
    })
}

module.exports = {
    init,
    damage
}
