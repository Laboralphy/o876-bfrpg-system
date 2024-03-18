const { v4: uuidv4 } = require('uuid')
const { buildStore } = require('./store')
const Dice = require('./libs/dice')

/**
 * @class Creature
 */
class Creature {
    constructor () {
        this._id = uuidv4({}, null, 0)
        this._name = this._id
        this._dice = new Dice()
        this._store = buildStore()
    }

    /**
     * Creature store getters
     * @returns {BFStoreGetters}
     */
    get getters () {
        return this._store.getters
    }

    /**
     * Creature store mutations
     * @returns {BFStoreMutations}
     */
    get mutations () {
        return this._store.mutations
    }

    get id () {
        return this._id
    }

    set id (value) {
        this._id = value
    }

    get dice () {
        return this._dice
    }
}

module.exports = Creature