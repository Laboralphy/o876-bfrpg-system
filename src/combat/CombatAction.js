/**
 * @class
 */
class CombatAction {
    constructor ({ name = '', count = 1, scripts = '', amp = 0 }) {
        this._name = name
        this._count = count
        this._scripts = scripts
        this._amp = amp
    }

    get name () {
        return this._name
    }

    get count () {
        return this._count
    }

    get scripts () {
        return this._scripts
    }

    get amp () {
        return this._amp
    }
}

module.exports = CombatAction