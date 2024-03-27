const jsonschema = require('jsonschema')
const Validator = jsonschema.Validator
const TreeAsync = require('./libs/o876-xtree/async')
const path = require('path')

class SchemaValidator {
    constructor () {
        this._schemas = {}
        this._validator = null
        this._schemaLocation = path.resolve(__dirname, './schemas')
    }

    set schemaLocation (value) {
        this._schemaLocation = value
    }

    get schemaLocation () {
        return this._schemaLocation
    }

    get validator () {
        return this._validator
    }

    get schemas () {
        return this._schemas
    }

    async init () {
        const v = new Validator()
        const s = await TreeAsync.recursiveRequire(this._schemaLocation, true)
        this._validator = v
        /**
         * @type {object}
         * @private
         */
        this._schemas = s
        for (const [sId, oData] of Object.entries(s)) {
            const sSchemaId = sId
            oData.id = sSchemaId
            v.addSchema(oData, '/' + sSchemaId)
        }
    }

    validate (oObject, sSchemaId) {
        if (!(sSchemaId in this._schemas)) {
            throw new Error('ERR_UNKNOWN_SCHEMA: ' + sSchemaId)
        }
        const r = this._validator.validate(oObject, this._schemas[sSchemaId])
        if (!r.valid) {
            const sErrors = r
                .errors
                .map(e => e.stack)
                .join('\n')
            throw new Error('ERR_SCHEMA_VALIDATION: ' + sSchemaId + '\n' + sErrors)
        }
        return true
    }
}

module.exports = SchemaValidator
