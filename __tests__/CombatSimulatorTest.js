const Manager = require('../src/Manager')
const Combat = require('../src/combat/Combat')
const CONSTS = require("../src/consts");

describe('cooldown', function () {
    it('should register action correctly', async function () {
        const manager = new Manager()
        const ACTION_SPIT = {
            name: 'spit',
            cooldown: 20
        }
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-cave-locust'
        const sMonster2 = 'c-centaur'
        const oLocust = manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oCentaur = manager.createCreature({ id: 'm2', ref: sMonster2 })
        oLocust.name = sMonster1
        oCentaur.name = sMonster2
        const combatManager = manager.combatManager
        combatManager.startCombat(oLocust, oCentaur)
        const oCombatLocust = combatManager.getCombat(oLocust)
        oCombatLocust.attacker.checkActionCooldown(ACTION_SPIT, 2)
        expect(oCombatLocust.attacker._actionCooldown).toEqual({ spit: 2 })
        expect(oCombatLocust.attacker.isActionCoolingDown(ACTION_SPIT, 2)).toBeFalsy()
        expect(oCombatLocust.attacker.isActionCoolingDown(ACTION_SPIT, 3)).toBeTruthy()
        expect(oCombatLocust.attacker.isActionCoolingDown(ACTION_SPIT, 21)).toBeTruthy()
        expect(oCombatLocust.attacker.isActionCoolingDown(ACTION_SPIT, 22)).toBeFalsy()
    })
})

describe('cooldown', function () {
    it('should select spit action', async function() {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-cave-locust'
        const sMonster2 = 'c-centaur'
        const oLocust = manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oCentaur = manager.createCreature({ id: 'm2', ref: sMonster2 })
        oLocust.name = sMonster1
        oCentaur.name = sMonster2
        const combatManager = manager.combatManager
        combatManager.startCombat(oLocust, oCentaur)
        const oCombatLocust = combatManager.getCombat(oLocust)
        expect(oCombatLocust).toBeDefined()
        expect(oCombatLocust.getMostSuitableOffensiveSlot()).toBe('')
        expect(oCombatLocust.attacker.creature.getters.getActions).toEqual({
            "bite": {
                "name": "bite",
                "attackType": "ATTACK_TYPE_MELEE",
                "damage": "1d2",
                "damageType": "DAMAGE_TYPE_PHYSICAL",
                "count": 1,
                "cooldown": 0,
                "conveys": [
                ]
            },
            "bump": {
                "name": "bump",
                "attackType": "ATTACK_TYPE_MELEE",
                "damage": "1d4",
                "damageType": "DAMAGE_TYPE_PHYSICAL",
                "count": 1,
                "cooldown": 0,
                "conveys": [
                ]
            },
            "spit": {
                "name": "spit",
                "attackType": "ATTACK_TYPE_RANGED_TOUCH",
                "damage": 0,
                "damageType": "DAMAGE_TYPE_PHYSICAL",
                "count": 1,
                "cooldown": 20,
                "conveys": [
                    {
                        "script": "atk-stun",
                        "data": {
                            "duration": 3
                        }
                    }
                ]
            }

        })
        expect(oCombatLocust.attacker.creature.getters.getMeleeActions).toEqual([
            "bite",
            "bump"
        ])
        expect(oCombatLocust.attacker.creature.getters.getRangedActions).toEqual([
            "spit"
        ])
        oLocust.dice.cheat(0.5)
        expect(oCombatLocust.getMostSuitableAction()).toEqual({
            "name": "spit",
            "attackType": "ATTACK_TYPE_RANGED_TOUCH",
            "damage": 0,
            "damageType": "DAMAGE_TYPE_PHYSICAL",
            "count": 1,
            "cooldown": 20,
            "conveys": [
                {
                    data: {
                        duration: 3
                    },
                    script: "atk-stun"
                }
            ]
        })
    })
    it('should not select spit action twice because of cooldown', async function() {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-cave-locust'
        const sMonster2 = 'c-centaur'
        const oLocust = manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oCentaur = manager.createCreature({ id: 'm2', ref: sMonster2 })
        oLocust.name = sMonster1
        oCentaur.name = sMonster2
        const combatManager = manager.combatManager
        combatManager.startCombat(oLocust, oCentaur)
        const oCombatLocust = combatManager.getCombat(oLocust)
        oCombatLocust.distance = 30
        expect(oCombatLocust).toBeDefined()
        expect(oCombatLocust.getMostSuitableOffensiveSlot()).toBe('')
        oLocust.dice.cheat(0.99)
        const aLog = []
        oCombatLocust.events.on('combat.action', ev => {
            aLog.push(ev)
        })
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        expect(aLog.length).toBe(1)
        expect(aLog[0].turn).toBe(0)
        expect(aLog[0].action.name).toBe('spit')
        expect(oCombatLocust.attacker._actionCooldown).toEqual({ spit: 0 })
        expect(oCombatLocust.turn).toBe(1)

        const emptyLog = () => {
            aLog.splice(0, aLog.length)
        }

        emptyLog()
        expect(oCombatLocust.distance).toBe(30)
        oCombatLocust.advance() // 0
        // Spit en cooldown, et pas d'autre compétence à distance : on avance de 20
        expect(oCombatLocust.distance).toBe(10) // La distance doit etre de 10 maintenant
        expect(oCombatLocust.turn).toBe(1)
        oCombatLocust.advance() // 1
        oCombatLocust.advance() // 2
        oCombatLocust.advance() // 3
        oCombatLocust.advance() // 4
        oCombatLocust.advance() // 5
        expect(aLog.length).toBe(0)
        expect(oCombatLocust.attacker._actionCooldown).toEqual({ spit: 0 })

        oCombatLocust.turn = 19
        oCombatLocust.tick = 0
        // debut tour 19
        // spit toujours cooldown
        oCombatLocust.advance() // 0 -> 1
        oCombatLocust.advance() // 1 -> 2
        oCombatLocust.advance() // 2 -> 3
        oCombatLocust.advance() // 3 -> 4
        oCombatLocust.advance() // 4 -> 5
        oCombatLocust.advance() // 5 -> 0

        // Début tour 20
        expect(oCombatLocust.turn).toBe(20)
        expect(oCombatLocust.tick).toBe(0)
        expect(oCombatLocust.distance).toBe(5)
        oCombatLocust.advance() // 0 -> 1
        oCombatLocust.advance() // 1 -> 2
        oCombatLocust.advance() // 2 -> 3
        oCombatLocust.advance() // 3 -> 4
        oCombatLocust.advance() // 4 -> 5
        oCombatLocust.advance() // 5 -> 0
        expect(aLog.length).toBe(1)
        expect(aLog[0].action.name).toBe('bump')
    })

    it('should attack with attack 1 each 3 turns', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-cave-locust'
        const sMonster2 = 'c-centaur'
        const oLocust = manager.createCreature({ id: 'm1', ref: sMonster1 })
        const oCentaur = manager.createCreature({ id: 'm2', ref: sMonster2 })
        oLocust.name = sMonster1
        oCentaur.name = sMonster2
        oLocust.mutations.defineActions({ "actions": [
                {
                    "name": "bite-cd",
                    "attackType": "ATTACK_TYPE_MELEE",
                    "damage": "1d2",
                    "damageType": "DAMAGE_TYPE_PHYSICAL",
                    "count": 1,
                    "cooldown": 3,
                    "conveys": []
                },
                {
                    "name": "bump",
                    "attackType": "ATTACK_TYPE_MELEE",
                    "damage": "1d4",
                    "damageType": "DAMAGE_TYPE_PHYSICAL",
                    "count": 1,
                    "cooldown": 0,
                    "conveys": []
                },
                {
                    "name": "spit",
                    "attackType": "ATTACK_TYPE_RANGED_TOUCH",
                    "damage": 0,
                    "damageType": "DAMAGE_TYPE_PHYSICAL",
                    "count": 1,
                    "cooldown": 20,
                    "conveys": [
                        {
                            "script": "atk-stun",
                            "data": {
                                "duration": "3d6"
                            }
                        }
                    ]
                }
            ]})
        oLocust.dice.cheat(0.9)
        const combatManager = manager.combatManager
        combatManager.startCombat(oLocust, oCentaur)
        const oCombatLocust = combatManager.getCombat(oLocust)
        oCombatLocust.distance = 5
        let oLastLog = null
        oCombatLocust.events.on('combat.action', ev => {
            oLastLog = ev
        })
        oCombatLocust.advance() // turn 0 tick 0
        oCombatLocust.advance() // turn 0 tick 1
        oCombatLocust.advance() // turn 0 tick 2
        oCombatLocust.advance() // turn 0 tick 3
        oCombatLocust.advance() // turn 0 tick 4
        oCombatLocust.advance() // turn 0 tick 5
        expect(oLastLog).toBeDefined()
        expect(oLastLog.action.name).toBe('bite-cd')
        expect(oLastLog.turn).toBe(0)
        expect(oCombatLocust.getActionCooldownRegistry()).toEqual({
            "bite-cd": 2,
            "bump": 0,
            "spit": 0
        })

        oCombatLocust.advance() // turn 1 tick 0
        oCombatLocust.advance() // turn 1 tick 1
        oCombatLocust.advance() // turn 1 tick 2
        oCombatLocust.advance() // turn 1 tick 3
        oCombatLocust.advance() // turn 1 tick 4
        oCombatLocust.advance() // turn 1 tick 5
        expect(oLastLog.action.name).toBe('bump')
        expect(oLastLog.turn).toBe(1)

        oCombatLocust.advance() // turn 2 tick 0
        oCombatLocust.advance() // turn 2 tick 1
        oCombatLocust.advance() // turn 2 tick 2
        oCombatLocust.advance() // turn 2 tick 3
        oCombatLocust.advance() // turn 2 tick 4
        oCombatLocust.advance() // turn 2 tick 5
        expect(oLastLog.action.name).toBe('bump')
        expect(oLastLog.turn).toBe(2)


        oCombatLocust.advance() // turn 3 tick 0
        oCombatLocust.advance() // turn 3 tick 1
        oCombatLocust.advance() // turn 3 tick 2
        oCombatLocust.advance() // turn 3 tick 3
        oCombatLocust.advance() // turn 3 tick 4
        oCombatLocust.advance() // turn 3 tick 5
        expect(oLastLog.action.name).toBe('bite-cd')
        expect(oLastLog.turn).toBe(3)
    })
})

describe('multi melee attacks', function () {
    it('should attack several enemy', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-monster-1'
        const sMonster2 = 'c-monster-2'
        const m1 = manager.createCreature({ id: 'm1' })
        m1.mutations.setLevel({ value: 10 })
        m1.mutations.defineActions({ "actions": [
                {
                    "name": "bite-mm",
                    "attackType": "ATTACK_TYPE_MULTI_MELEE",
                    "damage": "1d2",
                    "damageType": "DAMAGE_TYPE_PHYSICAL",
                    "count": 2,
                    "cooldown": 0,
                    "conveys": []
                }
            ]})
        const m2 = manager.createCreature({ id: 'm2' })
        m2.mutations.setLevel({ value: 10 })
        const m3 = manager.createCreature({ id: 'm3' })
        m3.mutations.setLevel({ value: 10 })
        const m4 = manager.createCreature({ id: 'm4' })
        m4.mutations.setLevel({ value: 10 })

        const combatManager = manager.combatManager
        combatManager.startCombat(m1, m2).distance = 5
        combatManager.startCombat(m2, m1).distance = 5
        combatManager.startCombat(m3, m1).distance = 5
        combatManager.startCombat(m4, m1).distance = 5
        const oCombatLocust = combatManager.getCombat(m1)
        expect(combatManager.getOffenders(m1, Infinity).length).toBe(3)
        expect(combatManager.combats.length).toBe(4)

        const aLog = []
        combatManager.events.on('combat.action', ev => {
            aLog.push({
                atk: ev.attacker.id,
                def: ev.target.id,
                turn: ev.turn,
                tick: ev.tick,
                action: ev.action.name
            })
        })
        oCombatLocust.advance() // turn 0 tick 0
        oCombatLocust.advance() // turn 0 tick 1
        m1.dice.cheat(0)
        oCombatLocust.advance() // turn 0 tick 2
        oCombatLocust.advance() // turn 0 tick 3
        oCombatLocust.advance() // turn 0 tick 4
        m1.dice.cheat(0.6)
        oCombatLocust.advance() // turn 0 tick 5
        expect(aLog).toEqual([
            { atk: 'm1', def: 'm2', turn: 0, tick: 2, action: 'bite-mm' },
            { atk: 'm1', def: 'm3', turn: 0, tick: 5, action: 'bite-mm' }
        ])
    })
    it('should not attack several enemy when target die before strike', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sMonster1 = 'c-monster-1'
        const sMonster2 = 'c-monster-2'
        const m1 = manager.createCreature({ id: 'm1' })
        m1.mutations.setLevel({ value: 10 })
        m1.mutations.defineActions({ "actions": [
                {
                    "name": "bite-mm",
                    "attackType": "ATTACK_TYPE_MULTI_MELEE",
                    "damage": "1d2",
                    "damageType": "DAMAGE_TYPE_PHYSICAL",
                    "count": 2,
                    "cooldown": 0,
                    "conveys": []
                }
            ]})
        const m2 = manager.createCreature({ id: 'm2' })
        m2.mutations.setLevel({ value: 10 })
        const m3 = manager.createCreature({ id: 'm3' })
        m3.mutations.setLevel({ value: 10 })
        const m4 = manager.createCreature({ id: 'm4' })
        m4.mutations.setLevel({ value: 10 })

        const combatManager = manager.combatManager
        combatManager.startCombat(m1, m2).distance = 5
        combatManager.startCombat(m2, m1).distance = 5
        combatManager.startCombat(m3, m1).distance = 5
        combatManager.startCombat(m4, m1).distance = 5
        const oCombatLocust = combatManager.getCombat(m1)
        expect(combatManager.getOffenders(m1, Infinity).length).toBe(3)
        expect(combatManager.combats.length).toBe(4)

        const aLog = []
        combatManager.events.on('combat.action', ev => {
            aLog.push({
                atk: ev.attacker.id,
                def: ev.target.id,
                turn: ev.turn,
                tick: ev.tick,
                action: ev.action.name
            })
        })
        oCombatLocust.advance() // turn 0 tick 0
        oCombatLocust.advance() // turn 0 tick 1
        m1.dice.cheat(0)
        oCombatLocust.advance() // turn 0 tick 2
        oCombatLocust.advance() // turn 0 tick 3
        m1.dice.cheat(0.6)
        combatManager.removeFighter(m3)
        oCombatLocust.advance() // turn 0 tick 4
        oCombatLocust.advance() // turn 0 tick 5
        expect(aLog).toEqual([
            { atk: 'm1', def: 'm2', turn: 0, tick: 2, action: 'bite-mm' },
            { atk: 'm1', def: 'm4', turn: 0, tick: 5, action: 'bite-mm' }
        ])
    })
})

describe('Iron Golem Combat vs Bronze Golem', function () {
    it('should not do poison damage when attacking', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const sGolemIron = 'c-golem-iron'
        const sGolemBronze = 'c-golem-bronze'
        const giron = manager.createCreature({ id: 'giron', ref: sGolemIron })
        const gbronze = manager.createCreature({ id: 'gbronze', ref: sGolemBronze })

        const advance = function () {
            manager.processEffects()
            manager.combatManager.processCombats()
        }

        const combatManager = manager.combatManager
        const cgg = combatManager.startCombat(giron, gbronze)
        cgg.distance = 5
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
    })
})


describe('Succubus vs Goblin', function () {
    it('should be capable of fighting', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const suc = manager.createCreature({ id: 'suc', ref: 'c-succubus' })
        expect(suc.getters.getCapabilities.fight).toBeTruthy()
    })
    it('should emit combat.action with action.name = kiss event when using kiss action', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const suc = manager.createCreature({ id: 'suc', ref: 'c-succubus' })
        const gob = manager.createCreature({ id: 'gob', ref: 'c-goblin' })

        const combatManager = manager.combatManager
        const c = combatManager.startCombat(suc, gob)
        const aLog = []
        let sLastActionName = ''
        c.attacker.plan = [1, 1, 1, 1, 1, 1]

        c.events.on('combat.action', ({
            action
        }) => {
            sLastActionName = action.name
        })

        c.attacker.nextAction = c.attackerActions.kiss
        c.playFighterAction(c.attacker)

        expect(sLastActionName).toBe('kiss')
    })

    it('action kiss should not hit when distance is 30', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const suc = manager.createCreature({ id: 'suc', ref: 'c-succubus' })
        const gob = manager.createCreature({ id: 'gob', ref: 'c-goblin' })

        const combatManager = manager.combatManager
        const c = combatManager.startCombat(suc, gob)
        c.distance = 30
        c.attacker.plan = [1, 1, 1, 1, 1, 1]
        let oLastOutcome = null

        manager.events.on('combat.attack', ({
            outcome
        }) => {
            oLastOutcome = outcome
        })

        c.attacker.nextAction = c.attackerActions.kiss
        c.playFighterAction(c.attacker)
        expect(oLastOutcome.distance).toBe(30)
        expect(oLastOutcome).not.toBeNull()
        expect(oLastOutcome.failed).toBeTruthy()
        expect(oLastOutcome.failure).toBe('ATTACK_FAILURE_TARGET_UNREACHABLE')
    })

    it('should try to do ai script', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const suc = manager.createCreature({ id: 'suc', ref: 'c-succubus' })
        const gob = manager.createCreature({ id: 'gob', ref: 'c-goblin' })
        gob.dice.cheat(0.1)
        suc.dice.cheat(0.9)

        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        const combatManager = manager.combatManager
        const c = combatManager.startCombat(suc, gob)
        const aLog = []

        const f = ({ turn, tick, attacker }, ...params) => {
            if (attacker === undefined) {
                throw new Error('no creature in event')
            }
            if (isNaN(turn)) {
                throw new Error('no turn value in event')
            }
            if (isNaN(tick)) {
                throw new Error('no tick value in event')
            }
            aLog.push('[' + turn + ':' + tick + '] ' + attacker.id + ': ' + params.join(' '))
        }

        manager.events.on('combat.distance', ev => {
            f(ev, 'new distance', ev.distance)
        })

        manager.events.on('combat.move', ev => {
            f(ev, 'moves towards', ev.target.id, 'at speed', ev.speed)
        })

        manager.events.on('combat.action', ev => {
            f(ev, 'action', ev.action.name, 'on target', ev.target.id)
        })

        suc.events.on('info', ({ info }) => {
            aLog.push('info suc: ' + info)
        })

        manager.events.on('combat.attack', ev => {
            const { turn, tick, attackIndex: iAtk, outcome: oAttackOutcome } = ev
            if (oAttackOutcome.failed) {
                f({
                        ...ev,
                        attacker: oAttackOutcome.attacker
                    },
                    'failed to attack', oAttackOutcome.target.id,
                    'beacause', oAttackOutcome.failure,
                    'action', oAttackOutcome.action?.name || '(none)',
                    'weapon', oAttackOutcome.weapon?.ref || '(none)',
                    'distance', oAttackOutcome.distance,
                    'range', oAttackOutcome.range,
                )
            } else {
                f({
                        ...ev,
                        attacker: oAttackOutcome.attacker
                    },
                    'attacks', oAttackOutcome.target.id,
                    oAttackOutcome.weapon ? 'with weapon ' + oAttackOutcome.weapon.ref : '',
                    'distance', oAttackOutcome.distance,
                    'range', oAttackOutcome.range,
                    'roll', oAttackOutcome.roll, '+',
                    'bonus', oAttackOutcome.bonus,
                    '=', oAttackOutcome.roll + oAttackOutcome.bonus,
                    'vs. ac', oAttackOutcome.ac,
                    oAttackOutcome.hit ? 'HIT' : 'MISS')
            }
        })

        manager.events.on('creature.saving-throw', ev => {
            aLog.push([ev.creature.id, 'saving throw against', ev.savingThrow, 'roll', ev.total, 'vs.', ev.dc, ev.success ? 'SUCCESS' : 'FAILURE'].join(' '))
        })

        manager.events.on('creature.effect.applied', ev => {
            switch (ev.effect.type) {
                case 'EFFECT_CHARM': {
                    aLog.push([ev.target.id,'is charmed by', ev.source.id, 'for duration', ev.effect.duration].join(' '))
                    break
                }

                case 'EFFECT_NEGATIVE_LEVEL': {
                    aLog.push([ev.target.id,'loses', ev.effect.amp, 'level(s) for duration', ev.effect.duration].join(' '))
                    break
                }

                case 'EFFECT_HEAL': {
                    aLog.push([ev.target.id, 'gains', ev.effect.amp, 'hp'].join(' '))
                    break
                }

                default: {
                    aLog.push([ev.effect.type, 'applied on', ev.target.id, 'with amp', ev.effect.amp].join(' '))
                }
            }
        })

        advance()
        advance()
        advance()
        advance()
        advance()
        advance()
        // console.log(aLog)
    })
})

describe('testing sneak attacks', function () {
    it('shoud do sneak attack when attacking target already in fight', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: 'CLASS_TYPE_FIGHTER' })
        c1.mutations.setLevel({ value: 10 })
        c1.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        c1.mutations.setRace({ value: 'RACE_HUMAN' })
        c1.mutations.setHitPoints({ value: c1.getters.getMaxHitPoints })
        const c2 = manager.createCreature({ id: 'c2' })
        c2.mutations.setClassType({ value: 'CLASS_TYPE_FIGHTER' })
        c2.mutations.setLevel({ value: 10 })
        c2.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        c2.mutations.setRace({ value: 'RACE_HUMAN' })
        c2.mutations.setHitPoints({ value: c2.getters.getMaxHitPoints })

        const c3 = manager.createCreature({ id: 'c3' })
        c3.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        c3.mutations.setLevel({ value: 10 })
        c3.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        c3.mutations.setRace({ value: 'RACE_HUMAN' })
        c3.mutations.setHitPoints({ value: c3.getters.getMaxHitPoints })

        manager.combatManager.startCombat(c1, c2)
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }
        advance()
        advance()
        expect(manager.combatManager.isCreatureFighting(c1, c2)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(c2, c1)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(c3, c1)).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(c3, c2)).toBeFalsy()
        manager.combatManager.startCombat(c3, c2)
        expect(manager.combatManager.isCreatureFighting(c3, c2)).toBeTruthy()
        advance()
        advance()
        expect(manager.combatManager.isCreatureFighting(c1, c2)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(c2, c1)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(c3, c2)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(c2, c3)).toBeFalsy()
        let oOutcome
        manager.events.on('combat.attack', ev => {
            if (ev.outcome.attacker === c3) {
                oOutcome = ev.outcome
            }
        })
        advance()
        expect(oOutcome).toBeDefined()
        expect(oOutcome.attacker).toBe(c3)
        expect(oOutcome.target).toBe(c2)
        expect(c3.getters.getCapabilities.sneak).toBeTruthy()
        expect(oOutcome.sneakable).toBeTruthy()
    })

    it('should do sneak attack when entering hide mode', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const fighter = manager.createCreature({ id: 'fighter' })
        fighter.mutations.setClassType({ value: 'CLASS_TYPE_FIGHTER' })
        fighter.mutations.setLevel({ value: 10 })
        fighter.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        fighter.mutations.setRace({ value: 'RACE_HUMAN' })
        fighter.mutations.setHitPoints({ value: fighter.getters.getMaxHitPoints })

        const rogue = manager.createCreature({ id: 'rogue' })
        rogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        rogue.mutations.setLevel({ value: 10 })
        rogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        rogue.mutations.setRace({ value: 'RACE_HUMAN' })
        rogue.mutations.setHitPoints({ value: rogue.getters.getMaxHitPoints })

        let oOutcomeFighter
        let oOutcomeRogue
        manager.events.on('combat.attack', ev => {
            if (ev.outcome.attacker === rogue) {
                oOutcomeRogue = ev.outcome
            }
            if (ev.outcome.attacker === fighter) {
                oOutcomeFighter = ev.outcome
            }
        })
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        rogue.dice.cheat(0.999)

        manager.applyEffect(manager.createEffect(CONSTS.EFFECT_STEALTH), rogue, Infinity)
        expect(rogue.getters.getEffectSet.has(CONSTS.EFFECT_STEALTH))
        expect(fighter.getCreatureVisibility(rogue)).toBe(CONSTS.CREATURE_VISIBILITY_HIDDEN)
        const c = manager.combatManager.startCombat(rogue, fighter)
        expect(oOutcomeRogue).toBeUndefined()
        expect(manager.combatManager.isCreatureAttacked(fighter)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(fighter)).toBeFalsy()
        expect(manager.combatManager.isCreatureAttacked(rogue)).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(rogue)).toBeTruthy()
        expect(c.distance).toBe(50)

        advance()
        expect(c.distance).toBe(20) // still far from target
        expect(oOutcomeRogue).toBeUndefined() // no attack made by rogue so far
        expect(oOutcomeFighter).toBeUndefined() // no attack made by fighter so far
        expect(fighter.getCreatureVisibility(rogue)).toBe(CONSTS.CREATURE_VISIBILITY_HIDDEN)
        advance()
        expect(c.distance).toBe(5) // came at close range, attack will be done next turn
        expect(oOutcomeRogue).toBeUndefined() // no attack made by rogue so far
        expect(oOutcomeFighter).toBeUndefined() // no attack made by fighter so far
        expect(fighter.getCreatureVisibility(rogue)).toBe(CONSTS.CREATURE_VISIBILITY_HIDDEN)
        advance()
        expect(c.distance).toBe(5)
        expect(oOutcomeRogue).toBeDefined() // attack has occured
        expect(oOutcomeRogue.hit).toBeTruthy()
        expect(oOutcomeFighter).toBeUndefined()
        expect(oOutcomeRogue.sneakable).toBeTruthy()
        expect(rogue.getters.getEffectSet.has(CONSTS.EFFECT_STEALTH)).toBeFalsy()
        // rogue is now visible to the fighter
        expect(fighter.getCreatureVisibility(rogue)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)

        // attack occured, next turn, fighter will attack back
        expect(manager.combatManager.isCreatureFighting(fighter, rogue)).toBeTruthy()

        advance()
        // Now fighter should be aware of rogue
        expect(manager.combatManager.isCreatureFighting(fighter, rogue)).toBeTruthy()
        // no more sneak attack for the combat
        expect(oOutcomeRogue.sneakable).toBeFalsy()
    })
    it('should be hide 70 when race is halfling', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const rogue = manager.createCreature({ id: 'rogue' })
        rogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        rogue.mutations.setLevel({ value: 10 })
        rogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        rogue.mutations.setRace({ value: 'RACE_HALFLING' })
        rogue.mutations.setHitPoints({ value: rogue.getters.getMaxHitPoints })
        const humanHogue = manager.createCreature({ id: 'hrogue' })
        humanHogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanHogue.mutations.setLevel({ value: 10 })
        humanHogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanHogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanHogue.mutations.setHitPoints({ value: humanHogue.getters.getMaxHitPoints })
        expect(humanHogue.getters.getClassTypeData.rogueSkills[CONSTS.SKILL_HIDE]).toBe(53)
        const humanFighter = manager.createCreature({ id: 'hrogue' })
        humanFighter.mutations.setClassType({ value: 'CLASS_TYPE_FIGHTER' })
        humanFighter.mutations.setLevel({ value: 10 })
        humanFighter.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanFighter.mutations.setRace({ value: 'RACE_HUMAN' })
        humanFighter.mutations.setHitPoints({ value: humanFighter.getters.getMaxHitPoints })
        expect(humanFighter.getters.getClassTypeData.rogueSkills[CONSTS.SKILL_HIDE]).toBe(0)
    })
    it('should be able to sneak attack when room is dark and rogue is elven (darkvision', async function (){
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const elfRogue = manager.createCreature({ id: 'elfrogue' })
        elfRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        elfRogue.mutations.setLevel({ value: 10 })
        elfRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfRogue.mutations.setRace({ value: 'RACE_ELF' })
        elfRogue.mutations.setHitPoints({ value: elfRogue.getters.getMaxHitPoints })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const setRoomBrightness = n => {
            humanRogue.mutations.setEnvironment({ environment: 'darkness', value: n < 0.5 })
            elfRogue.mutations.setEnvironment({ environment: 'darkness', value: n < 0.5 })
        }


        expect(humanRogue.getCreatureVisibility(elfRogue)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)
        expect(elfRogue.getCreatureVisibility(humanRogue)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)
        setRoomBrightness(0)
        expect(humanRogue.getCreatureVisibility(elfRogue)).toBe(CONSTS.CREATURE_VISIBILITY_DARKNESS)
        expect(elfRogue.getCreatureVisibility(humanRogue)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)

        let oOutcomeElf
        let oOutcomeHum
        manager.events.on('combat.attack', ev => {
            if (ev.outcome.attacker === elfRogue) {
                oOutcomeElf = ev.outcome
            }
            if (ev.outcome.attacker === humanRogue) {
                oOutcomeHum = ev.outcome
            }
        })

        const c = manager.combatManager.startCombat(elfRogue, humanRogue)
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        // elf should sneak all the time
        // human should have an attack malus

        elfRogue.dice.cheat(0.999)
        humanRogue.dice.cheat(0.999)

        advance()
        expect(c.distance).toBe(20)
        advance()
        expect(c.distance).toBe(5)
        expect(oOutcomeElf).toBeUndefined()
        expect(oOutcomeHum).toBeUndefined()
        expect(manager.combatManager.isCreatureFighting(elfRogue, humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue, elfRogue)).toBeFalsy()
        advance()
        expect(c.distance).toBe(5)
        expect(oOutcomeElf).toBeDefined()
        expect(oOutcomeHum).toBeUndefined() // human cannot see elf at this moment
        expect(manager.combatManager.isCreatureFighting(elfRogue, humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue, elfRogue)).toBeTruthy()
        expect(c.distance).toBe(5)
        expect(manager.combatManager.combats.length).toBe(2)
        expect(c.distance).toBe(5)
        advance()
        expect(c.distance).toBe(5)
        expect(manager.combatManager.combats.length).toBe(2)
        expect(oOutcomeElf).toBeDefined()
        expect(c.distance).toBe(5)
        expect(oOutcomeHum).toBeDefined() // human is trying to hit elf at this moment
        expect(oOutcomeElf.bonus).toBe(9) // because darkvision in darkness -> ok, fine -> sneak attack bonus applies
        expect(oOutcomeHum.bonus).toBe(1) // because being in dark room with no darkvision -> non dection bonus
        expect(oOutcomeElf.sneakable).toBeTruthy()
        expect(oOutcomeHum.sneakable).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(elfRogue, humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue, elfRogue)).toBeTruthy()
        setRoomBrightness(1)

        advance()
        // room is now bright
        expect(oOutcomeElf.bonus).toBe(5) // no sneak, no darkness penalty
        expect(oOutcomeHum.bonus).toBe(5) // no sneak, no darkness penalty
        expect(oOutcomeElf.sneakable).toBeFalsy()
        expect(oOutcomeHum.sneakable).toBeFalsy()
    })
})

describe('dark room and light source', function () {
    it('should have property LIGHT and see others when equipping torch', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const humWizard = manager.createCreature({ id: 'elfwizard' })
        humWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        humWizard.mutations.setLevel({ value: 10 })
        humWizard.mutations.setRace({ value: 'RACE_HUMAN' })
        humWizard.mutations.setHitPoints({ value: humWizard.getters.getMaxHitPoints })

        const torch = manager.createItem({ id: 'torch', ref: 'misc-torch' })

        const other = manager.createCreature({ id: 'other' })

        // normal room : all visible
        expect(humWizard.getCreatureVisibility(other)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)
        expect(other.getCreatureVisibility(humWizard)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)

        // room becomes dark
        humWizard.mutations.setEnvironment({ environment: CONSTS.ENVIRONMENT_DARKNESS, value: true })
        other.mutations.setEnvironment({ environment: CONSTS.ENVIRONMENT_DARKNESS, value: true })

        expect(humWizard.getters.getEnvironment[CONSTS.ENVIRONMENT_DARKNESS]).toBeTruthy()

        // nothing visible
        expect(humWizard.getCreatureVisibility(other)).toBe(CONSTS.CREATURE_VISIBILITY_DARKNESS)
        expect(other.getCreatureVisibility(humWizard)).toBe(CONSTS.CREATURE_VISIBILITY_DARKNESS)

        // equipping human wizard with torch
        humWizard.mutations.equipItem({ item: torch })

        expect(humWizard.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_SHIELD]).toEqual(torch)
        expect(humWizard.getters.getPropertySet.has(CONSTS.ITEM_PROPERTY_LIGHT)).toBeTruthy()

        // all visible again
        expect(humWizard.getCreatureVisibility(other)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)
        expect(other.getCreatureVisibility(humWizard)).toBe(CONSTS.CREATURE_VISIBILITY_VISIBLE)
    })
})

describe('wands', function () {
    it('should attack with damage fire when using wand firebolt', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const elfWizard = manager.createCreature({ id: 'elfwizard' })
        elfWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        elfWizard.mutations.setLevel({ value: 10 })
        elfWizard.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfWizard.mutations.setRace({ value: 'RACE_ELF' })
        elfWizard.mutations.setHitPoints({ value: elfWizard.getters.getMaxHitPoints })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const wand = manager.createItem({ id: 'wandfire', ref: 'wand-firebolt' })
        elfWizard.mutations.equipItem({ item: wand })
        expect(elfWizard.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]).toEqual(wand)

        elfWizard.dice.cheat(0.99)

        let oOutcomeElf
        let oOutcomeHum
        manager.events.on('combat.attack.damaged', ev => {
            if (ev.outcome.attacker === elfWizard) {
                oOutcomeElf = ev.outcome
            }
            if (ev.outcome.attacker === humanRogue) {
                oOutcomeHum = ev.outcome
            }
        })

        const c = manager.combatManager.startCombat(elfWizard, humanRogue)
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        advance()
        expect(oOutcomeElf).toBeDefined()
        expect(oOutcomeElf.damages).toEqual({
            amount: 8,
            types: {
                DAMAGE_TYPE_FIRE: {
                    amount: 8,
                    resisted: 0
                }
            }
        })
    })

    it('should use a spell attached to a wand', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const MY_MODULE = {
            DATA: {},
            BLUEPRINTS: {
                'wand-vampire': {
                    "entityType": "ENTITY_TYPE_ITEM",
                    "itemType": "ITEM_TYPE_MAGICWAND",
                    "properties": [{
                        "property": "ITEM_PROPERTY_SPECIAL_BEHAVIOR",
                        "attack": "ai-spell-wand"
                    }],
                    "damageType": "DAMAGE_TYPE_NECROTIC"
                }
            },
            SCRIPTS: {
                'ai-spell-wand': function ({ attackOutcome }) {
                    if (attackOutcome.hit) {
                        attackOutcome.attacker.mutations.setHitPoints({ value: attackOutcome.attacker.getters.getHitPoints + 1 })
                    }
                }
            },
            name: 'spell-wand-module'
        }

        manager.loadModule(MY_MODULE)

        const elfWizard = manager.createCreature({ id: 'elfwizard' })
        elfWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        elfWizard.mutations.setLevel({ value: 10 })
        elfWizard.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfWizard.mutations.setRace({ value: 'RACE_ELF' })
        elfWizard.mutations.setHitPoints({ value: elfWizard.getters.getMaxHitPoints >> 1 })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const wand = manager.createItem({ id: 'wand', ref: 'wand-vampire'})

        expect(wand.properties[0]).toEqual({
          property: 'ITEM_PROPERTY_SPECIAL_BEHAVIOR',
          amp: 0,
          data: { combat: '', damaged: '', attack: 'ai-spell-wand' }
        })
        elfWizard.mutations.equipItem({ item: wand })

        expect(elfWizard.getters.getHitPoints).toBe(18)

        const c = manager.combatManager.startCombat(elfWizard, humanRogue)
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }
        humanRogue.dice.cheat(0.01)
        elfWizard.dice.cheat(0.95)

        const aLog = []

        manager.events.on('combat.move', ev => {
            aLog.push({
                ev: 'MOVE',
                d: ev.previousDistance,
                between: [ev.attacker.id, ev.target.id]
            })
        })
        manager.events.on('combat.attack', ev => {
            aLog.push({
                ev: 'ATTACK',
                between: [ev.outcome.attacker.id, ev.outcome.target.id],
                hit: ev.outcome.hit,
                action: ev.outcome.action && ev.outcome.action.name,
                weapon: ev.outcome.weapon && ev.outcome.weapon.ref,

            })
        })

        expect(elfWizard.getters.getHitPoints).toBe(18)
        advance()
        expect(aLog).toEqual([
            { ev: 'MOVE', d: 50, between: [ 'humrogue', 'elfwizard' ] },
            {
                ev: 'ATTACK',
                between: [ 'elfwizard', 'humrogue' ],
                hit: true,
                action: 'DEFAULT_ACTION_WEAPON',
                weapon: 'wand-vampire'
            }
        ])
        expect(elfWizard.getters.getHitPoints).toBe(19)
    })

    it('should not use a spell attached to a wand when attacking with melee weapon', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        let nWandTimes = 0

        const MY_MODULE = {
            DATA: {},
            BLUEPRINTS: {
                'wand-dummy': {
                    "entityType": "ENTITY_TYPE_ITEM",
                    "itemType": "ITEM_TYPE_MAGICWAND",
                    "properties": [{
                        "property": "ITEM_PROPERTY_SPECIAL_BEHAVIOR",
                        "attack": "ai-spell-wand"
                    }],
                    "damageType": "DAMAGE_TYPE_NECROTIC"
                }
            },
            SCRIPTS: {
                'ai-spell-wand': function ({ attackOutcome }) {
                    ++nWandTimes
                }
            },
            name: 'spell-wand-module'
        }

        manager.loadModule(MY_MODULE)

        const elfWizard = manager.createCreature({ id: 'elfwizard' })
        elfWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        elfWizard.mutations.setLevel({ value: 10 })
        elfWizard.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfWizard.mutations.setRace({ value: 'RACE_ELF' })
        elfWizard.mutations.setHitPoints({ value: elfWizard.getters.getMaxHitPoints })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const wand = manager.createItem({ id: 'wand', ref: 'wand-dummy'})
        const dagger = manager.createItem({ id: 'wand', ref: 'wpn-dagger'})

        elfWizard.mutations.equipItem({ item: wand })
        elfWizard.mutations.equipItem({ item: dagger })

        expect(elfWizard.getters.getHitPoints).toBe(37)

        const c = manager.combatManager.startCombat(elfWizard, humanRogue)
        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }
        humanRogue.dice.cheat(0.01)
        elfWizard.dice.cheat(0.95)

        const aLogMove = []
        const aLogAttack = []

        manager.events.on('combat.move', ev => {
            aLogMove.push({
                ev: 'MOVE',
                d: ev.previousDistance,
                between: [ev.attacker.id, ev.target.id]
            })
        })
        manager.events.on('combat.attack', ev => {
            if (ev.outcome.attacker.id === 'elfwizard') {
                aLogAttack.push({
                    ev: 'ATTACK',
                    between: [ev.outcome.attacker.id, ev.outcome.target.id],
                    hit: ev.outcome.hit,
                    action: ev.outcome.action && ev.outcome.action.name,
                    weapon: ev.outcome.weapon && ev.outcome.weapon.ref,

                })
            }
        })

        expect(nWandTimes).toBe(0)
        advance()
        expect(aLogAttack[aLogAttack.length - 1]).toEqual({
            ev: 'ATTACK',
            between: ['elfwizard', 'humrogue'],
            hit: true,
            action: 'DEFAULT_ACTION_WEAPON',
            weapon: 'wand-dummy'
        })
        expect(c.distance).toBe(20)
        expect(nWandTimes).toBe(1)
        advance()
        expect(aLogAttack[aLogAttack.length - 1]).toEqual({
            ev: 'ATTACK',
            between: ['elfwizard', 'humrogue'],
            hit: true,
            action: 'DEFAULT_ACTION_WEAPON',
            weapon: 'wand-dummy'
        })
        expect(c.distance).toBe(5)
        expect(nWandTimes).toBe(2)
        advance()
        expect(aLogAttack[aLogAttack.length - 1]).toEqual({
            ev: 'ATTACK',
            between: ['elfwizard', 'humrogue'],
            hit: true,
            action: 'DEFAULT_ACTION_WEAPON',
            weapon: 'wpn-dagger'
        })
        expect(c.distance).toBe(5)
        expect(nWandTimes).toBe(2) // wand is not used : script has not been triggered

    })

})

describe('fleeing from combat', function () {
    it('should delete coward combat when ending its combat', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const elfWizard = manager.createCreature({ id: 'elfwizard' })
        elfWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        elfWizard.mutations.setLevel({ value: 10 })
        elfWizard.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfWizard.mutations.setRace({ value: 'RACE_ELF' })
        elfWizard.mutations.setHitPoints({ value: elfWizard.getters.getMaxHitPoints })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const aLogAttack = []

        manager.events.on('combat.attack', ev => {
            aLogAttack.push({
                ev: 'ATTACK',
                between: [ev.outcome.attacker.id, ev.outcome.target.id],
                hit: ev.outcome.hit,
                action: ev.outcome.action && ev.outcome.action.name,
                weapon: ev.outcome.weapon && ev.outcome.weapon.ref,

            })
        })

        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        expect(manager.combatManager.isCreatureFighting(elfWizard)).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(humanRogue)).toBeFalsy()
        const c = manager.combatManager.startCombat(elfWizard, humanRogue, 5)
        expect(manager.combatManager.getCombat(elfWizard)).not.toBeNull()
        expect(manager.combatManager.getCombat(humanRogue)).not.toBeNull()
        advance()
        advance()
        advance()
        expect(elfWizard.getters.getHitPoints).toBeGreaterThan(0)
        expect(humanRogue.getters.getHitPoints).toBeGreaterThan(0)
        expect(manager.combatManager.isCreatureFighting(elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(elfWizard, humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue, elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureAttacked(elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureAttacked(humanRogue)).toBeTruthy()
        expect(manager.combatManager.getOffenders(elfWizard, 5)).toEqual([humanRogue])
        const n1 = manager.combatManager.combats.length
        manager.combatManager.endCombat(elfWizard)
        expect(manager.combatManager.getOffenders(elfWizard, 5)).toEqual([humanRogue])
        expect(manager.combatManager.getOffenders(humanRogue, 5)).toEqual([])
        expect(manager.combatManager.combats.length).toBe(n1 - 1)
        expect(manager.combatManager._fighters[elfWizard.id]).not.toBeDefined()
        expect(manager.combatManager.isCreatureFighting(elfWizard)).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(humanRogue)).toBeTruthy()
        expect(manager.combatManager.getCombat(elfWizard)).toBeNull()
        expect(manager.combatManager.getCombat(humanRogue)).toBeInstanceOf(Combat)
    })
    it('should attack when adversary fleeing combat', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        const elfWizard = manager.createCreature({ id: 'elfwizard' })
        elfWizard.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        elfWizard.mutations.setLevel({ value: 10 })
        elfWizard.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        elfWizard.mutations.setRace({ value: 'RACE_ELF' })
        elfWizard.mutations.setHitPoints({ value: elfWizard.getters.getMaxHitPoints })

        const humanRogue = manager.createCreature({ id: 'humrogue' })
        humanRogue.mutations.setClassType({ value: 'CLASS_TYPE_ROGUE' })
        humanRogue.mutations.setLevel({ value: 10 })
        humanRogue.mutations.setSpecie({ value: 'SPECIE_HUMANOID' })
        humanRogue.mutations.setRace({ value: 'RACE_HUMAN' })
        humanRogue.mutations.setHitPoints({ value: humanRogue.getters.getMaxHitPoints })

        const aLogAttack = []

        manager.events.on('combat.attack', ev => {
            aLogAttack.push({
                ev: 'ATTACK',
                between: [ev.outcome.attacker.id, ev.outcome.target.id],
                hit: ev.outcome.hit,
                action: ev.outcome.action && ev.outcome.action.name,
                weapon: ev.outcome.weapon && ev.outcome.weapon.ref,

            })
        })

        const advance = function () {
            manager.processEffects()
            for (let i = 0, l = manager.combatManager.defaultTickCount; i < l; ++i) {
                manager.combatManager.processCombats()
            }
        }

        expect(manager.combatManager.isCreatureFighting(elfWizard)).toBeFalsy()
        expect(manager.combatManager.isCreatureFighting(humanRogue)).toBeFalsy()
        const c = manager.combatManager.startCombat(elfWizard, humanRogue, 5)
        expect(manager.combatManager.getCombat(elfWizard)).not.toBeNull()
        expect(manager.combatManager.getCombat(humanRogue)).not.toBeNull()
        advance()
        advance()
        advance()
        expect(elfWizard.getters.getHitPoints).toBeGreaterThan(0)
        expect(humanRogue.getters.getHitPoints).toBeGreaterThan(0)
        expect(manager.combatManager.isCreatureFighting(elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(elfWizard, humanRogue)).toBeTruthy()
        expect(manager.combatManager.isCreatureFighting(humanRogue, elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureAttacked(elfWizard)).toBeTruthy()
        expect(manager.combatManager.isCreatureAttacked(humanRogue)).toBeTruthy()
        expect(manager.combatManager.getOffenders(elfWizard, 5)).toEqual([humanRogue])
        const aLog = []
        manager.combatManager.events.on('combat.end', ev => {
            aLog.push({ type: 'END', atk: ev.attacker.id })
        })
        manager.combatManager.events.on('combat.action', ev => {
            aLog.push({ type: 'ACTION', atk: ev.attacker.id, def: ev.target.id, action: ev.action.name })
        })
        expect(aLog).toEqual([])

        manager.combatManager.fleeCombat(elfWizard)
        expect(aLog).toEqual([
            {
                type: 'END',
                atk: 'elfwizard'
            }, {
                type: 'ACTION',
                atk: 'humrogue',
                def: 'elfwizard',
                action: 'DEFAULT_ACTION_UNARMED'
            },
            { type: 'END', atk: 'humrogue' }
        ])
        expect(manager.combatManager.combats.length).toBe(0)
    })
})
