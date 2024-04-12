const CombatManager = require('../src/combat/CombatManager')
const Manager = require('../src/Manager')
const {setItem} = require("../src/libs/array-mutations");



class CombatSim {
    constructor () {
        this._manager = new Manager()
        this._timer = 0
    }

    get combatManager () {
        return this._manager.combatManager
    }

    init () {
        this._manager.init()
        this._manager.loadModule('classic')
    }

    initCombat (sMonster1, sMonster2) {
        const oMonster1 = this._manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oMonster2 = this._manager.createCreature({ id: 'm2', ref: sMonster2 })
        this.combatManager.events.on('combat.turn', ev => {
            console.group('combat turn', ev.turn.toString())
            console.log({
                id: ev.attacker.id,
                specie: ev.attacker.getters.getSpecie,
                hp: ev.attacker.getters.getHitPoints + '/' + ev.attacker.getters.getMaxHitPoints,
                ac: ev.attacker.getters.getArmorClass.equipment
            })
            console.log('target', ev.target.id)
            console.groupEnd()
        })
        this.combatManager.startCombat(oMonster1, oMonster2)
    }

    advance () {
        this.combatManager.combats.forEach(c => c.advance())
    }
}


function main (sMonster1, sMonster2) {
    const cs = new CombatSim()
    cs.init()
    cs.initCombat()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
    cs.advance()
}

main('c-centaur', 'c-cave-locust')
