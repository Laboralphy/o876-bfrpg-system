class Horde {
    constructor () {
        this._creatures = {}
    }

    get creatures () {
        return this._creatures
    }

    forEach (f) {
        const aCreatures = Object.values(this._creatures)
        aCreatures.forEach(((creature, index) => f(creature, index, aCreatures)))
    }

    linkCreature (oCreature) {
        this._creatures[oCreature.id] = oCreature
    }

    unlinkCreature (oCreature) {
        delete this._creatures[oCreature.id]
    }
}

module.exports = Horde