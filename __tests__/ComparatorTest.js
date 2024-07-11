const { Manager, Creature, CONSTS} = require('../')
const Comparator = require('../src/Comparator')

describe('test1', function () {
    it('should create a goblin', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        expect(c1).toBeInstanceOf(Creature)
    })
})

describe('Comparator.getActionStats', function () {
    it('should get action stat of an ogre strike', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        const c3 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        // console.log(Comparator.getWeaponStats(c1, c2, c1.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]))
        expect(Comparator.getActionStats(c2, c1, c2.getters.getActions.strike)).toEqual({
            hp: 8,
            ac: 13,
            atk: 4,
            damageTypes: { DAMAGE_TYPE_PHYSICAL: 7 },
            damages: 7
        })
    })
    it('should have irrevelant wepaon stat when having actions', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c3 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        expect(Comparator.getMeleeWeaponStats(c3, c1, c3.getters.getActions.claws)).toBeNull()
    })
})

describe('Test mixed dpt with cooldown', function () {
    it('should blend sevral dpt with some cooldown', function () {
        const { damageMap, mean } = (Comparator.blendDPT([
            {
                damages: 10,
                cooldown: 10
            },
            {
                damages: 7,
                cooldown: 3
            },
            {
                damages: 3,
                cooldown: 0
            }
        ]))
        expect(damageMap).toEqual([
            10, 7, 3, 3, 7, 3, 3, 7, 3, 3,
            10, 7, 3, 3, 7, 3, 3, 7, 3, 3,
            10, 7, 3, 3, 7, 3, 3, 7, 3, 3,
            10, 7, 3, 3, 7, 3, 3, 7, 3, 3,
            10, 7, 3, 3
        ])
        expect(mean).toBeCloseTo(4.9773, 4)
    })
    it('should blend sevral dpt with no cooldown', function () {
        const { damageMap, mean } = (Comparator.blendDPT([
            {
                damages: 5,
                cooldown: 0
            },
            {
                damages: 3,
                cooldown: 0
            },
            {
                damages: 2,
                cooldown: 0
            }
        ]))
        expect(damageMap).toEqual([5, 3, 2])
        expect(mean).toBeCloseTo(3.3333, 4)
    })
})

describe('Comparator.getMeleeWeaponStats', function () {
    it('should return get weapon stat of a gobelin', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toEqual({
            hp: 32,
            ac: 14,
            atk: 1,
            damageTypes: { DAMAGE_TYPE_PHYSICAL: 2.5 },
            damages: 2.5
        })
    })
    it('should lower DPT when target is weapon resistant', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-solar' })
        expect(CONSTS.ITEM_PROPERTY_DAMAGE_RESISTANCE).toBe('ITEM_PROPERTY_DAMAGE_RESISTANCE')
        expect(c2.getters.getPropertySet.has(CONSTS.ITEM_PROPERTY_DAMAGE_RESISTANCE)).toBeTruthy()
        expect(c2.getters.getDamageMitigation).toEqual({
            "DAMAGE_TYPE_PHYSICAL": {
                "factor": 0.5,
                "immunity": false,
                "reduction": 0,
                "resistance": true,
                "vulnerability": false,
            },
            "MATERIAL_SILVER": {
                "factor": 2,
                "immunity": false,
                "reduction": 0,
                "resistance": false,
                "vulnerability": true,
            }
        })
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toEqual({
            hp: 56,
            ac: 17,
            atk: 1,
            damageTypes: { DAMAGE_TYPE_PHYSICAL: 1.25 },
            damages: 1.25
        })
    })
})

describe('Comparator.getDillutedDPT', function () {
    it('should half DPT when cooldonw is 1', function () {
        expect(Comparator.getDillutedDPT(4, 1, 1)).toBe(2)
    })
    it('should divide DPT by 3 when cooldonw is 2', function () {
        expect(Comparator.getDillutedDPT(12, 1, 2)).toBe(4)
    })
    it('should double DPT when attack count is 2', function () {
        expect(Comparator.getDillutedDPT(5, 2, 0)).toBe(10)
    })
})

describe('Comparator.getAllActionsStats', function () {
    it('should return gargoyle actions full dps', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        const c3 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        const { damageMap, mean } = Comparator.getAllMeleeActionsStats(c3, c1)
        expect(damageMap).toEqual([ 5, 3.5, 2.5 ])
        expect(mean).toBeCloseTo(3.6667, 4)
    })
})

describe('Comparator.consider', function () {
    it('should return consider report', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        console.log(Comparator.consider(c1, c2))
    })
})