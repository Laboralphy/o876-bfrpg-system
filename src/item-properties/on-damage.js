const CONSTS = require('../consts')

function init (oItemProperty, { script }) {
    oItemProperty.data.script = script
}

function damage (oItemProperty, { manager, creature, type: sDamageType, amount, resisted }) {
    manager.runScript(oItemProperty.data.script, {
        manager,
        creature,
        type: sDamageType,
        amount,
        resisted
    })
}

module.exports = {
    init
}
