const Creature = require("../src/Creature");
const CONSTS = require('../src/consts')
const EffectProcessor = require("../src/EffectProcessor");
const EFFECTS = require('../src/effects')

describe('apply-effect', function () {
    it('should heal creatures when applying heal effect', function () {
        const oCreature = new Creature()
        const oHorde = {
            creatures: {
            }
        }
        oHorde.creatures[oCreature.id] = oCreature
        const effectProcessor = new EffectProcessor()
        effectProcessor.effectPrograms = EFFECTS
        expect(oCreature.getters.getMaxHitPoints).toBe(5)
        expect(oCreature.getters.getHitPoints).toBe(1)
        const eHeal = effectProcessor.createEffect(CONSTS.EFFECT_HEAL, 2)
        effectProcessor.applyEffect(eHeal, oCreature, 0)
        expect(oCreature.getters.getHitPoints).toBe(3)
    })
})

describe('processEffect', function () {
    it('should call effect mutate function when processing effect', function () {
        const c1 = new Creature()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        const aLog = []
        ep.effectPrograms.EFFECT_TESTING = {
            init: function (oEffect) {
                aLog.push('create effect testing')
            },
            mutate: function (oEffect, target, source) {
                aLog.push('mutate effect testing')
            },
            dispose: function (oEffect, target, source) {
                aLog.push('dispose effect testing')
            }
        }
        const e1 = ep.createEffect('EFFECT_TESTING')
        const e1x = ep.applyEffect(e1, c1, 10)
        expect(aLog).toEqual(['create effect testing'])
        expect(e1x.duration).toBe(10)
        ep.processEffect(e1x, c1, c1)
        expect(aLog).toEqual(['create effect testing', 'mutate effect testing'])
        expect(e1x.duration).toBe(9)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        ep.processEffect(e1x, c1, c1)
        expect(e1x.duration).toBe(1)
        ep.processEffect(e1x, c1, c1)
        expect(e1x.duration).toBe(0)
        expect(c1.getters.getEffects.length).toBe(0)
        expect(aLog).toEqual([
            'create effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'mutate effect testing',
            'dispose effect testing'
        ])
    })
})