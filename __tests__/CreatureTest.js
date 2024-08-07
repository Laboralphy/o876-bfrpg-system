const CONSTS = require('../src/consts')
const Creature = require('../src/Creature')
const EffectProcessor = require('../src/EffectProcessor')
const EFFECTS = require('../src/effects')
const ItemProperties = require('../src/ItemProperties')
const ItemBuilder = require('../src/ItemBuilder')

const DATA = {
    "default-actions": {
        "DEFAULT_ACTION_UNARMED": {
            "name": "DEFAULT_ACTION_UNARMED",
            "count": 1,
            "damage": "1d3",
            "conveys": [],
            "attackType": "ATTACK_TYPE_MELEE"
        },
        "DEFAULT_ACTION_WEAPON": {
            "name": "DEFAULT_ACTION_WEAPON",
            "count": 1,
            "damage": "",
            "conveys": [],
            "attackType": "ATTACK_TYPE_ANY"
        }
    },
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
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(10)
        const ipStrPlus = ItemProperties.build(CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER, 3, { ability: CONSTS.ABILITY_STRENGTH })
        expect(ipStrPlus).toEqual({
            property: CONSTS.ITEM_PROPERTY_ABILITY_MODIFIER,
            amp: 3,
            data: {
                ability: CONSTS.ABILITY_STRENGTH
            }
        })
        c.mutations
            .addCreatureProperty({ property: ipStrPlus })
        const x = c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]
        expect(x).toBe(13)
    })
})

describe('available actions', function () {
    it('should have unarmed action as a new creature', function () {
        const c1 = new Creature()
        expect(c1.getters.getSelectedAction).toBeNull()
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
    it('new creature should have level 1 and attack bonus 0', function () {
        const c1 = new Creature()
        expect(c1.getters.getLevel).toBe(1)
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
        expect(c1.getters.getSelectedAction).toBeNull()
        expect(c1.getters.getAttackBonus).toBe(5)
    })
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
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c1.mutations.setLevel({ value: 5 })
        c1.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 16 })
        c1.mutations.equipItem({ item: oDagger })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c1.getters.getAttackBonus).toBe(8) // 4 AB fighter-level-5 +2 strength +2 dagger
    })
})

describe('ranged action and melee action', function () {
    it('should list ranged action of a bombardier', function () {
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


describe('attack', function () {
    it('should not throw error when fresh new creature attacks fresh new target', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        expect(() => c1.attack(c2)).not.toThrow()
    })

    it('attack outcome should reference sword when equipping with sword', function () {
        const c1 = new Creature()
        c1.id = 'c1'
        const c2 = new Creature()
        c2.id = 'c2'
        const sword = oItemBuilder.createItem(BLUEPRINTS.sword, DATA)
        c1.mutations.equipItem({ item: sword })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE })
        expect(c1.getters.getOffensiveSlot).toBe(CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE)
        const oAtkOutcome = c1.attack(c2, DATA['default-actions'].DEFAULT_ACTION_WEAPON)
        expect(oAtkOutcome.action).toEqual(DATA['default-actions'].DEFAULT_ACTION_WEAPON)
        expect(oAtkOutcome.weapon).toBeDefined()
        expect(oAtkOutcome.weapon).not.toBeNull()
        expect(oAtkOutcome.weapon.weaponType).toBe('WEAPON_TYPE_LONGSWORD')
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
        const oAtkOutcome = c1.attack(c2, DATA['default-actions'].DEFAULT_ACTION_WEAPON)
        expect(oAtkOutcome.action).toEqual(DATA['default-actions'].DEFAULT_ACTION_WEAPON)
    })
})

describe('race specialities', function () {
    it('should be able to create a human fighter', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setLevel({ value: 5 })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_HUMAN })
        c.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 18 })
        expect(c.getters.getRace.maxHdPerLevel).toBe(Infinity)
        expect(c.getters.getMaxHitPoints).toBe(5 * (8 + 3))
    })
    it('an elf fighter should have hp 45', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setLevel({ value: 5 })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_ELF })
        c.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 18 })
        expect(c.getters.getRace.maxHdPerLevel).toBe(6)
        expect(c.getters.getMaxHitPoints).toBe(5 * (6 + 3))
    })
})

describe('class type tourist', function () {
    it('should not have any bonus', function () {
        const c = new Creature()
        expect(c.getters.getClassTypeData.ref).toBe('CLASS_TYPE_TOURIST')
        expect(c.getters.getMaxHitPoints).toBe(4)
        expect(c.getters.getHitPoints).toBe(4)
        expect(c.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(10)
        expect(c.getters.getAbilities[CONSTS.ABILITY_DEXTERITY]).toBe(10)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CONSTITUTION]).toBe(10)
        expect(c.getters.getAbilities[CONSTS.ABILITY_INTELLIGENCE]).toBe(10)
        expect(c.getters.getAbilities[CONSTS.ABILITY_WISDOM]).toBe(10)
        expect(c.getters.getAbilities[CONSTS.ABILITY_CHARISMA]).toBe(10)
        expect(c.getters.getLevel).toBe(1)
        expect(c.getters.getSpecie.ref).toBe(CONSTS.SPECIE_HUMANOID)
        expect(c.getters.getRace.ref).toBe(CONSTS.RACE_UNKNOWN)
        expect(c.getters.getArmorClass).toEqual({
            "equipment": 11,
            "melee": 11,
            "natural": 11,
            "ranged": 11,
            "details": {
                "armor": 0,
                "dexterity": 0,
                "shield": 0
            }
        })
    })
})

describe('savingThrow bonus', function () {
    it('should not have any bonus when race is human', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_HUMAN })
        expect(c.getters.getSavingThrowBonus[CONSTS.SAVING_THROW_SPELL]).toBe(0)
    })

    it('should have bonus when race is elf', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_ELF })
        expect(c.getters.getSavingThrowBonus[CONSTS.SAVING_THROW_SPELL]).toBe(2)
    })

    it('should have bonus when race is elf and having property', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_ELF })
        c.mutations.addCreatureProperty({
            property: ItemProperties.build(CONSTS.ITEM_PROPERTY_SAVING_THROW_MODIFIER, 4, { savingThrow: CONSTS.SAVING_THROW_SPELL })
        })
        expect(c.getters.getSavingThrowBonus[CONSTS.SAVING_THROW_SPELL]).toBe(6)
        expect(c.getters.getPropertySet.has(CONSTS.ITEM_PROPERTY_DARKVISION))
    })

    it('should not be able to use large and medium weapon when race is halfling', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_HALFLING })
        expect([...c.getters.getWeaponSizeRestrictionSet]).toEqual([
            CONSTS.WEAPON_SIZE_SMALL
        ])
    })

    it('should not be able to use large weapon when race is dwarf', function () {
        const c = new Creature()
        c.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        c.mutations.setSpecie({ value: CONSTS.SPECIE_HUMANOID })
        c.mutations.setRace({ value: CONSTS.RACE_DWARF })
        expect([...c.getters.getWeaponSizeRestrictionSet]).toEqual([
            CONSTS.WEAPON_SIZE_SMALL,
            CONSTS.WEAPON_SIZE_MEDIUM,
        ])
    })
})

describe('attacking with visibility issues', function () {
    it('should attack creature when clearly see target', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const o1 = c1.attack(c2, DATA["default-actions"].DEFAULT_ACTION_UNARMED)
        expect(o1.failed).toBeFalsy()
        expect(o1.bonus).toBe(0)
        expect(o1.visibility).toBe('CREATURE_VISIBILITY_VISIBLE')
    })

    it('should have attack malus of -4 when attacker is blinded', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const eBlind = ep.createEffect(CONSTS.EFFECT_BLINDNESS)
        ep.applyEffect(eBlind, c1, 10)
        const o1 = c1.attack(c2, DATA["default-actions"].DEFAULT_ACTION_UNARMED)
        expect(o1.failed).toBeFalsy()
        expect(o1.visibility).toBe('CREATURE_VISIBILITY_BLINDED')
        expect(o1.bonus).toBe(-4)
    })

    it('should have attack malus of -4 when target is invisible', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const eBlind = ep.createEffect(CONSTS.EFFECT_INVISIBILITY)
        ep.applyEffect(eBlind, c2, 10)
        const o1 = c1.attack(c2, DATA["default-actions"].DEFAULT_ACTION_UNARMED)
        expect(o1.failed).toBeFalsy()
        expect(o1.visibility).toBe('CREATURE_VISIBILITY_INVISIBLE')
        expect(o1.bonus).toBe(-4)
    })

    it('should NOT have attack malus of -4 when target is invisible, and we have EFFECT_SEE_INVISIBILITY', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const eInvis = ep.createEffect(CONSTS.EFFECT_INVISIBILITY)
        const eSeeInvis = ep.createEffect(CONSTS.EFFECT_SEE_INVISIBILITY)
        ep.applyEffect(eInvis, c2, 10)
        ep.applyEffect(eSeeInvis, c1, 10)
        const o1 = c1.attack(c2, DATA["default-actions"].DEFAULT_ACTION_UNARMED)
        expect(o1.failed).toBeFalsy()
        expect(o1.visibility).toBe('CREATURE_VISIBILITY_VISIBLE')
        expect(o1.bonus).toBe(0)
    })

    it('should have attack malus of -4 when target is invisible, and we have Blindness ; maluses should not stack', function () {
        const c1 = new Creature()
        const c2 = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const eInvis = ep.createEffect(CONSTS.EFFECT_INVISIBILITY)
        const eSeeInvis = ep.createEffect(CONSTS.EFFECT_BLINDNESS)
        ep.applyEffect(eInvis, c2, 10)
        ep.applyEffect(eSeeInvis, c1, 10)
        const o1 = c1.attack(c2, DATA["default-actions"].DEFAULT_ACTION_UNARMED)
        expect(o1.failed).toBeFalsy()
        expect(o1.visibility).toBe('CREATURE_VISIBILITY_BLINDED')
        expect(o1.bonus).toBe(-4)
    })
})

describe('rollskill', function () {
    it('should success roll skill', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_ROGUE })
        c1.mutations.setLevel({ value: 5 })
        let oRollSkillEvent
        c1.events.on('roll-skill', ev => {
            oRollSkillEvent = ev
        })
        c1.dice.cheat(0.75)
        c1.rollSkill(CONSTS.SKILL_HIDE, 0)
        expect(oRollSkillEvent).toEqual({
            difficulty: 70,
            roll: 76,
            skill: 'SKILL_HIDE',
            skillValue: 30,
            success: true
        })
    })
    it('should fail roll skill', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_ROGUE })
        c1.mutations.setLevel({ value: 5 })
        let oRollSkillEvent
        c1.events.on('roll-skill', ev => {
            oRollSkillEvent = ev
        })
        c1.dice.cheat(0.2)
        c1.rollSkill(CONSTS.SKILL_HIDE, 0)
        expect(oRollSkillEvent).toEqual({
            difficulty: 70,
            roll: 21,
            skill: 'SKILL_HIDE',
            skillValue: 30,
            success: false
        })
    })
    it('should fail roll skill because of difficulty', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_ROGUE })
        c1.mutations.setLevel({ value: 5 })
        let oRollSkillEvent
        c1.events.on('roll-skill', ev => {
            oRollSkillEvent = ev
        })
        c1.dice.cheat(0.75)
        c1.rollSkill(CONSTS.SKILL_HIDE, 20)
        expect(oRollSkillEvent).toEqual({
            difficulty: 90,
            roll: 76,
            skill: 'SKILL_HIDE',
            skillValue: 30,
            success: false
        })
    })
    it('should pass roll skill when difficulty is lowered', function () {
        const c1 = new Creature()
        c1.mutations.setClassType({ value: CONSTS.CLASS_TYPE_ROGUE })
        c1.mutations.setLevel({ value: 5 })
        let oRollSkillEvent
        c1.events.on('roll-skill', ev => {
            oRollSkillEvent = ev
        })
        c1.dice.cheat(0.2)
        c1.rollSkill(CONSTS.SKILL_HIDE, -60)
        expect(oRollSkillEvent).toEqual({
            difficulty: 10,
            roll: 21,
            skill: 'SKILL_HIDE',
            skillValue: 30,
            success: true
        })
    })
})
