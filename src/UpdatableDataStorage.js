class UpdatableDataStorage {
    constructor (data = {}) {
        this._data = {}
        this.assign(data)
    }

    assign (data) {
        this._data = Object.assign(data)
    }

    get data () {
        return this._data
    }
}

module.exports = UpdatableDataStorage
