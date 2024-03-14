const CONSTS = require('./consts')
const DATA = require('./data')

const { v4: uuidv4 } = require('uuid')

const { buildStore } = require('./store')
const EffectProcessor = require("./EffectProcessor");


class Creature {
    constructor () {
        this._id = uuidv4({}, null, 0),
        this._name = this._id
        this._store = buildStore()
        this._effectProcessor = new EffectProcessor()
    }

    get id () {
        return this._id
    }

    set id (value) {
        this._id = value
    }

    /**
     * @returns {Reactor}
     */
    get store () {
        return this._store
    }

    get effectProcessor () {
        return this._effectProcessor
    }
}

module.exports = Creature