const Manager = require('../src/Manager')

describe('getMostSuitableAction', function () {
    it('should select bump action', async function() {
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
                "conveys": [
                ]
            },
            "bump": {
                "name": "bump",
                "attackType": "ATTACK_TYPE_MELEE",
                "damage": "1d4",
                "damageType": "DAMAGE_TYPE_PHYSICAL",
                "count": 1,
                "conveys": [
                ]
            },
            "spit": {
                "name": "spit",
                "attackType": "ATTACK_TYPE_RANGED_TOUCH",
                "damage": 0,
                "damageType": "DAMAGE_TYPE_PHYSICAL",
                "count": 1,
                "conveys": [
                    {
                        "script": "daze",
                        "data": {}
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
            "name": "bump",
            "attackType": "ATTACK_TYPE_MELEE",
            "damage": "1d4",
            "damageType": "DAMAGE_TYPE_PHYSICAL",
            "count": 1,
            "conveys": [
            ]
        })
    })
})