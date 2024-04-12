class Builder {
    constructor () {
        this._blueprints = null
        this._data = null
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }
    get blueprints() {
        return this._blueprints;
    }

    set blueprints(value) {
        this._blueprints = value;
    }

    getBlueprintData (blueprint = null, data = null) {
        if (!data && !this._data) {
            throw new Error('data is undefined')
        }
        data = data || this._data
        if (!blueprint) {
            throw new ReferenceError('blueprint missing reference')
        }
        if (typeof blueprint === 'string') {
            if (!this._blueprints) {
                throw new Error('blueprints are undefined')
            }
            if (blueprint in this._blueprints) {
                return {
                    blueprint: this._blueprints[blueprint],
                    data
                }
            } else {
                throw new Error('blueprint "' + blueprint + '" not found in collection')
            }
        } else {
            return {
                blueprint,
                data
            }
        }
    }
}

module.exports = Builder