const { Manager, Creature, CONSTS} = require('../')
const Comparator = require('../src/Comparator')

function init () {
    const m = new Manager()
    m.init()
    m.loadModule('classic')
    return m
}

describe('basic mechanism', function () {
    it('should create a goblin', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        expect(c1).toBeInstanceOf(Creature)
    })
})

describe('configAttackOutcome', function () {
    it('should creature an attack outcome with target and attacker spécified', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const ao = Comparator.configAttackOutcome(c1, c2, { x: 12 })
        expect(ao.attacker).toBe(c1)
        expect(ao.target).toBe(c2)
        expect(ao.x).toBe(12)
    })
    it('should throw an error when attack is not specified', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(() => {
            const ao = Comparator.configAttackOutcome(null, c2)
        }).toThrow()
    })
})

describe('extractDamagesFromOutcome', function () {
    it('should throw error when attackoutcome is empty (no action in it)', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const ao = Comparator.configAttackOutcome(c1, c2, { x: 12 })
        expect(() => Comparator.extractDamagesFromOutcome(ao)).toThrow(new Error('This attack outcome has no action specified'))
    })
    it('should extract damage (physical 2) of an unarmed 1d3 attack outcome', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const ao = Comparator.configAttackOutcome(c1, c2, {
            action: m.data['default-actions'].DEFAULT_ACTION_UNARMED
        })
        expect(c1.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(10)
        expect(ao.action.damage).toBe('1d3') // (3 + 1) / 2
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({ DAMAGE_TYPE_PHYSICAL: 2 })
    })
    it('extracted (physical 5.5) of an action should not be multiplied by its count', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const ao = Comparator.configAttackOutcome(c1, c2, {
            action: {
                name: 'attack',
                damage: '1d10',
                count: 3,
                attackType: CONSTS.ATTACK_TYPE_MELEE,
                damageType: CONSTS.DAMAGE_TYPE_PHYSICAL
            }
        })
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({ DAMAGE_TYPE_PHYSICAL: 5.5 })
    })
    it('extracted damage should be 0 if defender is immune to damage type', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-centaur' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        const ao = Comparator.configAttackOutcome(c1, c2, {
            action: {
                name: 'attack',
                damage: '1d10',
                count: 3,
                attackType: CONSTS.ATTACK_TYPE_MELEE,
                damageType: CONSTS.DAMAGE_TYPE_PHYSICAL
            }
        })
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({ DAMAGE_TYPE_PHYSICAL: 0 })
    })
})

describe('getObjectValueSum', function () {
    it('should returns sum of an object', function () {
        expect(Comparator.getObjectValueSum({
            x: 1,
            y: 2,
            z: 30
        })).toBe(33)
    })
    it('should returns 0 when object is empty (no props)', function () {
        expect(Comparator.getObjectValueSum({})).toBe(0)
    })
})

describe('getActionStats', function () {
    it('should return 2 average damage when specifying an unarmed action', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(Comparator.getActionStats(c1, c2, m.data['default-actions'].DEFAULT_ACTION_UNARMED)).toEqual({
            damageTypes: {
                DAMAGE_TYPE_PHYSICAL: 2
            },
            damages: 2
        })
    })
    it('should return more than 2 average damage when specifying an unarmed action with a bonus in strength', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 18 })
        expect(Comparator.getActionStats(c1, c2, m.data['default-actions'].DEFAULT_ACTION_UNARMED)).toEqual({
            damageTypes: {
                DAMAGE_TYPE_PHYSICAL: 5
            },
            damages: 5
        })
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
    it('should equally distribute action damage when several action have different cooldown', function () {
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
    it('should blend several action damage with equal cooldown', function () {
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
    it('should fill missing action with 0', function () {
        const { damageMap, mean } = (Comparator.blendDPT([
            {
                damages: 5,
                cooldown: 5
            },
            {
                damages: 3,
                cooldown: 3
            }
        ]))
        expect(damageMap).toEqual([5, 3, 0, 0, 3, 5, 0, 3, 0, 0, 5, 3])
        expect(mean).toBeCloseTo(2.25, 4)
    })
})

describe('Comparator.getMeleeWeaponStats', function () {
    it('should compute melee damage', function () {
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
    it('should lower damage per turn when target is weapon resistant (like solars)', function () {
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

describe('Comparator.getAllMeleeActionsStats', function () {
    it('should equaly distribute actions, when all actions have cooldown 0', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
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