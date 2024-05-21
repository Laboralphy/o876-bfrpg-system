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
