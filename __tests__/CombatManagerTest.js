const CombatManager = require('../src/combat/CombatManager')
const Creature = require('../src/Creature')
const CONSTS = require('../src/consts')
const ItemBuilder = require("../src/ItemBuilder");
const DATA = {
    ...require('../src/data'),
    ...require('../src/modules/classic/data')
}
const BLUEPRINTS = {
    ...require('../src/modules/classic/blueprints')
}

describe('isCreatureFighting', function () {
    it('should return true when adding a creature', function () {
        const cm = new CombatManager()
        const c1 = new Creature()
        const c2 = new Creature()
        expect(cm.isCreatureFighting(c1)).toBeFalsy()
        cm.startCombat(c1, c2)
        expect(cm.isCreatureFighting(c1)).toBeTruthy()
    })
    it('target should be in combat when targeted bu attacker', function () {
        const cm = new CombatManager()
        const c1 = new Creature()
        const c2 = new Creature()
        expect(cm.isCreatureFighting(c2)).toBeFalsy()
        cm.startCombat(c1, c2)
        expect(cm.isCreatureFighting(c2)).toBeTruthy()
    })
    it('both creature should be not-fighting when combat is done', function () {
        const cm = new CombatManager()
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.isCreatureFighting(c1)).toBeTruthy()
        expect(cm.isCreatureFighting(c2)).toBeTruthy()
        cm.endCombat(c1, true)
        expect(cm.isCreatureFighting(c1)).toBeFalsy()
        expect(cm.isCreatureFighting(c2)).toBeFalsy()
    })
    it('c2 combat should not end when ending c1 combat unilaterally', function () {
        const cm = new CombatManager()
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.isCreatureFighting(c1)).toBeTruthy()
        expect(cm.isCreatureFighting(c2)).toBeTruthy()
        cm.endCombat(c1, false)
        expect(cm.isCreatureFighting(c1)).toBeFalsy()
        expect(cm.isCreatureFighting(c2)).toBeTruthy()
    })
})

describe('combat.length', function () {
    it('should register 2 combat when adding one fighter and one target', function () {
        const cm = new CombatManager()
        expect(cm.combats.length).toBe(0)
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.combats.length).toBe(2)
    })
    it('should remain 1 combat when adding one fighter and one target and ending combat unilaterally', function () {
        const cm = new CombatManager()
        expect(cm.combats.length).toBe(0)
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.combats.length).toBe(2)
        cm.endCombat(c1, false)
        expect(cm.combats.length).toBe(1)
    })
    it('should have 2 registered combat when cancelling and resuming combat', function () {
        const cm = new CombatManager()
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        cm.endCombat(c1, false)
        cm.startCombat(c1, c2)
        expect(cm.combats.length).toBe(2)
    })
})

describe('combat distance', function () {
    it('should set a default distance of 30 when starting combat', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.getCombat(c1).distance).toBe(30)
    })
    it('should synchronize distance changes when attacker and target fight each other', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        const c2 = new Creature()
        cm.startCombat(c1, c2)
        expect(cm.getCombat(c1).distance).toBe(30)
        expect(cm.getCombat(c2).distance).toBe(30)
        cm.getCombat(c1).distance = 15
        expect(cm.getCombat(c1).distance).toBe(15)
        expect(cm.getCombat(c2).distance).toBe(15)
    })
    it('should not synchronize distance changes when attacker and target don\'t fight each other', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        const c2 = new Creature()
        const c3 = new Creature()
        cm.events
        cm.startCombat(c1, c2)
        cm.startCombat(c3, c2) // c2 is already fighting c1
        expect(cm.getCombat(c1).distance).toBe(30)
        expect(cm.getCombat(c2).distance).toBe(30)
        expect(cm.getCombat(c3).distance).toBe(30)
        cm.getCombat(c3).distance = 10
        cm.getCombat(c2).distance = 16
        expect(cm.getCombat(c1).distance).toBe(16)
        expect(cm.getCombat(c2).distance).toBe(16)
        expect(cm.getCombat(c3).distance).toBe(10)
    })
})

describe('combat with weapon', function () {
    const ItemBuilder = require('../src/ItemBuilder')
    const DATA = {
        "weapon-types": {
            "WEAPON_TYPE_LONGSWORD": {
                "size": "WEAPON_SIZE_MEDIUM",
                "weight": 4,
                "damage": "1d8",
                "attributes": [],
                "material": "MATERIAL_STEEL"
            },
            "WEAPON_TYPE_SHORTBOW": {
                "size": "WEAPON_SIZE_MEDIUM",
                "weight": 2,
                "damage": "1d6",
                "attributes": [
                    "WEAPON_ATTRIBUTE_RANGED",
                    "WEAPON_ATTRIBUTE_AMMUNITION",
                    "WEAPON_ATTRIBUTE_TWO_HANDED"
                ],
                "ammoType": "AMMO_TYPE_ARROW",
                "material": "MATERIAL_WOOD"
            }
        },
        "ammo-types": {
            "AMMO_TYPE_ARROW": {
                "weight": 0.1
            }
        },
        "item-types": {
            "ITEM_TYPE_WEAPON": {
                "slots": ["EQUIPMENT_SLOT_WEAPON_MELEE", "EQUIPMENT_SLOT_WEAPON_RANGED"],
                "defaultWeight": 0
            },
            "ITEM_TYPE_AMMO": {
                "slots": ["EQUIPMENT_SLOT_AMMO"],
                "defaultWeight": 0
            }
        }
    }
    const BLUEPRINTS = {
        sword: {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_WEAPON",
            "weaponType": "WEAPON_TYPE_LONGSWORD",
            "properties": []
        },
        bow: {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_WEAPON",
            "weaponType": "WEAPON_TYPE_SHORTBOW",
            "properties": []
        },
        arrow: {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_AMMO",
            "ammoType": "AMMO_TYPE_ARROW",
            "properties": []
        }
    }
    const oItemBuilder = new ItemBuilder()

    it('should select ranged weapon when distance is 30', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const sword1 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const sword2 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const bow1 = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const bow2 = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const arrow1 = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        const arrow2 = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        c1.mutations.equipItem({ item: sword1 })
        c1.mutations.equipItem({ item: bow1 })
        c1.mutations.equipItem({ item: arrow1 })
        c2.mutations.equipItem({ item: sword2 })
        c2.mutations.equipItem({ item: bow2 })
        c2.mutations.equipItem({ item: arrow2 })
        const aLog = []
        cm.events.on('combat.offensive-slot', ev => {
            aLog.push({
                a: ev.attacker.id,
                d: ev.target.id,
                slot: ev.slot
            })
        })
        cm.startCombat(c1, c2)
        cm.getCombat(c1).switchToMostSuitableWeapon()
        cm.getCombat(c2).switchToMostSuitableWeapon()
        expect(aLog).toEqual([
            {
                a: 'c1',
                d: 'c2',
                slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
            },
            {
                a: 'c2',
                d: 'c1',
                slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
            }
        ])
    })
    it('c1 should select ranged, c2 should select melee', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const sword1 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const sword2 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const bow1 = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const arrow1 = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        c1.mutations.equipItem({ item: sword1 })
        c1.mutations.equipItem({ item: bow1 })
        c1.mutations.equipItem({ item: arrow1 })
        c2.mutations.equipItem({ item: sword2 })
        const aLog = []
        cm.events.on('combat.offensive-slot', ev => {
            aLog.push({
                a: ev.attacker.id,
                d: ev.target.id,
                slot: ev.slot
            })
        })
        cm.startCombat(c1, c2)
        const combat1 = cm.getCombat(c1)
        const combat2 = cm.getCombat(c2)
        combat1.switchToMostSuitableWeapon()
        combat2.switchToMostSuitableWeapon()
        combat2.distance = 5
        combat1.switchToMostSuitableWeapon()
        combat2.switchToMostSuitableWeapon()

        expect(aLog).toEqual([
            {
                a: 'c1',
                d: 'c2',
                slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
            },
            {
                a: 'c1',
                d: 'c2',
                slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE
            }
        ])
    })
    it('c1 should use NO weapon when not having proper ammo and target being out of melee ranged', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const sword1 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const sword2 = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        const bow1 = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const arrow1 = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        c1.mutations.equipItem({ item: sword1 })
        c1.mutations.equipItem({ item: bow1 })
        c2.mutations.equipItem({ item: sword2 })
        const aLog = []
        cm.events.on('combat.offensive-slot', ev => {
            aLog.push({
                a: ev.attacker.id,
                d: ev.target.id,
                slot: ev.slot
            })
        })
        cm.startCombat(c1, c2)
        expect(cm.getCombat(c1).distance).toBe(30)
        const sSuitableSlot = cm.getCombat(c1).getMostSuitableOffensiveSlot()
        expect(sSuitableSlot).toBe('')
        expect(cm.getCombat(c1).targetInRange.selected).toBeFalsy()
    })
    it('c1 should not select anything when not being equipped with weapon', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        cm.startCombat(c1, c2)
        const sOffSlot = cm.getCombat(c1).getMostSuitableOffensiveSlot()
        expect(sOffSlot).toBe('')
    })
})

describe('combat for real', function () {
    const ItemBuilder = require('../src/ItemBuilder')
    const oItemBuilder = new ItemBuilder()

    it('should attack-types target', function () {
        const cm = new CombatManager()
        cm.defaultDistance = 30
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.defineActions({ actions: [{
            name: 'claw',
            count: 2,
            attackType: 'melee',
            amp: '1d6',
            conveys: []
        }]})
        const c2 = new Creature()
        c2.id = 'c2'
        cm.startCombat(c1, c2)
    })

    it('simulation 1 when c1 attack c2 with a sword, and being out of melee range', function () {
        const oItemBuilder = new ItemBuilder()
        expect(BLUEPRINTS['wpn-shortsword']).toBeDefined()

        const cm = new CombatManager()
        cm.defaultDistance = 30

        const c1 = new Creature()
        c1.id = 'c1'
        const oShortSword1 = oItemBuilder.createItem(BLUEPRINTS['wpn-shortsword'], DATA)
        const oArmorLeather1 = oItemBuilder.createItem(BLUEPRINTS['arm-leather'], DATA)
        c1.mutations.equipItem({ item: oShortSword1 })
        c1.mutations.equipItem({ item: oArmorLeather1 })

        const c2 = new Creature()
        c2.id = 'c2'
        const oShortSword2 = oItemBuilder.createItem(BLUEPRINTS['wpn-shortsword'], DATA)
        const oArmorLeather2 = oItemBuilder.createItem(BLUEPRINTS['arm-leather'], DATA)
        c2.mutations.equipItem({ item: oShortSword2 })
        c2.mutations.equipItem({ item: oArmorLeather2 })

        cm.startCombat(c1, c2)
        const combat1 = cm.getCombat(c1)

        expect(combat1.targetInRange).toEqual({
            melee: false,
            ranged: false,
            selected: false
        })
        const sSlot = combat1.getMostSuitableOffensiveSlot()
        expect(sSlot).toBe('')
        const ao = c1.attack(c2)
        expect(ao.failed).toBeTruthy()
        expect(ao.failure).toBe(CONSTS.ATTACK_FAILURE_DID_NOT_ATTACK)
    })
})