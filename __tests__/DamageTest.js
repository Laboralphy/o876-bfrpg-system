const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')

let oManager

beforeAll(async () => {
    oManager = new Manager()
    await oManager.init()
    oManager.loadModule('classic')
})

afterAll(() => {
    oManager = null
})

describe('damage', function () {
    it('hp should drop from 32 to 22 when using damage mutation with amount 10 damage', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        c.mutations.damage({ amount: 10 })
        expect(c.getters.getHitPoints).toBe(22)
    })
    test('hp should drop from 32 to 22 when applying fire damage effect', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        oManager.effectProcessor.applyEffect(eDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(22)
    })
    test('hp should drop from 32 to 27 when applying fire damage effect and fire resistance effect', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eResist = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_RESISTANCE, 0, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        const eDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        oManager.effectProcessor.applyEffect(eResist, c, 10)
        oManager.effectProcessor.applyEffect(eDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(27)
        expect(eDamage.data.originalAmount).toBe(10)
        expect(eDamage.data.appliedAmount).toBe(5)
        expect(eDamage.data.resistedAmount).toBe(5)
    })
    test('hp should no drop from 32 to 27 when applying fire damage effect and fire immunity effect', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eImm = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_IMMUNITY, 0, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        const eDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        oManager.effectProcessor.applyEffect(eImm, c, 10)
        oManager.effectProcessor.applyEffect(eDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(32)
        expect(eDamage.data.originalAmount).toBe(10)
        expect(eDamage.data.appliedAmount).toBe(0)
        expect(eDamage.data.resistedAmount).toBe(10)
    })
    test('hp should no drop from 32 to 12 when applying fire damage effect and fire vulnerability effect', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eVul = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_VULNERABILITY, 0, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        const eDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        oManager.effectProcessor.applyEffect(eVul, c, 10)
        oManager.effectProcessor.applyEffect(eDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(12)
        expect(eDamage.data.originalAmount).toBe(10)
        expect(eDamage.data.appliedAmount).toBe(20)
        expect(eDamage.data.resistedAmount).toBe(0)
    })
    test('hp should no drop from 32 to 22 when applying fire damage effect and fire vulnerability and resistance effect', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eVul = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_VULNERABILITY, 0, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        const eResist = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_RESISTANCE, 0, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        const eDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_FIRE })
        oManager.effectProcessor.applyEffect(eVul, c, 10)
        oManager.effectProcessor.applyEffect(eResist, c, 10)
        oManager.effectProcessor.applyEffect(eDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(22)
        expect(eDamage.data.originalAmount).toBe(10)
        expect(eDamage.data.appliedAmount).toBe(10)
        expect(eDamage.data.resistedAmount).toBe(0)
    })
    it('should be immune to weapon damage but non-immune to silver weapons', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eVulSilv = oManager.effectProcessor.createEffect(CONSTS.EFFECT_MATERIAL_VULNERABILITY, 0, { materialType: CONSTS.MATERIAL_SILVER })
        const eImmWeapon = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_IMMUNITY, 0, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL })
        const eSteelDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL, material: CONSTS.MATERIAL_STEEL })
        const eSilverDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL, material: CONSTS.MATERIAL_SILVER })
        oManager.effectProcessor.applyEffect(eVulSilv, c, 10)
        oManager.effectProcessor.applyEffect(eImmWeapon, c, 10)

        expect(c.getters.getDamageMitigation).toEqual({
                DAMAGE_TYPE_PHYSICAL: {
                    reduction: 0,
                    resistance: false,
                    vulnerability: false,
                    immunity: true,
                    factor: 0
                },
                MATERIAL_SILVER: {
                    reduction: 0,
                    resistance: false,
                    vulnerability: true,
                    immunity: false,
                    factor: 2
                }
            }
        )

        oManager.effectProcessor.applyEffect(eSteelDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(32)
        oManager.effectProcessor.applyEffect(eSilverDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(22)
    })
    it('should be resistant to weapon damage but non-resistant to silver weapons', function () {
        const c = oManager.createCreature({ id: 'm1', ref: 'c-centaur' })
        expect(c.getters.getHitPoints).toBe(32)
        const eVulSilv = oManager.effectProcessor.createEffect(CONSTS.EFFECT_MATERIAL_VULNERABILITY, 0, { materialType: CONSTS.MATERIAL_SILVER })
        const eResWeapon = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE_RESISTANCE, 0, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL })
        const eSteelDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL, material: CONSTS.MATERIAL_STEEL })
        const eSilverDamage = oManager.effectProcessor.createEffect(CONSTS.EFFECT_DAMAGE, 10, { damageType: CONSTS.DAMAGE_TYPE_PHYSICAL, material: CONSTS.MATERIAL_SILVER })
        oManager.effectProcessor.applyEffect(eVulSilv, c, 10)
        oManager.effectProcessor.applyEffect(eResWeapon, c, 10)

        expect(c.getters.getDamageMitigation).toEqual({
                DAMAGE_TYPE_PHYSICAL: {
                    reduction: 0,
                    resistance: true,
                    vulnerability: false,
                    immunity: false,
                    factor: 0.5
                },
                MATERIAL_SILVER: {
                    reduction: 0,
                    resistance: false,
                    vulnerability: true,
                    immunity: false,
                    factor: 2
                }
            }
        )

        oManager.effectProcessor.applyEffect(eSteelDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(27)
        oManager.effectProcessor.applyEffect(eSilverDamage, c, 0)
        expect(c.getters.getHitPoints).toBe(17)
    })
})