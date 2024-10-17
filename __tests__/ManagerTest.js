const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')
const { DURATION_PERMANENT} = require("../src/data/durations");
const util = require('node:util')

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
        m.init()
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
            slots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
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
        m.init()
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
            slots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            id: 'dag1'
        })
    })
})

describe('disease', function () {
    it('should apply initial effect of disease', function () {
        const m = new Manager()
        m.init()
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
                        ability: CONSTS.ABILITY_CHARISMA
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
        m.init()
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
                        ability: CONSTS.ABILITY_CHARISMA
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
        m.init()
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
                        ability: CONSTS.ABILITY_CHARISMA
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
        m.init()
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
                        ability: CONSTS.ABILITY_CHARISMA
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
                        ability: CONSTS.ABILITY_CHARISMA
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
        m.init()
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
                        ability: CONSTS.ABILITY_CHARISMA
                    }
                },
                {
                    time: [3, 7],
                    description: '-1 strength each 3 or 4 turns',
                    effect: {
                        type: CONSTS.EFFECT_ABILITY_MODIFIER,
                        amp: -1,
                        duration: DURATION_PERMANENT,
                        ability: CONSTS.ABILITY_STRENGTH
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

describe('import/export creature', function () {
    it('should export and import creature', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const c1 = m.createCreature({ id: 'abc' })
        const d1 = c1.state
        expect(d1).toEqual({
            id: 'abc',
            ref: '',
            abilities: {
                ABILITY_STRENGTH: 10,
                ABILITY_DEXTERITY: 10,
                ABILITY_CONSTITUTION: 10,
                ABILITY_INTELLIGENCE: 10,
                ABILITY_WISDOM: 10,
                ABILITY_CHARISMA: 10
            },
            classType: 'CLASS_TYPE_TOURIST',
            specie: 'SPECIE_HUMANOID',
            speed: 30,
            race: 'RACE_UNKNOWN',
            gender: 'GENDER_NONE',
            naturalArmorClass: 11,
            level: 1,
            actions: {},
            selectedAction: 'DEFAULT_ACTION_WEAPON',
            pools: { hitPoints: 4 },
            effects: [],
            properties: [],
            offensiveSlot: 'EQUIPMENT_SLOT_WEAPON_MELEE',
            equipment: {
                EQUIPMENT_SLOT_HEAD: null,
                EQUIPMENT_SLOT_NECK: null,
                EQUIPMENT_SLOT_CHEST: null,
                EQUIPMENT_SLOT_BACK: null,
                EQUIPMENT_SLOT_ARMS: null,
                EQUIPMENT_SLOT_WEAPON_MELEE: null,
                EQUIPMENT_SLOT_WEAPON_RANGED: null,
                EQUIPMENT_SLOT_SHIELD: null,
                EQUIPMENT_SLOT_FINGER_LEFT: null,
                EQUIPMENT_SLOT_FINGER_RIGHT: null,
                EQUIPMENT_SLOT_AMMO: null,
                EQUIPMENT_SLOT_WAIST: null,
                EQUIPMENT_SLOT_FEET: null
            },
            encumbrance: 0
        })
    })
})

describe('PublicAssets', function () {
    it('should display public assets', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        expect(m._rm).toBeDefined()
        expect(m._rm.data).toBeDefined()
        expect(m.publicAssets).toBeDefined()
        // console.log(util.inspect(m.publicAssets.types, { depth: 5 }))
    })
})

describe('CreateEntity', function () {
    it('should create item entities when specifying blueprint either as object or as a resref', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const sword = m.createItem({ id: 'x', ref: {
                "entityType": "ENTITY_TYPE_ITEM",
                "itemType": "ITEM_TYPE_WEAPON",
                "weaponType": "WEAPON_TYPE_SHORTSWORD",
                "properties": [
                    {
                        "property": "ITEM_PROPERTY_CURSED"
                    },
                    {
                        "property": "ITEM_PROPERTY_UNIDENTIFIED"
                    },
                    {
                        "property": "ITEM_PROPERTY_ATTACK_MODIFIER",
                        "amp": -2
                    }
                ]
            }})
        expect(sword).toBeDefined()
        expect(sword.ref).toBe('')
        const sword2 = m.createItem({ id: 'x', ref: 'wpn-longsword'})
        expect(sword2).toBeDefined()
        expect(sword2.ref).toBe('wpn-longsword')
    })
    it('should create creatures when specifying blueprint either as object or as a resref', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const character = m.createCreature({ id: 'x', ref: {
                "name": "player-base-template",
                "ac": 11,
                "classType": "CLASS_TYPE_TOURIST",
                "actions": [],
                "properties": [],
                "equipment": [],
                "abilities": {
                    "strength": 10,
                    "dexterity": 10,
                    "constitution": 10,
                    "intelligence": 10,
                    "wisdom": 10,
                    "charisma": 10
                },
                "specie": "SPECIE_HUMANOID",
                "race": "RACE_HUMAN",
                "gender": "GENDER_UNKNOWN",
                "level": 1,
                "speed": 30,
                "entityType": "ENTITY_TYPE_ACTOR"
            }
        })
        expect(character).toBeDefined()
        expect(character.ref).toBe('')
        const goblin = m.createCreature({ id: 'x', ref: 'c-goblin' })
        expect(goblin).toBeDefined()
        expect(goblin.ref).toBe('c-goblin')
    })
    it('should extends blueprint', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const sword = m.createItem({ id: 'x', ref: {
                "extends": "wpn-longsword",
                "properties": [
                    {
                        "property": "ITEM_PROPERTY_ATTACK_MODIFIER",
                        "amp": 1
                    }
                ]
            }})
        expect(sword.damage).toBe('1d8')
        expect(sword.entityType).toBe(CONSTS.ENTITY_TYPE_ITEM)
        expect(sword.itemType).toBe(CONSTS.ITEM_TYPE_WEAPON)
        expect(sword.weaponType).toBe('WEAPON_TYPE_LONGSWORD')
        expect(sword.properties).toEqual([{
            property: 'ITEM_PROPERTY_ATTACK_MODIFIER',
            amp: 1,
            data: {
                attackType: 'ATTACK_TYPE_ANY'
            }
        }])
    })
})

describe('equip cursed item', function () {
    it('should create item entities when specifying blueprint either as object or as a resref', async function () {
        const m = new Manager()
        m.init()
        m.loadModule('classic')
        const sword = m.createItem({ id: 'x', ref: {
                "entityType": "ENTITY_TYPE_ITEM",
                "itemType": "ITEM_TYPE_WEAPON",
                "weaponType": "WEAPON_TYPE_SHORTSWORD",
                "properties": [
                    {
                        "property": "ITEM_PROPERTY_CURSED"
                    },
                    {
                        "property": "ITEM_PROPERTY_UNIDENTIFIED"
                    },
                    {
                        "property": "ITEM_PROPERTY_ATTACK_MODIFIER",
                        "amp": -2
                    }
                ]
            }})
        expect(sword).toBeDefined()
        const player = m.createCreature({ id: 'wielder', ref: '' })
        const r = player.mutations.equipItem({ item: sword })
        expect(r.previousItem).toBeNull()
        expect(r.cursed).toBeFalsy()
    })

})