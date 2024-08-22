const Dice = require('./index')

describe('evaluate', function () {
    it('should return 0 when evaluating "0"', function () {
        const d = new Dice()
        expect(d.evaluate(0)).toBe(0)
        expect(d.evaluate('0')).toBe(0)
    })
})

describe('xdy', function () {
    it('should return { sides: 0, count: 0, modifier: 0 } when submitting 0', function () {
        const d = new Dice()
        expect(d.xdy(0)).toEqual({ sides: 0, count: 0, modifier: 0 })
        expect(d.xdy('0')).toEqual({ sides: 0, count: 0, modifier: 0 })
        expect(d.xdy('-0')).toEqual({ sides: 0, count: 0, modifier: 0 })
        expect(d.xdy('0d0+0')).toEqual({ sides: 0, count: 0, modifier: 0 })
        expect(d.xdy('0d0-0')).toEqual({ sides: 0, count: 0, modifier: 0 })
        expect(d.xdy('-0d0-0')).toEqual({ sides: 0, count: 0, modifier: 0 })
    })
    it('should return { sides: 3, count: 1, modifier: 0} when evaluating 1D3', function () {
        const d = new Dice()
        expect(d.xdy('1D3')).toEqual({ sides: 3, count: 1, modifier: 0 })
    })
})

