function init ({ itemProperty, combat = '', damaged = '', attack = '' }) {
    itemProperty.data.scripts = {
        combat,
        damaged,
        attack
    }
}

/**
 * this part is triggered when a creature attacks
 * @param itemProperty {BFItemProperty} the item property object
 * @param manager {Manager} Instance of manager
 * @param creature {Creature} the attacking creature
 * @param target {Creature} the targetted creature
 * @param attackOutcome {BFAttackOutcome} the attack outcome
 */
function attack ({ itemProperty, manager, creature, target, attackOutcome }) {
    const sScript = itemProperty.data.scripts.attack
    if (sScript) {
        manager.runScript(sScript, {
            manager,
            creature,
            target,
            attackOutcome
        })
    }
}

/**
 * This part is triggered when creature is damaged
 * @param itemProperty {BFItemProperty} the item property object
 * @param manager {Manager} Instance of manager
 * @param creature {Creature} the damaged creature
 * @param sDamageType {string} a DAMAGE_TYPE_*
 * @param amount {number} number of damage points dealt
 * @param resisted {number} number of damage points resisted
 */
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

/**
 * This part is triggered each combat turn
 * @param itemProperty {BFItemProperty} the item property object
 * @param manager {Manager} Instance of manager
 * @param creature {Creature} the acting creature
 * @param action {function(s:string)} a function called to define next action
 * @param combat {Combat}
 */
function combatTurn ({ itemProperty, manager, creature, action, combat }) {
    const sScript = itemProperty.data.scripts.combat
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
    damaged,
    attack
}
