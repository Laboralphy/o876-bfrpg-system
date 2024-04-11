const CONSTS = require('../src/consts')
const Creature = require('../src/Creature')
const EffectProcessor = require('../src/EffectProcessor')
const EFFECTS = require('../src/effects')
const ItemProperties = require('../src/ItemProperties')
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
        "WEAPON_TYPE_DAGGER": {
            "size": "WEAPON_SIZE_SMALL",
            "weight": 4,
            "damage": "1d4",
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
    "shield-types": {
        "SHIELD_TYPE_SMALL": {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_SHIELD",
            "shieldType": "SHIELD_TYPE_SMALL",
            ac: 1
        }
    },
    "armor-types": {
        "ARMOR_TYPE_LEATHER": {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_ARMOR",
            "armorType": "ARMOR_TYPE_LEATHER",
            "ac": 2
        },
        "ARMOR_TYPE_PLATE": {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_ARMOR",
            "armorType": "ARMOR_TYPE_LEATHER",
            "ac": 6
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
        },
        "ITEM_TYPE_SHIELD": {
            "slots": ["EQUIPMENT_SLOT_SHIELD"]
        },
        "ITEM_TYPE_ARMOR": {
            "slots": ["EQUIPMENT_SLOT_CHEST"]
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
    },
    leather: {
        "entityType": "ENTITY_TYPE_ITEM",
        "itemType": "ITEM_TYPE_ARMOR",
        "armorType": "ARMOR_TYPE_LEATHER",
        "properties": []
    },
    plate: {
        "entityType": "ENTITY_TYPE_ITEM",
        "itemType": "ITEM_TYPE_ARMOR",
        "armorType": "ARMOR_TYPE_PLATE",
        "properties": []
    },
    shield: {
        "entityType": "ENTITY_TYPE_ITEM",
        "itemType": "ITEM_TYPE_SHIELD",
        "shieldType": "SHIELD_TYPE_SMALL",
        "properties": []
    }
}
const oItemBuilder = new ItemBuilder()


describe('getter getAbilities', function () {
    it('should have 10 to all abilities when creating a fresh creature', function () {
        const c = new Creature()
        const oAbilities = c.getters.getAbilities
        expect(oAbilities[CONSTS.ABILITY_STRENGTH]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_DEXTERITY]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_CONSTITUTION]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_INTELLIGENCE]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_WISDOM]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
    })
    it('should have 12 strength and 10 to all others abilities when applying an ability-modifier of strength +2', function () {
        const c = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const eStrPlus = ep.createEffect(CONSTS.EFFECT_ABILITY_MODIFIER, 2, { ability: CONSTS.ABILITY_STRENGTH })
        ep.applyEffect(eStrPlus, c, 10)
        const oAbilities = c.getters.getAbilities
        expect(oAbilities[CONSTS.ABILITY_STRENGTH]).toBe(12)
        expect(oAbilities[CONSTS.ABILITY_DEXTERITY]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_CONSTITUTION]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_INTELLIGENCE]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_WISDOM]).toBe(10)
        expect(oAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
    })
    it('should have 13 strength when applying an ability-modifier property of strength +3', function () {
        const c = new Creature()
        const ipStrPlus = ItemProperties.build(CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER, 3, { ability: CONSTS.ABILITY_STRENGTH })
        expect(ipStrPlus).toEqual({
            property: CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER,
            amp: 3,
            data: {
                ability: CONSTS.ABILITY_STRENGTH
            }
        })
        c.mutations
            .addCreatureProperty({ property: ItemProperties.build(CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER, 3, { ability: CONSTS.ABILITY_STRENGTH }) })
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(13)
    })
})

describe('available actions', function () {
    it('should have unarmed action as a new creature', function () {
        const c1 = new Creature()
        expect(c1.getters.getSelectedAction).toEqual({
            name: 'unarmed',
            amp: '1d3',
            attackType: CONSTS.ATTACK_TYPE_MELEE,
            conveys: [],
            count: 1
        })
    })
})

describe('attack', function () {
    it('should not throw error when fresh new creature attacks fresh new target', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        expect(() => c1.attack(c2)).not.toThrow()
    })
    it('attack should use unarmed strike when no action selected', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const ao = c1.attack(c2)
        expect(ao.action).toEqual({
            name: 'unarmed',
            count: 1,
            amp: '1d3',
            conveys: [],
            attackType: 'ATTACK_TYPE_MELEE'
        })
    })
    it('new creature should have level 1 and attack bonus 0', function () {
        const c1 = new Creature()
        expect(c1.getters.getLevel).toBe(1)
        expect(c1.getters.getSelectedAction.attackType).toBe(CONSTS.ATTACK_TYPE_MELEE)
        expect(c1.getters.getLevel).toBe(1)
        expect(c1.getters.getClassTypeData.classType).toBe(CONSTS.CLASS_TYPE_TOURIST)
        expect(c1.getters.getClassTypeData.level).toBe(1)
        expect(c1.getters.getClassTypeData.attackBonus).toBe(0)
        expect(c1.getters.getAttackBonus).toBe(0)
    })
    it('new fighter creature should have level 1 and attack bonus 1', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 1 })
        expect(c1.getters.getClassTypeData.attackBonus).toBe(1)
        expect(c1.getters.getAttackBonus).toBe(1)
    })
    it('fighter level 5 attack bonus 4', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 5 })
        expect(c1.getters.getClassTypeData.attackBonus).toBe(4)
        expect(c1.getters.getAttackBonus).toBe(4)
    })
    it('fighter level 5 with strength 13 should have attack bonus 5', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 5 })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 15 })
        expect(c1.getters.getClassTypeData.attackBonus).toBe(4)
        expect(c1.getters.getAttackBonus).toBe(5)
    })
    it('fighter level 5 with strength 13 should have attack bonus 5 (using unarmed strike)', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 5 })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 15 })
        expect(c1.getters.getClassTypeData.attackBonus).toBe(4)
        expect(c1.getters.getSelectedAction.name).toBe('unarmed')
        expect(c1.getters.getAttackBonus).toBe(5)
    })
    it('should provide with improvised weapon when equipping ranged weapon with no ammo', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        const bow = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        c1.mutations.equipItem({ item: bow })
        c1.mutations.selectAction({ action: CONSTS.DEFAULT_ACTION_WEAPON })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        expect(!!c1.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]).toBeTruthy()
        expect(!!c1.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_AMMO]).toBeFalsy()
        expect(c1.getters.getActions).toEqual({
            [CONSTS.DEFAULT_ACTION_WEAPON]: {
                amp: '1d4',
                attackType: CONSTS.ATTACK_TYPE_MELEE,
                conveys: [],
                count: 1,
                name: 'improvised'
            }
        })
        expect(c1.getters.getSelectedAction).toEqual({
            name: 'improvised',
            attackType: 'ATTACK_TYPE_MELEE',
            count: 1,
            conveys: [],
            amp: '1d4'
        })
    })

    it('attack outcome should reference sword when equipping with sword', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const sword = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        c1.mutations.equipItem({ item: sword })
        c1.mutations.selectAction({ action: CONSTS.DEFAULT_ACTION_WEAPON })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c1.getters.getOffensiveSlot).toBe(CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE)
        const oAtkOutcome = c1.attack(c2)
        expect(oAtkOutcome.action.attackType).toBe(CONSTS.ATTACK_TYPE_ANY)
        expect(oAtkOutcome.action.name).toBe('weapon')
        expect(oAtkOutcome.weapon).toBeDefined()
        expect(oAtkOutcome.weapon).not.toBeNull()
        expect(oAtkOutcome.weapon.weaponType).toBe('WEAPON_TYPE_LONGSWORD')
    })

    it('attack outcome should reference improvised weapn when equipping with bow withou arrow', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const bow = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        c1.mutations.equipItem({ item: bow })
        c1.mutations.selectAction({ action: '' })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        const oAtkOutcome = c1.attack(c2)
        expect(oAtkOutcome.action.name).toBe('improvised')
        expect(oAtkOutcome.action.amp).toBe('1d4')
    })

    it('attack outcome should reference bow when equipping with bow anbd arrow', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const bow = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const arrows = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        c1.mutations.equipItem({ item: bow })
        c1.mutations.equipItem({ item: arrows })
        c1.mutations.selectAction({ action: '' })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        const oAtkOutcome = c1.attack(c2)
        expect(oAtkOutcome.action).toBeNull()
    })
})

describe('armor class', function () {
    it('should have 11 natural armor when no armor is worn', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        expect(c1.getters.getArmorClass.melee).toBe(11)
    })
    it('should have 13 AC when wearing leather armor', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.leather, DATA) })
        expect(c1.getters.getArmorClass.melee).toBe(13)
    })
    it('should have 18 AC when wearing plate armor and shield', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.plate, DATA) })
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.shield, DATA) })
        expect(c1.getters.getArmorClass.melee).toBe(18)
    })
    it('should not count shield in ac when using bow', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.plate, DATA) })
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.shield, DATA) })
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.bow, DATA) })
        c1.mutations.equipItem({ item: oItemBuilder.createItem(BLUEPRINTS.arrow, DATA) })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c1.getters.getArmorClass.melee).toBe(18)
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        expect(c1.getters.getArmorClass.melee).toBe(17)
    })
    it('should have a BIG ac when wearing top loot enchanted armor', function () {
        const MEGA_ARMOR_PLUS_3 = {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_ARMOR",
            "armorType": "ARMOR_TYPE_PLATE",
            "properties": [
                {
                    "property": "ITEM_PROPERTY_ARMOR_CLASS_MODIFIER",
                    "amp": 3
                }
            ]
        }
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.equipItem({ item: oItemBuilder.createItem(MEGA_ARMOR_PLUS_3, DATA) })
        expect(c1.getters.getArmorClass.melee).toBe(20)
        expect(c1.getters.getArmorClass.ranged).toBe(20)
    })
    it('should have different ac ranged/melee when wearing anti missile shield', function () {
        const ANTI_MISSILE_SHIELD = {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_SHIELD",
            "shieldType": "SHIELD_TYPE_SMALL",
            "properties": [
                {
                    "property": "ITEM_PROPERTY_ARMOR_CLASS_MODIFIER",
                    "attackType": "ATTACK_TYPE_RANGED",
                    "amp": 3
                }
            ]
        }
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.equipItem({ item: oItemBuilder.createItem(ANTI_MISSILE_SHIELD, DATA) })
        expect(c1.getters.getArmorClass.melee).toBe(12)
        expect(c1.getters.getArmorClass.ranged).toBe(15)
    })
})

describe('attack-bonus', function () {
    it('should have +2 attack bonus when usin +2 dagger', function () {
        const DAGGER_PLUS_2 = {
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_WEAPON",
            "weaponType": "WEAPON_TYPE_DAGGER",
            "material": "MATERIAL_SILVER",
            "properties": [
                {
                    "property": "ITEM_PROPERTY_ATTACK_MODIFIER",
                    "amp": 2
                },
                {
                    "property": "ITEM_PROPERTY_DAMAGE_MODIFIER",
                    "amp": 2
                }
            ]
        }
        const oDagger = oItemBuilder.createItem(DAGGER_PLUS_2, DATA)
        expect(oDagger.material).toBe(CONSTS.MATERIAL_SILVER)
        expect(oDagger.damage).toBe('1d4')
        const c1 = new Creature()
        c1.id = 'c1'
        c1.mutations.setLevel({ value: 5 })
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 16 })
        c1.mutations.equipItem({ item: oDagger })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c1.getters.getAttackBonus).toBe(8) // 4 AB fighter-level-5 +2 strength +2 dagger
    })
})

describe('ranged action and melee action', function () {
    it('should liste ranged action of a bombardier', function () {
        const c1 = new Creature()
        c1.mutations.defineActions({ actions: [
                {
                    name: 'claws',
                    amp: '1d4',
                    count: 2,
                    attackType: CONSTS.ATTACK_TYPE_MELEE,
                    conveys: []
                },
                {
                    name: 'bite',
                    amp: '1d6',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_MELEE,
                    conveys: []
                },
                {
                    name: 'spit',
                    amp: '1d6',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_RANGED_TOUCH,
                    conveys: []
                },
                {
                    name: 'throw',
                    amp: '1d8',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_RANGED,
                    conveys: []
                },
                {
                    name: 'drain',
                    amp: '1d8',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_MELEE_TOUCH,
                    conveys: []
                }
            ]
        })
        expect(c1.getters.getMeleeActions).toEqual(['claws', 'bite', 'drain'])
        expect(c1.getters.getRangedActions).toEqual(['spit', 'throw'])
    })
    it('should liste ranged action of a bombardier', function () {
        const c1 = new Creature()
        c1.mutations.defineActions({ actions: [
                {
                    name: 'bite',
                    amp: '1d6',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_MELEE,
                    conveys: []
                },
                {
                    name: 'spit',
                    amp: '1d6',
                    count: 1,
                    attackType: CONSTS.ATTACK_TYPE_RANGED_TOUCH,
                    conveys: []
                }
            ]
        })
        const oDagger = oItemBuilder.createItem({
            "entityType": "ENTITY_TYPE_ITEM",
            "itemType": "ITEM_TYPE_WEAPON",
            "weaponType": "WEAPON_TYPE_DAGGER",
            "material": "MATERIAL_SILVER",
            "properties": [
                {
                    "property": "ITEM_PROPERTY_ATTACK_MODIFIER",
                    "amp": 2
                },
                {
                    "property": "ITEM_PROPERTY_DAMAGE_MODIFIER",
                    "amp": 2
                }
            ]
        }, DATA)
        const bow = oItemBuilder.createItem(BLUEPRINTS.bow, DATA)
        const arrow = oItemBuilder.createItem(BLUEPRINTS.arrow, DATA)
        c1.mutations.equipItem({ item: oDagger })
        c1.mutations.equipItem({ item: bow })
        c1.mutations.equipItem({ item: arrow })

        expect(c1.getters.getOffensiveSlot).toBe(CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE)
        expect(c1.getters.getMeleeActions).toEqual(['bite'])
        expect(c1.getters.getRangedActions).toEqual(['spit'])

        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })

        expect(c1.getters.getOffensiveSlot).toBe(CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED)
        expect(c1.getters.getMeleeActions).toEqual(['bite'])
        expect(c1.getters.getRangedActions).toEqual(['spit'])

        // No more ammunition, ranged weapon become improvised melee weapon
        c1.mutations.removeItem({ slot: CONSTS.EQUIPMENT_SLOT_AMMO })
        expect(c1.getters.getMeleeActions).toEqual(['bite'])
        expect(c1.getters.isRangedWeaponLoaded).toBeFalsy()
        expect(c1.getters.getRangedActions).toEqual(['spit'])

        c1.mutations.removeItem({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        c1.mutations.removeItem({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        c1.mutations.removeItem({ slot: CONSTS.EQUIPMENT_SLOT_AMMO })
        expect(c1.getters.getMeleeActions).toEqual(['bite'])
        expect(c1.getters.getRangedActions).toEqual(['spit'])
    })
})