const DATA = require('../src/data')

function combineGrids (a, b) {
    const c = {}
    for (let x in a) {
        if (x in b) {
            c[x] = []
            for (let i = 0, l = a[x].length; i < l; ++i) {
                c[x].push(Math.min(a[x][i], b[x][i]))
            }
        }
    }
    return c
}

describe('test combineGrid', function () {
    it('should do correct work', function () {
        const a = {
            a1: [8, 4, 5, 6],
            a2: [7, 8, 10, 2]
        }
        const b = {
            a1: [9, 3, 0, 10],
            a2: [9, 11, 9, 1]
        }
        expect(combineGrids(a, b)).toEqual({
            a1: [8, 3, 0, 6],
            a2: [7, 8, 9, 1]
        })
    })
})

describe('fighter magic user', function () {
    const dct = DATA["class-types"]
    it('combining fighter st table + magic user st table should give fmu st table', function () {
        const f = dct.CLASS_TYPE_FIGHTER.savingThrows
        const mu = dct.CLASS_TYPE_MAGIC_USER.savingThrows
        const fmu = dct.CLASS_TYPE_FIGHTER_MAGIC_USER.savingThrows
        expect(combineGrids(f, mu)).toEqual(fmu)
    })
    it('combining rogue st table + magic user st table should give rmu st table', function () {
        const r = dct.CLASS_TYPE_ROGUE.savingThrows
        const mu = dct.CLASS_TYPE_MAGIC_USER.savingThrows
        const rmu = dct.CLASS_TYPE_ROGUE_MAGIC_USER.savingThrows
        expect(combineGrids(r, mu)).toEqual(rmu)
    })
})