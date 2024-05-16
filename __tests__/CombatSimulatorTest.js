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

describe('getMostSuitableAction', function () {
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
        oCombatLocust.advance()
        expect(oCombatLocust.distance).toBe(30)
        expect(oCombatLocust.turn).toBe(1)
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        oCombatLocust.advance()
        expect(oCombatLocust.tick).toBe(5)
        oCombatLocust.advance()
        expect(aLog.length).toBe(1)
        expect(aLog[0].action.name).toBe('spit')
        expect(oCombatLocust.attacker._actionCooldown).toEqual({ spit: 1 })

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



        // expect(aLog.length).toBe(0)
        // expect(oCombatLocust.attacker.isActionCoolingDown('spit', 20, oCombatLocust.turn)).toBeFalsy()
        // expect(oCombatLocust.attacker._nextAction.name).toBe('spit')
        // oCombatLocust.advance() // 0 -> 1
        // oCombatLocust.advance() // 1 -> 2
        // oCombatLocust.advance() // 2 -> 3
        // oCombatLocust.advance() // 3 -> 4
        // oCombatLocust.advance() // 4 -> 5
        // expect(aLog.length).toBe(0)
        //
        // oCombatLocust.distance = 30
        //
        // oCombatLocust.advance() // 5 -> 0 *** action
        // expect(oCombatLocust.getMostSuitableAction().name).toBe('spit')
    })
})

