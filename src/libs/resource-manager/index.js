class ResourceManager {
    constructor () {
        this._data = {}
    }

    defineResourceClass (sClass) {
        if (!this._data[sClass]) {
            this._data[sClass] = {}
        }
        return this._data[sClass]
    }

    assign (sClass, data) {
        const sClassType = typeof sClass
        if (sClassType !== 'string') {
            throw new TypeError('resource class should be string ; ' + sClassType + ' given.')
        }
        this._data[sClass] = Object.assign(this.defineResourceClass(sClass), data)
    }

    get data () {
        return this._data
    }
}

module.exports = ResourceManager