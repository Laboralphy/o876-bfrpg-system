const Manager = require('../src/Manager')



class CombatSim {
    constructor () {
        this._manager = new Manager()
        this._timer = 0
    }

    /**
     *
     * @returns {CombatManager}
     */
    get combatManager () {
        return this._manager.combatManager
    }

    displayFighter (f) {
        console.group('fighter status:', f.name)
        const g = f.getters
        console.log(g.getSpecie,
            'level', g.getLevel,
            'hp', g.getHitPoints, '/', g.getMaxHitPoints,
            'ac', g.getArmorClass.equipment
        )
        console.groupEnd()
    }

    /**
     *
     * @param c {Combat}
     */
    displayCombatStatus (c) {
        console.group('combat status')
        console.log(c.attacker.creature.name, 'attacks', c.defender.name, 'distance:', c.distance)
        this.displayFighter(c.attacker.creature)
        this.displayFighter(c.defender)
        console.groupEnd()
    }

    async init () {
        await this._manager.init()
        this._manager.loadModule('classic')
    }

    initCombat (sMonster1, sMonster2) {
        const oMonster1 = this._manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oMonster2 = this._manager.createCreature({ id: 'm2', ref: sMonster2 })
        oMonster1.name = sMonster1
        oMonster2.name = sMonster2
        this.combatManager.events.on('combat.turn', ev => {
            const { attacker, turn } = ev
            console.group('[' + turn.toString() + ':0] new turn')
            this.displayCombatStatus(this.combatManager.getCombat(attacker))
            console.groupEnd()
        })
        this.combatManager.events.on('combat.action', ev => {
            const { action, damage, count, turn, tick, target, attacker } = ev
            console.log('[' + turn.toString() + ':' + tick.toString() + ']', attacker.name, '>', action, '( x', count, ') on', target.name)
        })
        this.combatManager.events.on('combat.attack', ev => {
            const { outcome, action } = ev
            console.log()
        })
        this.combatManager.events.on('combat.script', ev => {
            const { turn, action, damage, data, script, tick, target, attacker } = ev
            console.log('[' + turn.toString() + ':' + tick.toString() + ']', 'script', script, damage, data)
        })
        this.combatManager.events.on('combat.distance', ev => {
            const { turn, tick, attacker, target, distance, previousDistance } = ev
            console.log('[' + turn.toString() + ':' + tick.toString() + ']', attacker.name, 'move to', target.name, distance - previousDistance, 'ft :', 'now at', distance, 'ft')
        })
        const oCombat = this.combatManager.startCombat(oMonster1, oMonster2)
        oCombat.distance = 30
    }

    advance () {
        this.combatManager.combats.forEach(c => c.advance())
    }
}


async function main (sMonster1, sMonster2) {
    const cs = new CombatSim()
    await cs.init()
    cs.initCombat(sMonster1, sMonster2)
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
    cs.advance()
    cs.advance()
    cs.advance()
}

main('c-centaur', 'c-cave-locust').then(() => console.log('done.'))
