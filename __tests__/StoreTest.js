const { buildStore } = require('../src/store')
const CONSTS = require('../src/consts')

let oStore = null

beforeEach(() => {
    oStore = buildStore()
})

afterEach(() => {
    oStore = null
})

describe('getAbilities/setAbilityValue', function () {
    it('should return strength = 15 when modifying state to strength = 15', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_STRENGTH, value: 15 })
        expect(oStore.getters.getAbilities[CONSTS.ABILITY_STRENGTH]).toBe(15)
    })
})

describe('getAbilityModifiers', function () {
    it('should return 1 when ability is 15', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_DEXTERITY, value: 15 })
        expect(oStore.getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY]).toBe(1)
    })
    it('should return 0 when ability is 10', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_DEXTERITY, value: 10 })
        expect(oStore.getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY]).toBe(0)
    })
})

describe('getMaxHitPoints', function () {
    it('should return 8 when class is fighter, level is 1 and constitution is 10', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 10 })
        oStore.mutations.setLevel({ value: 1 })
        oStore.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        expect(oStore.getters.getMaxHitPoints).toBe(8)
    })
    it('should return 10 when class is fighter, level is 1 and constitution is 16', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 16 })
        oStore.mutations.setLevel({ value: 1 })
        oStore.mutations.setClassType({ value: CONSTS.CLASS_TYPE_FIGHTER })
        expect(oStore.getters.getMaxHitPoints).toBe(10)
    })
    it('should return 6 when class is wizard, level is 1 and constitution is 16', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 16 })
        oStore.mutations.setLevel({ value: 1 })
        oStore.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        expect(oStore.getters.getMaxHitPoints).toBe(6)
    })
    it('should return 1 when class is wizard, level is 1 and constitution is 1', function () {
        oStore.mutations.setAbilityValue({ ability: CONSTS.ABILITY_CONSTITUTION, value: 1 })
        oStore.mutations.setLevel({ value: 1 })
        oStore.mutations.setClassType({ value: CONSTS.CLASS_TYPE_MAGIC_USER })
        expect(oStore.getters.getMaxHitPoints).toBe(1)
    })
})