const CONSTS = require('../consts')

function init ({ itemProperty, script }) {
    itemProperty.data.script = script
}

function combatTurn ({ itemProperty, manager, creature, action, target, combat }) {
    manager.runScript(itemProperty.data.script, {
        manager,
        creature,
        action,
        target,
        combat
    })
}

module.exports = {
    init,
    combatTurn
}
