class CombatAction {
    constructor ({ name = '', count = 1, script = '', data = {}, amp = 0 }) {
        this._name = name
        this._count = count
        this._script = script
        this._data = data
        this._amp = amp
    }

    get name () {
        return this._name
    }

    get count () {
        return this._count
    }

    get script () {
        return this._script
    }

    get data () {
        return this._data
    }

    get amp () {
        return this._amp
    }
}

module.exports = CombatAction