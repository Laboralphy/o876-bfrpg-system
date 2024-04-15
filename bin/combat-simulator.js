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
        console.group(f.name)
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
        this.displayFighter(c.attacker.creature)
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
            console.log('Turn', turn)
            this.displayCombatStatus(this.combatManager.getCombat(attacker))
        })
        this.combatManager.events.on('combat.action', ev => {
            const { action, amp, count, tick, target, attacker } = ev
            console.log(attacker.name, 'do action', action, 'x', count, 'on', target.name, 'amp', amp)
        })
        this.combatManager.events.on('combat.script', ev => {
            const { action, amp, data, script, tick, target, attacker } = ev
            console.log('script', script, amp, data)
        })
        this.combatManager.events.on('combat.distance', ev => {
            const { attacker, target, distance, previousDistance } = ev
            console.log(attacker.name, 'move to', target.name, distance - previousDistance, 'ft :', 'now at', distance, 'ft')
        })
        this.combatManager.startCombat(oMonster1, oMonster2)
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
}

main('c-centaur', 'c-cave-locust').then(() => console.log('done.'))
