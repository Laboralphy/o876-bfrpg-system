const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')


class CombatSim {
    constructor () {
        this._manager = new Manager()
        this._timer = 0
        this._tick = 0
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
                        a.push('resisted', resisted)
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
            const { turn, tick, attacker, target, combat } = ev
            console.log(this._tt(turn, tick), 'BEGIN TURN', attacker.name, 'is at', combat.distance, 'ft. from', target.name)
        })
        this._manager.events.on('combat.tick.end', ev => {
            const { turn, tick, attacker, target } = ev
            console.log(this._tt(turn, tick), 'END TICK', attacker.name)
        })
        this._manager.events.on('combat.action', ev => {
            const { action, count, turn, tick, target, attacker } = ev
            if (action.name === CONSTS.DEFAULT_ACTION_WEAPON) {
                console.log(
                    this._tt(turn, tick),
                    attacker.name, '> attacks ', target.name, 'with',
                    attacker.getters.getSelectedWeapon.ref
                )
            } else {
                console.log(this._tt(turn, tick), attacker.name, '>', action.name, 'on', target.name)
            }
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
        this._manager.combatManager.events.on('combat.move', ev => {
            const { turn, tick, attacker, target, speed, factor, distance } = ev
            const p100 = factor < 1
                ? ' (' + Math.round(factor * 100).toString() + '%)'
                : ''
            const sSpeed = speed.toString() + 'ft./turn' + p100
            console.log(this._tt(turn, tick), attacker.name, 'moves toward', target.name + "'s direction - speed:", sSpeed,  "- distance:", distance, 'ft')
        })
        this._manager.combatManager.events.on('combat.offensive-slot', ev => {
            const { turn, tick, attacker, target, weapon, slot } = ev
            console.log(this._tt(turn, tick), attacker.name, 'will now use :', weapon.ref)
        })
        this._manager.events.on('creature.saving-throw', ev => {
            const { creature, success, roll, bonus, dc, threat } = ev
            console.log(creature.name, 'saving throw against', threat.substring(13).toLowerCase(), ':', roll, '+', bonus, 'vs.', dc, ':', success ? 'SUCCESS' : 'FAILURE')
        })
        this._manager.events.on('creature.damage', ev => {
            const { creature, amount, damageType: sDamageType, source, subtype } = ev
            if (subtype !== CONSTS.EFFECT_SUBTYPE_WEAPON) {
                console.log(creature.name, 'receive damage', amount, '(' + sDamageType.substring(12).toLowerCase() + ')', 'from', source.name)
            }
        })
        this._manager.events.on('creature.heal', ev => {
            const { creature, amount, factor, source } = ev
            if (creature === source || !source) {
                console.log(creature.name, 'heals', amount, 'hp -', creature.getters.getHitPoints, '/', creature.getters.getMaxHitPoints)
            } else {
                console.log(creature.name, 'receive healing', amount, 'hp, from', source.name, ' - hp:', creature.getters.getHitPoints, '/', creature.getters.getMaxHitPoints)
            }
        })
        this.combatManager.startCombat(oMonster1, oMonster2)
    }

    advance () {
        if (this._tick % this.combatManager.defaultTickCount === 0) {
            this._manager.processEffects()
        }
        this.combatManager.processCombats()
        ++this._tick
    }
}


async function main (sMonster1, sMonster2) {
    const cs = new CombatSim()
    await cs.init()
    cs.initCombat(sMonster1, sMonster2)
    const LOOPS = 65535
    for (let i = 0; i <= LOOPS; ++i) {
        cs.advance()
        if (cs.combatManager.combats.length <= 0) {
            return 'All combats done after ' + i.toString() + ' loops'
        }
    }
    return 'Simulation interrupted after ' + LOOPS + 'loops'
}

main('c-succubus', 'c-goblin').then(x => console.log(x))
