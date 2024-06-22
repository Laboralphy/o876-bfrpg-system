const CONSTS = require('./consts')

class PublicAssets {
    constructor () {
        this._rm = null
    }

    get resourceManager () {
        return this._rm
    }

    set resourceManager (value) {
        this._rm = value
    }

    get data () {
        const aConsts = Object.values(CONSTS)
        return {
            classTypes: aConsts.filter(s => s.startsWith('CLASS_TYPE_')),
            attackTypes: aConsts.filter(s => s.startsWith('ATTACK_TYPE_')),
            damageTypes: aConsts.filter(s => s.startsWith('DAMAGE_TYPE_')),
            properties: aConsts.filter(s => s.startsWith('ITEM_PROPERTY_')),
            species: aConsts.filter(s => s.startsWith('SPECIE_')),
            race: aConsts.filter(s => s.startsWith('RACE_'))
        }
    }
}

module.exports = PublicAssets
