const DATA_BASE = require('../src/data')
const DATA_CLASSIC = require('../src/modules/classic/data')
const BLUEPRINTS = require('../src/modules/classic/blueprints')
const ItemBuilder = require("../src/ItemBuilder");

const DATA = Object.assign({}, DATA_BASE, DATA_CLASSIC)

describe('createItemWeapon', function () {
    it('should build a dagger', function () {
        const ib = new ItemBuilder()
        const oDagger = ib.createItemWeapon(BLUEPRINTS['wpn-dagger'], DATA)
        expect(oDagger).toEqual({
            properties: [],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            size: 'WEAPON_SIZE_SMALL',
            weight: 1,
            damage: '1d4',
            attributes: [ 'WEAPON_ATTRIBUTE_FINESSE' ],
            itemType: 'ITEM_TYPE_WEAPON',
            weaponType: 'WEAPON_TYPE_DAGGER',
            slots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            material: 'MATERIAL_STEEL'
        })
    })
    it('should build a dagger with damage modifier property', function () {
        const ib = new ItemBuilder()
        const oDagger = ib.createItemWeapon(BLUEPRINTS['wpn-dagger-sharp'], DATA)
        expect(oDagger).toEqual({
            properties: [{
                property: "ITEM_PROPERTY_DAMAGE_MODIFIER",
                amp: 1,
                data: {
                    damageType: "DAMAGE_TYPE_PHYSICAL"
                }
            }],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            size: 'WEAPON_SIZE_SMALL',
            weight: 1,
            damage: '1d4',
            attributes: [ 'WEAPON_ATTRIBUTE_FINESSE' ],
            itemType: 'ITEM_TYPE_WEAPON',
            weaponType: 'WEAPON_TYPE_DAGGER',
            slots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            material: 'MATERIAL_STEEL'
        })
    })
})

describe('createItem', function () {
    it('should create a dagger', function () {
        const ib = new ItemBuilder()
        const oDagger = ib.createItem(BLUEPRINTS['wpn-dagger'], DATA)
        expect(oDagger).toEqual({
            properties: [],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            size: 'WEAPON_SIZE_SMALL',
            weight: 1,
            damage: '1d4',
            attributes: [ 'WEAPON_ATTRIBUTE_FINESSE' ],
            itemType: 'ITEM_TYPE_WEAPON',
            weaponType: 'WEAPON_TYPE_DAGGER',
            slots: [ 'EQUIPMENT_SLOT_WEAPON_MELEE' ],
            material: 'MATERIAL_STEEL'
        })
    })
    it('should create a stack of arrows', function () {
        const ib = new ItemBuilder()
        const oArrow = ib.createItem(BLUEPRINTS['ammo-arrow'], DATA)
        expect(oArrow).toEqual({
            properties: [],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            weight: 0.1,
            itemType: 'ITEM_TYPE_AMMO',
            ammoType: 'AMMO_TYPE_ARROW',
            slots: [ 'EQUIPMENT_SLOT_AMMO' ],
            material: 'MATERIAL_IRON'
        })
    })
    it('should create a stack of quarrel', function () {
        const ib = new ItemBuilder()
        const oQuarrel = ib.createItem(BLUEPRINTS['ammo-quarrel'], DATA)
        expect(oQuarrel).toEqual({
            properties: [],
            data: {},
            entityType: 'ENTITY_TYPE_ITEM',
            weight: 0.15,
            itemType: 'ITEM_TYPE_AMMO',
            ammoType: 'AMMO_TYPE_QUARREL',
            slots: [ 'EQUIPMENT_SLOT_AMMO' ],
            material: 'MATERIAL_IRON'
        })
    })
    it('should create a chain mail', function () {
        const ib = new ItemBuilder()
        const oArmor = ib.createItem(BLUEPRINTS['arm-chain-mail'], DATA)
        expect(oArmor).toEqual({
            properties: [],
            data: {},
            weight: 40,
            ac: 4,
            material: 'MATERIAL_IRON',
            entityType: 'ENTITY_TYPE_ITEM',
            itemType: 'ITEM_TYPE_ARMOR',
            armorType: 'ARMOR_TYPE_CHAIN_MAIL',
            slots: [ 'EQUIPMENT_SLOT_CHEST' ]
        })
    })
})