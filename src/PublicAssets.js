const CONSTS = require('./consts')
const { deepClone } = require('@laboralphy/object-fusion')

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
        return sString.substring(sStart.length).toLowerCase().replace(/_/g, ' ')
    }

    _cv (aArray, sStart) {
        if (!Array.isArray(aArray)) {
            throw new TypeError('this function need an array')
        }
        return Object.fromEntries(aArray
            .filter(s => s.startsWith(sStart))
            .map(s => [s, this._cv1(s, sStart)])
        )
    }

    publicAssets (sLang) {
        const _filterData = (f, m = x => x) => {
            const o = {}
            Object
                .entries(this._rm.data.data)
                .filter(([k]) => k.startsWith(f))
                .forEach(([k, v]) => {
                    o[k] = deepClone(m(v))
                })
            return o
        }
        const data = {
            weaponType: this._rm.data.data['weapon-types'],
            armorType: this._rm.data.data['armor-types'],
            shieldType: this._rm.data.data['shield-types'],
            ammoType: this._rm.data.data['ammo-types'],
            material: this._rm.data.data['material'],
            itemProperty: require('./public-assets/templates/item-properties.json')
        }
        return {
            Ammo: require('./public-assets/templates/ammo.json'),
            Armor: require('./public-assets/templates/armor.json'),
            Shield: require('./public-assets/templates/shield.json'),
            Weapon: require('./public-assets/templates/weapon.json'),
            Creature: require('public-assets/templates/creature.json'),
            Action: require('public-assets/templates/action.json'),
            Convey: require('public-assets/templates/convey.json'),
            Material: this._cv(Object.values(CONSTS), 'MATERIAL_'),
            WeaponType: this._cv(Object.keys(this._rm.data.data['weapon-types']), 'WEAPON_TYPE_'),
            ArmorType: this._cv(Object.keys(this._rm.data.data['armor-types']), 'ARMOR_TYPE_'),
            AmmoType: this._cv(Object.keys(this._rm.data.data['ammo-types']), 'AMMO_TYPE_'),
            ShieldType: this._cv(Object.keys(this._rm.data.data['shield-types']), 'SHIELD_TYPE_'),
            Ability: this._cv(Object.values(CONSTS), 'ABILITY_'),
            AttackType: this._cv(Object.values(CONSTS), 'ATTACK_TYPE_'),
            DamageType: this._cv(Object.values(CONSTS), 'DAMAGE_TYPE_'),
            ImmunityType: this._cv(Object.values(CONSTS), 'IMMUNITY_TYPE_'),
            ItemProperties: require('./public-assets/templates/item-properties.json'),
            SavingThrow: this._cv(Object.values(CONSTS), 'SAVING_THROW_'),
            ClassType: this._cv(Object.values(CONSTS), 'CLASS_TYPE_'),
            Specie: this._cv(Object.values(CONSTS), 'SPECIE_'),
            Race: this._cv(Object.values(CONSTS), 'RACE_'),
        }
    }

}

module.exports = PublicAssets
