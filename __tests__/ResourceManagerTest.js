const ResourceManager = require('../src/libs/resource-manager')

describe('ResourceManager', function () {
    it('should return { alpha: { x: 1 }} when defining resource type alpha with key x and value 1', function () {
        const rm = new ResourceManager()
        rm.assign('alpha', { x: 1 })
        expect(rm.data).toHaveProperty('alpha')
        expect(rm.data.alpha).toHaveProperty('x')
        expect(rm.data).toEqual({ alpha: { x: 1 } })
    })
})