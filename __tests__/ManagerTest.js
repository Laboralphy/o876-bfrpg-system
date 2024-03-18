const Manager = require('../src/Manager')
const CONSTS = require('../src/consts')

describe('createCreature', function () {
    it('should create a creature when calling the function', function () {
        const m = new Manager()
        expect(m.horde.creatures['c1']).toBeUndefined()
        m.createCreature({ id: 'c1' })
        expect(m.horde.creatures['c1']).toBeDefined()
    })
})

describe('destroyCreature', function () {
    it('should destroy a creature when calling the function', function () {
        const m = new Manager()
        const c1 = m.createCreature({ id: 'c1' })
        expect(m.horde.creatures['c1']).toBeDefined()
        m.destroyCreature(c1)
        expect(m.horde.creatures['c1']).toBeUndefined()
    })
    it('should remove effect cast by c1 when destroying c1', function () {
        const m = new Manager()
        const c1 = m.createCreature({ id: 'c1' })
        const c2 = m.createCreature({ id: 'c2' })
        const e1 = m.effectProcessor.createEffect(CONSTS.EFFECT_HEAL, 1)
        m.effectProcessor.applyEffect(e1, c2, 100, c1)
        expect(c2.getters.getEffects.length).toBe(1)
        expect(c2.getters.getEffects[0].type).toBe(CONSTS.EFFECT_HEAL)
        m.destroyCreature(c1) // should also dispell e1
        expect(c2.getters.getEffects.length).toBe(0) // now e1 is dispelled
    })
})
