const Manager = require('../src/Manager')
const CONSTS = require("../src/consts");

describe('checking all actor blueprints', function () {
    it('should not throw error when validating all actor blueprint', async function () {
        const manager = new Manager()
        await manager.init()
        manager.loadModule('classic')

        expect(manager.blueprints).toBeDefined()

        function checkAllActors() {
            Object.entries(manager.blueprints).forEach(([key, value]) => {
                manager.getBlueprint(key)
            })
        }

        expect(checkAllActors).not.toThrow()
        const aValidBlueprints = Object.keys(manager._validBlueprints).sort((a, b) => a.localeCompare(b))
        const aLoadedBlueprints = Object.keys(manager.blueprints).sort((a, b) => a.localeCompare(b))
        expect(aValidBlueprints).toEqual(aLoadedBlueprints)
    })
})
