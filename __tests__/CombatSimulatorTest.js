const Manager = require('../src/Manager')

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
        oCombatLocust.attacker.setActionCooldown(ACTION_SPIT, 2)
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
                            "duration": '3d6'
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
                        duration: '3d6'
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
        // Spit en cooldown, et pas d'autre compétence à distance : on avance
        expect(oCombatLocust.distance).toBe(10)
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
    it('should try to do ai script', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')
        const suc = manager.createCreature({ id: 'suc', ref: 'c-succubus' })
        const gob = manager.createCreature({ id: 'gob', ref: 'c-goblin' })

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
            f({
                ...ev,
                attacker: oAttackOutcome.attacker
            },
                'attacks', oAttackOutcome.target.id,
                'roll', oAttackOutcome.roll, '+',
                'bonus', oAttackOutcome.bonus,
                '=', oAttackOutcome.roll + oAttackOutcome.bonus,
                'vs. ac', oAttackOutcome.ac,
                oAttackOutcome.hit ? 'HIT' : 'MISS')
        })

        manager.events.on('creature.saving-throw', ev => {
            aLog.push([ev.creature.id, 'saving throw against', ev.threat, 'roll', ev.total, 'vs.', ev.dc, ev.success ? 'SUCCESS' : 'FAILURE'].join(' '))
        })

        manager.events.on('creature.effect-applied', ev => {
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

        console.log(aLog)
    })
})