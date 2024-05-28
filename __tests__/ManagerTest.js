const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')
const { DURATION_PERMANENT} = require("../src/data/durations");

describe('createCreature', function () {
    it('should create a creatures when calling the function', function () {
        const m = new Manager()
        expect(m.horde.creatures['c1']).toBeUndefined()
        m.createCreature({ id: 'c1' })
        expect(m.horde.creatures['c1']).toBeDefined()
    })
})

describe('destroyCreature', function () {
    it('should destroy a creatures when calling the function', function () {
        const m = new Manager()
        const c1 = m.createCreature({ id: 'c1' })
        expect(m.horde.creatures['c1']).toBeDefined()
        m.destroyCreature(c1)
        expect(m.horde.creatures['c1']).toBeUndefined()
    })
    it('should remove effect cast by c1 when destroying c1', function () {
        const m = new Manager()
        const c1 = m.createCreature({ id: 'c1' })
        const c2 = m.createCreature({ id: 'c2' })
        const e1 = m.effectProcessor.createEffect(CONSTS.EFFECT_HEAL, 1)
        m.effectProcessor.applyEffect(e1, c2, 100, c1)
        expect(c2.getters.getEffects.length).toBe(1)
        expect(c2.getters.getEffects[0].type).toBe(CONSTS.EFFECT_HEAL)
        m.destroyCreature(c1) // should also dispell e1
        expect(c2.getters.getEffects.length).toBe(0) // now e1 is dispelled
    })
})

describe('Data', function () {
    it('should have data when bare initialized', function () {
        const m = new Manager()
        expect(m.data).toHaveProperty('item-types')
        expect(m.data).toHaveProperty('class-types')
    })
})

describe('createItem', function () {
    it('should create a dagger with id', async function () {
        const m = new Manager()
        await m.init()
        m.loadModule('classic')
        const oDagger = m.createItem({ id: 'dag1', ref: 'wpn-dagger' })
        expect(oDagger.id).toBe('dag1')
        expect(oDagger).toEqual({
            ref: 'wpn-dagger',
            data: {},
            properties: [],
            size: 'WEAPON_SIZE_SMALL',
            weight: 1,
            damage: '1d4',
            attributes: [ 'WEAPON_ATTRIBUTE_FINESSE' ],
            material: 'MATERIAL_STEEL',
            entityType: 'ENTITY_TYPE_ITEM',
            itemType: 'ITEM_TYPE_WEAPON',
            weaponType: 'WEAPON_TYPE_DAGGER',
            equipmentSlots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            id: 'dag1'
        })
    })
    it('should create a super-dagger', function () {
        const sd = {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_WEAPON",
            "weaponType": "WEAPON_TYPE_DAGGER",
            "properties": [
                {
                    "property": "ITEM_PROPERTY_DAMAGE_MODIFIER",
                    "amp": 3,
                    "damageType": "DAMAGE_TYPE_PHYSICAL"
                }
            ]
        }
        const m = new Manager()
        m.loadModule('classic')
        const oDagger = m.createItem({ id: 'dag1', ref: sd })
        expect(oDagger.id).toBe('dag1')
        expect(oDagger).toEqual({
            ref: '',
            properties: [
                {
                    "property": "ITEM_PROPERTY_DAMAGE_MODIFIER",
                    "amp": 3,
                    "data": {
                        "damageType": "DAMAGE_TYPE_PHYSICAL"
                    }
                }
            ],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            size: 'WEAPON_SIZE_SMALL',
            weight: 1,
            damage: '1d4',
            attributes: [ 'WEAPON_ATTRIBUTE_FINESSE' ],
            material: 'MATERIAL_STEEL',
            itemType: 'ITEM_TYPE_WEAPON',
            weaponType: 'WEAPON_TYPE_DAGGER',
            equipmentSlots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            id: 'dag1'
        })
    })
})

describe('disease', function () {
    it('should apply initial effect of disease', function () {
        const m = new Manager()
        m.loadModule('classic')
        const c = m.createCreature()
        const eDisease = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis II',
            stages: [
                {
                    time: 0,
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -2,
                        duration: 10,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                }
            ]
        })
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.applyEffect(eDisease, c, 10)
        expect(eDisease.duration).toBe(10)
        expect(m._effectOptimRegistry[eDisease.id]).toBeDefined()
        expect(c.getters.getConditionSet.has(CONSTS.CONDITION_DISEASE)).toBeTruthy()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
    })
    it('should apply final effect of disease when stage time is lower or equal than disease duration', function () {
        const m = new Manager()
        m.loadModule('classic')
        const c = m.createCreature()
        const eDisease = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis II',
            stages: [
                {
                    time: 9,
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -2,
                        duration: 10,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                }
            ]
        })
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        const e2 = m.applyEffect(eDisease, c, 10)
        expect(e2.duration).toBe(10)
        expect(m._effectOptimRegistry[e2.id]).toBeDefined()
        expect(c.getters.getConditionSet.has(CONSTS.CONDITION_DISEASE)).toBeTruthy()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(9)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(8)
        m.processEffects()
        expect(e2.duration).toBe(7)
        m.processEffects()
        expect(e2.duration).toBe(6)
        m.processEffects()
        expect(e2.duration).toBe(5)
        m.processEffects()
        expect(e2.duration).toBe(4)
        m.processEffects()
        expect(e2.duration).toBe(3)
        m.processEffects()
        expect(e2.duration).toBe(2)
        m.processEffects()
        expect(e2.duration).toBe(1)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(0)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
    })
    it('should not apply final effect of disease when stage time is greater than disease duration', function () {
        const m = new Manager()
        m.loadModule('classic')
        const c = m.createCreature()
        const eDisease = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis II',
            stages: [
                {
                    time: 11,
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -2,
                        duration: 10,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                }
            ]
        })
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        const e2 = m.applyEffect(eDisease, c, 10)
        expect(e2.duration).toBe(10)
        expect(m._effectOptimRegistry[e2.id]).toBeDefined()
        expect(c.getters.getConditionSet.has(CONSTS.CONDITION_DISEASE)).toBeTruthy()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(9)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(8)
        m.processEffects()
        expect(e2.duration).toBe(7)
        m.processEffects()
        expect(e2.duration).toBe(6)
        m.processEffects()
        expect(e2.duration).toBe(5)
        m.processEffects()
        expect(e2.duration).toBe(4)
        m.processEffects()
        expect(e2.duration).toBe(3)
        m.processEffects()
        expect(e2.duration).toBe(2)
        m.processEffects()
        expect(e2.duration).toBe(1)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        m.processEffects()
        expect(e2.duration).toBe(0)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
    })
    it('should not be able to stack two same diseases', function () {
        const m = new Manager()
        m.loadModule('classic')
        const c = m.createCreature()
        const eDisease = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis II',
            stages: [
                {
                    time: 0,
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -2,
                        duration: 10,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                }
            ]
        })
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        const e1 = m.applyEffect(eDisease, c, 10)
        m.processEffects()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        const eDisease2 = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis II',
            stages: [
                {
                    time: 0,
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -2,
                        duration: 10,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                }
            ]
        })
        const e2 = m.applyEffect(eDisease2, c, 10)
        m.processEffects()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        m.processEffects()
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
    })
    it('should periodically apply malus when defining multiple times', function () {
        const m = new Manager()
        m.loadModule('classic')
        const c = m.createCreature()
        const eDisease = m.createEffect(CONSTS.EFFECT_DISEASE, 0, {
            disease: 'leprosis III',
            stages: [
                {
                    time: [0, 2, 4, 6, 8],
                    description: '-1 charisma each 2 turns',
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -1,
                        duration: DURATION_PERMANENT,
                        data: {
                            ability: CONSTS.ABILITY_CHARISMA
                        }
                    }
                },
                {
                    time: [3, 7],
                    description: '-1 strength each 3 or 4 turns',
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -1,
                        duration: DURATION_PERMANENT,
                        data: {
                            ability: CONSTS.ABILITY_STRENGTH
                        }
                    }
                }
            ]
        })
        m.applyEffect(eDisease, c, 10)
        m.processEffects() // 0
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(9)
        m.processEffects() // 1
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(9)
        m.processEffects() // 2
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
        m.processEffects() // 3
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(8)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(9)
        m.processEffects() // 4
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(7)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(9)
        m.processEffects() // 5
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(7)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(9)
        m.processEffects() // 6
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(6)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(9)
        m.processEffects() // 7
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(6)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(8)
        m.processEffects() // 8
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(5)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(8)
        m.processEffects() // 9
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(5)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(8)
        m.processEffects() // 10
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(5)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(8)
    })
})