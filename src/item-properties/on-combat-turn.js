const CONSTS = require('../consts')

function init ({ itemProperty, script }) {
    itemProperty.data.script = script
}

function combatTurn ({ itemProperty, manager, creature, action, combat }) {
    manager.runScript(itemProperty.data.script, {
        manager,
        creature,
        action,
        combat
    })
}

module.exports = {
    init,
    combatTurn
}
