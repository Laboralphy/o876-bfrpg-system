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
        c1.mutations.selectAction({ action: CONSTS.DEFAULT_ACTION_WEAPON })
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
        c1.mutations.selectAction({ action: CONSTS.DEFAULT_ACTION_WEAPON })
        c1.mutations.setOffensiveSlot({ slot: CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED })
        const oAtkOutcome = c1.attack(c2)
        expect(oAtkOutcome.action.name).toBe('weapon')
        expect(oAtkOutcome.action.amp).toBe('')
    })
})
