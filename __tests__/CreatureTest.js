const CONSTS = require('../src/consts')
const Creature = require('../src/Creature')
const EffectProcessor = require('../src/EffectProcessor')
const EFFECTS = require('../src/effects')
const ItemProperties = require('../src/ItemProperties')

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