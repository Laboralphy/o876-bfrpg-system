const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')

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
            ref: '',
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
                    "type": "DAMAGE_TYPE_PHYSICAL"
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
                        "type": "DAMAGE_TYPE_PHYSICAL"
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