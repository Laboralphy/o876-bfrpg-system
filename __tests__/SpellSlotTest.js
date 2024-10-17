const Manager = require('../src/Manager')
const Combat = require('../src/combat/Combat')
const CONSTS = require("../src/consts");

describe('getSpellSlot', function () {
    it('should not return spell slot for fighter', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 6 })
        expect(c1.getters.getSpellSlots).toEqual([])
    })
    it('should return spell slot [3, 2, 2, 0, 0, 0] for level 6 magic user', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        c1.mutations.setLevel({ value: 6 })
        expect(c1.getters.getSpellSlots).toEqual([3, 2, 2, 0, 0, 0])
    })
    it('should return spell slot [3, 2, 2, 0, 0, 0] for level 6 magic user', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        c1.mutations.setLevel({ value: 6 })
        expect(c1.getters.getSpellSlots).toEqual([3, 2, 2, 0, 0, 0])
    })
    it('should return spell slot [6, 5, 5, 4, 4, 3] for level 100 magic user', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        c1.mutations.setLevel({ value: 100 })
        expect(c1.getters.getSpellSlots).toEqual([6, 5, 5, 4, 4, 3])
    })
    it('should return spell slot [0, 0, 0, 0, 0, 0] for level 1 cleric', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_CLERIC })
        c1.mutations.setLevel({ value: 1 })
        expect(c1.getters.getSpellSlots).toEqual([0, 0, 0, 0, 0, 0])
    })
    it('should return spell slot [4, 3, 3, 0, 0, 0] for level 6 magic user with ring of wizardry', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        c1.mutations.setLevel({ value: 6 })
        expect(c1.getters.getSpellSlots).toEqual([3, 2, 2, 0, 0, 0])
        const ww = manager.createItem({ id: 'ww', ref: {
                "entityType": "ENTITY_TYPE_ITEM",
                "itemType": "ITEM_TYPE_RING",
                "properties": [{
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 1,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 2,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 3,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 4,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }]
        }})
        const x1 = c1.mutations.equipItem({ item: ww })
        expect(x1.newItem.properties).toEqual([
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 1, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 2, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 3, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 4, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            }
        ])
        expect(c1.getters.getProperties).toEqual([
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 1, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 2, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 3, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            },
            {
                property: 'ITEM_PROPERTY_EXTRA_SPELL_SLOT',
                amp: 1,
                data: { slotLevel: 4, spellcastingType: 'SPELLCASTING_TYPE_ARCANE' }
            }
        ])
        expect(c1.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_FINGER_RIGHT]).toEqual(ww)
        expect(c1.getters.getDefensiveEquipmentProperties).not.toEqual([])
        expect(c1.aggregateModifiers([CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT], {})).toEqual({
            count: 4,
            effects: 0,
            ip: 4,
            max: 1,
            min: 1,
            sorter: {},
            sum: 4
        })
        expect(c1.getters.getSpellSlots).toEqual([4, 3, 3, 0, 0, 0])
    })
    it('should ignore spell slot bonus when being a rogue and wearing a wing of wizardry', function () {
        const manager = new Manager()
        manager.init()
        const c1 = manager.createCreature({ id: 'c1' })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_ROGUE })
        c1.mutations.setLevel({ value: 6 })
        const ww = manager.createItem({ id: 'ww', ref: {
                "entityType": "ENTITY_TYPE_ITEM",
                "itemType": "ITEM_TYPE_RING",
                "properties": [{
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 1,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 2,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 3,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }, {
                    property: CONSTS.ITEM_PROPERTY_EXTRA_SPELL_SLOT,
                    amp: 1,
                    slotLevel: 4,
                    spellcastingType: CONSTS.SPELLCASTING_TYPE_ARCANE
                }]
            }})
        const x1 = c1.mutations.equipItem({ item: ww })
        expect(c1.getters.getSpellSlots).toEqual([])
    })
})