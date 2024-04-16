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

    explainDamages (oDamages) {
        const a = []
        const aEntries = Object
            .entries(oDamages.types)
        if (aEntries.length === 1) {
            a.push(aEntries[0][0].substring(12).toLowerCase())

        } else {
            aEntries
                .forEach(([ sType, { amount, resisted }]) => {
                    a.push(amount, sType.substring(12).toLowerCase())
                    if (resisted) {
                        a.push('; resisted', resisted)
                    }
                })
        }
        return '(' + a.join(' ') + ')'
    }

    _tt (turn, tick) {
        return '[' + turn.toString() + ':' + tick.toString() + ']'
    }

    initCombat (sMonster1, sMonster2) {
        const oMonster1 = this._manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oMonster2 = this._manager.createCreature({ id: 'm2', ref: sMonster2 })
        oMonster1.name = sMonster1
        oMonster2.name = sMonster2
        this._manager.events.on('combat.turn', ev => {
        })
        this._manager.events.on('combat.action', ev => {
            const { action, count, turn, tick, target, attacker } = ev
            console.log(this._tt(turn, tick), attacker.name, '>', action.name, '( x', count, ') on', target.name)
        })
        this._manager.events.on('combat.attack', ev => {
            const { turn, tick, outcome } = ev
            if (outcome.failed) {
                console.log(this._tt(turn, tick), outcome.attacker.name, 'failed to attack', outcome.target.name, 'because', outcome.failure)
            } else {
                console.log(this._tt(turn, tick), outcome.attacker.name, 'attacks', outcome.target.name, ':', outcome.roll, '+', outcome.bonus, '=', outcome.roll + outcome.bonus, 'vs AC', outcome.ac, outcome.hit ? 'HIT' : 'MISS')
                if (outcome.hit) {
                    const g = outcome.target.getters
                    console.log(this._tt(turn, tick), outcome.attacker.name, 'inflicts', outcome.damages.amount, 'of damage', this.explainDamages(outcome.damages), 'to', outcome.target.name, '- hp:', g.getHitPoints, '/', g.getMaxHitPoints)
                }
            }
        })
        this._manager.combatManager.events.on('combat.end', ev => {
            if (ev.attacker.getters.isDead) {
                console.log(ev.attacker.name, 'is dead')
            } else {
                console.log(ev.attacker.name, 'left combat with', ev.attacker.getters.getHitPoints, 'hp left')
            }
        })
        this._manager.events.on('combat.distance', ev => {
            const { turn, tick, attacker, target, distance, previousDistance } = ev
            console.log('[' + turn.toString() + ':' + tick.toString() + ']', attacker.name, 'move to', target.name, distance - previousDistance, 'ft :', 'now at', distance, 'ft')
        })
        const oCombat = this.combatManager.startCombat(oMonster1, oMonster2)
        oCombat.distance = 30
    }

    advance () {
        this.combatManager.processCombats()
    }
}


async function main (sMonster1, sMonster2) {
    const cs = new CombatSim()
    await cs.init()
    cs.initCombat(sMonster1, sMonster2)
    for (let i = 0; i < 1000; ++i) {
        cs.advance()
        if (cs.combatManager.combats.length <= 0) {
            break
        }
    }
}

main('c-centaur', 'c-elemental-fire-staff').then(() => console.log('done.'))
