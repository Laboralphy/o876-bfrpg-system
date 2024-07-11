const ppcm = require('./index')

describe('test1', function () {
    it('should return 60, when searchinppcm of 20, 3', function () {
        expect(ppcm(20, 3)).toBe(60)
        expect(ppcm(20, 3, 7)).toBe(420)
        expect(ppcm(20, 3, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1)).toBe(420)
        expect(ppcm(1, 1, 1, 1, 3)).toBe(3)
    })
})