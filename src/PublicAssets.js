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

    _cv1 (sString, sStart) {
        return sString.substring(sStart.length + 1).toLowerCase().replace(/_/g, ' ')
    }

    _cv (aArray, sStart) {
        if (!Array.isArray(aArray)) {
            throw new TypeError('this function need an array')
        }
        return Object.fromEntries(aArray
            .filter(s => s.startsWith(sStart))
            .map(s => [s, this._cv1(s)])
        )
    }

    _filterData (f, m = x => x) {
        const o = {}
        Object
            .entries(this.data)
            .filter(([k]) => k.startsWith(f))
            .forEach(([k, v]) => {
                o[k] = deepClone(m(v))
            })
        return o
    }

    get data () {
        if (!this._rm) {
            throw new Error('resource manager not defined')
        }
        const DATA = this._rm.data.data
        const aConsts = Object.values(CONSTS)
        const races = Object
            .entries(DATA.races)
            .reduce((prev, [sRace, { specie }]) => {
                if (specie in prev) {
                    prev[specie][sRace] = this._cv1(sRace)
                } else {
                    prev[specie] = { [sRace]: this._cv1(sRace) }
                }
                return prev
            }, {})
        return {
            abilities: this._cv(aConsts, 'ABILITY_'),
            classTypes: this._cv(aConsts, 'CLASS_TYPE_'),
            attackTypes: this._cv(aConsts, 'ATTACK_TYPE_'),
            damageTypes: this._cv(aConsts, 'DAMAGE_TYPE_'),
            properties: this._cv(aConsts, 'ITEM_PROPERTIES_'),
            species: this._cv(aConsts, 'SPECIE_'),
            races
        }
    }

    get publicAssets () {
        /**
         *
         * @param f
         * @param m {function}
         * @returns {{}}
         */
        const filterData = (f, m = x => x) => {
            const o = {}
            Object
                .entries(this.data)
                .filter(([k]) => k.startsWith(f))
                .forEach(([k, v]) => {
                    o[k] = m(v)
                })
            return o
        }
        const data = {
            weaponType: filterData('weapon-type-'),
            armorType: filterData('armor-type-'),
            shieldType: filterData('shield-type-'),
            ammoType: filterData('ammo-type-'),
            itemProperty: require('./templates/item-properties.json')
        }
        return {
            strings: this.strings,
            data,
            templates: {
                ammo: require('./templates/ammo.json'),
                armor: require('./templates/armor.json'),
                shield: require('./templates/shield.json'),
                weapon: require('./templates/weapon.json'),
            }
        }
    }

}

module.exports = PublicAssets
