const SmartData = require('../src/libs/smart-data')

describe('test1', function () {
    it('should instanciate without error', function () {
        const s = new SmartData()
        const aCodes = s.compile({
            c1: 'c.name=value',
            c2: 'c.age=value|0'
        })
        const oContext = s.createContext()
        s.run(['ifrit', 10000], aCodes, oContext)
        expect(oContext.c).toEqual({
            name: 'ifrit',
            age: 10000
        })
    })

    it('should create complex struct', function () {
        const s = new SmartData()
        const aCodes = s.compile({
            c1: 'c.name=value',
            prop: ''
        })
    })
})