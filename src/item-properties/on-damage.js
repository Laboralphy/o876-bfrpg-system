const CONSTS = require('../consts')

function init (oItemProperty, { script }) {
    oItemProperty.data.script = script
}

function damage (oItemProperty, { manager, creature, damageType: sDamageType, amount, resisted }) {
    manager.runScript(oItemProperty.data.script, {
        manager,
        creature,
        damageType: sDamageType,
        amount,
        resisted
    })
}

module.exports = {
    init
}
