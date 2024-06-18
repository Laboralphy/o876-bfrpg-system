const PickInputOutput = require('./index')

describe('Input validation', function () {
    it('should not validate when using empty data', function () {
        expect(() => {
            const p = new PickInputOutput([], 'i', 'o')
        }).toThrow(new TypeError('pick-input-output: data should be an non empty array'))
        expect(() => {
            const p = new PickInputOutput(null, 'i', 'o')
        }).toThrow(new TypeError('pick-input-output: data should be an non empty array'))
    })

    it ('should not validate when there is an input which is not an array', function () {
        expect(() => {
            const p = new PickInputOutput([
                {
                    i: 0,
                    o: 1
                },
                {
                    i: [1, 2],
                    o: 2
                }
            ], 'i', 'o')
        }).toThrow()
    })

    it ('should not validate when there is an input which is not properly ordered', function () {
        expect(() => {
            const p = new PickInputOutput([
                {
                    i: [0, 1],
                    o: 1
                },
                {
                    i: [3, 2],
                    o: 2
                }
            ], 'i', 'o')
        }).toThrow(new Error('pick-input-output: input bounds order error - input[0] must be <= input[1]'))
    })

    it ('should not validate when there is an input which is not properly formatted', function () {
        expect(() => {
            const p = new PickInputOutput([
                {
                    i: 'alpha',
                    o: 1
                },
                {
                    i: [2, 3],
                    o: 2
                }
            ], 'i', 'o')
        }).toThrow(new Error('pick-input-output: unsupported format. each item must be : { i: [number, number], o: number'))
    })

    it('should validate when data is properly formatted', function () {
        expect(() => {
            const p = new PickInputOutput([
                {
                    i: [0, 1],
                    o: 1
                },
                {
                    i: [2, 3],
                    o: 2
                }
            ], 'i', 'o')
        }).not.toThrow()
    })
})

describe('check validate overlap', function () {
    it('should not validate data if overlap', function () {
        expect(() => {
            const p = new PickInputOutput([
                {
                    i: [0, 2],
                    o: 1
                },
                {
                    i: [2, 4],
                    o: 2
                }
            ], 'i', 'o')
        }).toThrow(new Error('pick-input-output: overlapping inputs'))
    })
})

describe('getValue', function () {
    const AB = [
        {
            "values": [3],
            "modifier": -3
        },
        {
            "values": [4, 5],
            "modifier": -2
        },
        {
            "values": [6, 8],
            "modifier": -1
        },
        {
            "values": [9, 12],
            "modifier": 0
        },
        {
            "values": [13, 15],
            "modifier": 1
        },
        {
            "values": [16, 17],
            "modifier": 2
        },
        {
            "values": [18],
            "modifier": 3
        },
        {
            "values": [19],
            "modifier": 4
        },
        {
            "values": [20],
            "modifier": 5
        }
    ]
    const p = new PickInputOutput(AB, 'values', 'modifier')

    it('should return -3 when asking for input 1, 2 and 3', function () {
        expect(p.getValue(1)).toBe(-3)
        expect(p.getValue(2)).toBe(-3)
        expect(p.getValue(3)).toBe(-3)
    })

    it('should return 5 when asking for input 20 30 50', function () {
        expect(p.getValue(20)).toBe(5)
        expect(p.getValue(30)).toBe(5)
        expect(p.getValue(50)).toBe(5)
    })

    it('should return -2 when asking for input 4, 5', function () {
        expect(p.getValue(4)).toBe(-2)
        expect(p.getValue(5)).toBe(-2)
    })

    it('should return -1 when asking for input 6, 7, 8', function () {
        expect(p.getValue(6)).toBe(-1)
        expect(p.getValue(7)).toBe(-1)
        expect(p.getValue(8)).toBe(-1)
    })

    it('should return 0 when asking for input 9, 10, 11, 12', function () {
        expect(p.getValue(9)).toBe(0)
        expect(p.getValue(10)).toBe(0)
        expect(p.getValue(11)).toBe(0)
        expect(p.getValue(12)).toBe(0)
    })

    it('should return 1 when asking for input 13, 14, 15', function () {
        expect(p.getValue(13)).toBe(1)
        expect(p.getValue(14)).toBe(1)
        expect(p.getValue(15)).toBe(1)
    })

    it('should return 2 when asking for input 16, 17', function () {
        expect(p.getValue(16)).toBe(2)
        expect(p.getValue(17)).toBe(2)
    })

    it('should return 3 when asking for input 18', function () {
        expect(p.getValue(18)).toBe(3)
    })

    it('should return 4 when asking for input 19', function () {
        expect(p.getValue(19)).toBe(4)
    })

    it('should return 5 when asking for input 20', function () {
        expect(p.getValue(20)).toBe(5)
    })
})