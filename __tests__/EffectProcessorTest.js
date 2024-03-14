const Creature = require("../src/Creature");
const CONSTS = require('../src/consts')

describe('apply-effect', function () {
    it('should heal creature when applying heal effect', function () {
        const oCreature = new Creature()
        const oHorde = {
            creatures: {
            }
        }
        oHorde.creatures[oCreature.id] = oCreature
        oCreature.effectProcessor.horde = oHorde
        expect(oCreature.store.getters.getMaxHitPoints).toBe(5)
        expect(oCreature.store.getters.getHitPoints).toBe(1)
        const eHeal = oCreature.effectProcessor.createEffect(CONSTS.EFFECT_HEAL, { amount: 2 })
        oCreature.effectProcessor.applyEffect(eHeal, oCreature, 0)
        expect(oCreature.store.getters.getHitPoints).toBe(3)
    })
})