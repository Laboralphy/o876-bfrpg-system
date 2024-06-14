function init ({ itemProperty, combat = '', damaged = '' }) {
    itemProperty.data.scripts = {
        combat,
        damaged
    }
}

function damaged ({ itemProperty, manager, creature, damageType: sDamageType, amount, resisted }) {
    const sScript = itemProperty.data.scripts.damaged
    if (sScript) {
        manager.runScript(sScript, {
            manager,
            creature,
            damageType: sDamageType,
            amount,
            resisted
        })
    }
}
function combatTurn ({ itemProperty, manager, creature, action, combat }) {
    const sScript = itemProperty.data.scripts.combatTurn
    if (sScript) {
        manager.runScript(sScript, {
            manager,
            creature,
            action,
            combat
        })
    }
}

module.exports = {
    init,
    combatTurn,
    damaged
}
