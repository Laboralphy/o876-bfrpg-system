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
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(() => {
            Comparator.configAttackOutcome(null, c2)
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
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({
            "attack": 0,
            "dpt": 2,
            "targetAC": 0,
            "targetHP": 8,
            "toHit": 0.95,
            "turns": 5,
        })
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
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({ "attack": 0,
            "dpt": 5.5,
            "targetAC": 0,
            "targetHP": 8,
            "toHit": 0.95,
            "turns": 2
        })
    })
    it('extracted damage should be 0 if defender is immune to damage type, and turn count should be infinity', function () {
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
        expect(Comparator.extractDamagesFromOutcome(ao)).toEqual({ "attack": 0,
            "dpt": 0,
            "targetAC": 0,
            "targetHP": 32,
            "toHit": 0.95,
            "turns": Infinity
        })
    })
})


describe('getActionStats', function () {
    it('should return 2 average damage when specifying an unarmed action', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(Comparator.getActionStats(c1, c2, m.data['default-actions'].DEFAULT_ACTION_UNARMED)).toEqual({
            "attack": 1,
            "dpt": 2,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.4,
            "turns": 10
        })
    })
    it('should return more than 2 average damage when specifying an unarmed action with a bonus in strength', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 18 })
        expect(Comparator.getActionStats(c1, c2, m.data['default-actions'].DEFAULT_ACTION_UNARMED)).toEqual({
            "attack": 4,
            "dpt": 5,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.55,
            "turns": 3,
        })
    })
    it('should lower dps because of targer damage resistance', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-solar' })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 18 })
        expect(Comparator.getActionStats(c1, c2, m.data['default-actions'].DEFAULT_ACTION_UNARMED)).toEqual({
            "attack": 4,
            "dpt": 2.5,
            "targetAC": 17,
            "targetHP": 56,
            "toHit": 0.35,
            "turns": 64
        })
    })
    it('should get action stat of an ogre strike', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        // console.log(Comparator.getWeaponStats(c1, c2, c1.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]))
        expect(Comparator.getActionStats(c2, c1, c2.getters.getActions.strike)).toEqual({
            "attack": 4,
            "dpt": 7,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.55,
            "turns": 3
        })
    })
    it('should have irrevelant weapon stat when having actions', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c3 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        expect(Comparator.getMeleeWeaponStats(c3, c1)).toBeNull()
    })
})

describe('getWeaponStats', function () {
    it('should delivrer 3.5 damage when equipping shortsword', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const sword = m.createItem({ ref: 'wpn-shortsword' })
        c1.mutations.equipItem({ item: sword })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(Comparator.getWeaponStats(c1, c2)).toEqual({
            "attack": 1,
            "dpt": 3.5,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.4,
            "turns": 6
        })
    })
})

describe('getMeleeWeaponStats', function () {
    it('should selected melee weapon and delivrer 3.5 damage when equipping shortsword', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const sword = m.createItem({ ref: 'wpn-shortsword' })
        c1.mutations.equipItem({ item: sword })
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toEqual({
            "attack": 1,
            "dpt": 3.5,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.4,
            "turns": 6
        })
    })
    it('should return null when equipping no melee weapon', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        c1.mutations.removeItem({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toBeNull()
    })
    it('should compute melee damage', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toEqual({
            "attack": 1,
            "dpt": 2.5,
            "targetAC": 14,
            "targetHP": 32,
            "toHit": 0.35,
            "turns": 37,
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
            "attack": 1,
            "dpt": 1.25,
            "targetAC": 17,
            "targetHP": 56,
            "toHit": 0.2,
            "turns": 224,
        })
    })
})

describe('getRangedWeaponStats', function () {
    it('should selected ranged weapon and delivrer 3.5 damage when equipping shortsword', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        const xbow = m.createItem({ ref: 'wpn-heavy-crossbow' })
        const ammo = m.createItem({ ref: 'ammo-quarrel' })
        c1.mutations.equipItem({ item: xbow })
        c1.mutations.equipItem({ item: ammo })
        expect(Comparator.getRangedWeaponStats(c1, c2)).toEqual({
            "attack": 1,
            "dpt": 4.5,
            "targetAC": 13,
            "targetHP": 8,
            "toHit": 0.4,
            "turns": 5
        })
    })
    it('should return null when equipping no ranged weapon', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(Comparator.getRangedWeaponStats(c1, c2)).toBeNull()
    })
})

describe('getAllMeleeActionsStats', function () {
    it('should enumerate all melee action stats', function () {
        const m = init()
        const c1 = m.createCreature({ id: 'c1', ref: 'c-gargoyle' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(Comparator.getAllRangedActionsStats(c1, c2)).toBeNull()
        const { attack, targetAC, targetHP, dpt, toHit, turns } = Comparator.getAllMeleeActionsStats(c1, c2)
        expect(attack).toBe(4)
        expect(targetAC).toBe(13)
        expect(targetHP).toBe(8)
        expect(dpt).toBeCloseTo(2.8, 1)
        expect(toHit).toBe(0.55)
        expect(turns).toBe(6)
    })
})

describe('blendDPT', function () {
    it('should equally distribute action damage when several action have different cooldown', function () {
        const { damageMap, amount } = (Comparator.blendDPT([
            {
                damage: 10,
                cooldown: 10
            },
            {
                damage: 7,
                cooldown: 3
            },
            {
                damage: 3,
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
        expect(amount).toBeCloseTo(4.9773, 4)
    })
    it('should blend several action damage with equal cooldown', function () {
        const { damageMap, amount } = (Comparator.blendDPT([
            {
                damage: 5,
                cooldown: 0
            },
            {
                damage: 3,
                cooldown: 0
            },
            {
                damage: 2,
                cooldown: 0
            }
        ]))
        expect(damageMap).toEqual([5, 3, 2])
        expect(amount).toBeCloseTo(3.3333, 4)
    })
    it('should fill missing action with 0', function () {
        const { damageMap, amount } = (Comparator.blendDPT([
            {
                damage: 5,
                cooldown: 5
            },
            {
                damage: 3,
                cooldown: 3
            }
        ]))
        expect(damageMap).toEqual([5, 3, 0, 0, 3, 5, 0, 3, 0, 0, 5, 3])
        expect(amount).toBeCloseTo(2.25, 4)
    })
})

describe('Comparator.getAllMeleeActionsStats', function () {
    it('should equaly distribute actions, when all actions have cooldown 0', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c3 = m.createCreature({ id: 'c2', ref: 'c-gargoyle' })
        expect(Comparator.getAllMeleeActionsStats(c3, c1)).toEqual({
            attack: 4,
            targetAC: 13,
            targetHP: 8,
            dpt: 2.8333333333333335,
            toHit: 0.55,
            turns: 6
        })
    })
})

describe('Comparator.consider', function () {
    it('should return consider report 1', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-goblin' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        expect(Comparator.gatherCreatureInformation(c1, c2)).toEqual({
            actions: {
                ranged: null,
                melee: {
                    attack: 1,
                    dpt: 2,
                    targetAC: 14,
                    targetHP: 32,
                    toHit: 0.35,
                    turns: 46
                }
            },
            weapons: {
                ranged: null,
                melee: {
                    attack: 1,
                    targetAC: 14,
                    targetHP: 32,
                    dpt: 2.5,
                    toHit: 0.35,
                    turns: 37
                }
            }
        })
    })
    it('should return consider report 2', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1', ref: 'c-gargoyle' })
        const c2 = m.createCreature({ id: 'c2', ref: 'c-ogre' })
        expect(c2.getters.getMeleeActions.length).toBe(1)
        expect(c2.getters.getMeleeActions).toEqual(['strike'])
        expect(Comparator.getAllMeleeActionsStats(c2, c1)).not.toBeNull()
        expect(c1.getters.getMeleeActions).toEqual(['claw', 'bite', 'horn'])
        expect(c1.getters.getActions['claw']).toBeDefined()
        expect(Comparator.getActionStats(c1, c2, c1.getters.getActions['claw'])).toEqual({
            attack: 4,
            targetAC: 14,
            targetHP: 32,
            dpt: 2.5,
            toHit: 0.5,
            turns: 26
        })
        expect(Comparator.getActionStats(c1, c2, c1.getters.getActions['bite'])).toEqual({
            attack: 4,
            targetAC: 14,
            targetHP: 32,
            dpt: 3.5,
            toHit: 0.5,
            turns: 19
        })
        expect(Comparator.getActionStats(c1, c2, c1.getters.getActions['horn'])).toEqual({
            attack: 4,
            targetAC: 14,
            targetHP: 32,
            dpt: 2.5,
            toHit: 0.5,
            turns: 26
        })
        expect(
            Comparator.getActionStats(c1, c2, c1.getters.getActions['claw']).dpt +
            Comparator.getActionStats(c1, c2, c1.getters.getActions['bite']).dpt +
            Comparator.getActionStats(c1, c2, c1.getters.getActions['horn']).dpt
        ).toBe(2.5 + 3.5 + 2.5)
        expect(
            (Comparator.getActionStats(c1, c2, c1.getters.getActions['claw']).dpt +
            Comparator.getActionStats(c1, c2, c1.getters.getActions['bite']).dpt +
            Comparator.getActionStats(c1, c2, c1.getters.getActions['horn']).dpt) / 3
        ).toBeCloseTo(2.8, 1)
        expect(Comparator.consider(c1, c2)).toEqual({
          melee: {
            you: {
              toHit: 0.5,
              turns: 26,
              dpt: 2.8,
              hp: { before: 32, after: 32, lost: 0, lost100: 0 }
            },
            adv: {
              toHit: 0.45,
              turns: Infinity,
              dpt: 0,
              hp: {
                before: 32,
                after: -5,
                lost: 37,
                lost100: 1.15625
              }
            }
          },
          ranged: { you: null, adv: null }
        })
    })
    it('should use unarmed attack when having no other choice in melee action', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1' })
        const c2 = m.createCreature({ id: 'c2' })
        expect(c1).toBeInstanceOf(Creature)
        expect(Comparator.getMeleeWeaponStats(c1, c2)).toBeNull()
        expect(Comparator.getUnarmedStats(c1, c2)).toEqual({
            dpt: 2,
            attack: 0,
            targetAC: 11,
            targetHP: 4,
            toHit: 0.45,
            turns: 5
        })
        expect(Comparator.consider(c1, c2)).toEqual({
            melee: {
                you: { toHit: 0.45, turns: 5, dpt: 2, hp: {
                    after: -1,
                    before: 4,
                    lost: 5,
                    lost100: 1.25
                } },
                adv: { toHit: 0.45, turns: 5, dpt: 2, hp: {
                    after: -1,
                    before: 4,
                    lost: 5,
                    lost100: 1.25
                } }
            },
            ranged: { you: null, adv: null }
        })

    })
    it('should use unarmed attack when having no other choice in melee action', function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        expect(c1.getters.getLevel).toBe(1)
        expect(c1.getters.getMaxHitPoints).toBe(8)
        expect(c1.mutations.setHitPoints({ value: c1.getters.getMaxHitPoints }))
        expect(c1.getters.getHitPoints).toBe(8)
        const c2 = m.createCreature({ id: 'c2', ref: 'c-goblin' })
        expect(Comparator.consider(c1, c2)).toEqual({
            melee: {
                you: {
                    toHit: 0.4,
                    turns: 10,
                    dpt: 2,
                    hp: { before: 8, after: -1, lost: 9, lost100: 1.125 }
                },
                adv: {
                    toHit: 0.5,
                    turns: 7,
                    dpt: 2.5,
                    hp: { before: 8, after: 0, lost: 8, lost100: 1 }
                }
            },
            ranged: { you: null, adv: null }
        })
    })
})