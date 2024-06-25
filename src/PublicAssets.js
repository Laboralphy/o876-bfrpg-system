const CONSTS = require('./consts')
const { deepClone } = require('@laboralphy/object-fusion')
const { processScripts } = require('./libs/generate-script-description')
const path = require('node:path')

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

    publicAssets () {
        return {
            Ammo: require('./public-assets/refs/ammo.json'),
            Armor: require('./public-assets/refs/armor.json'),
            Shield: require('./public-assets/refs/shield.json'),
            Weapon: require('./public-assets/refs/weapon.json'),
            Creature: require('./public-assets/refs/creature.json'),
            Action: require('./public-assets/refs/action.json'),
            Convey: require('./public-assets/refs/convey.json'),
            Material: this._cv(Object.values(CONSTS), 'MATERIAL_'),
            WeaponType: this._cv(Object.keys(this._rm.data.data['weapon-types']), 'WEAPON_TYPE_'),
            ArmorType: this._cv(Object.keys(this._rm.data.data['armor-types']), 'ARMOR_TYPE_'),
            AmmoType: this._cv(Object.keys(this._rm.data.data['ammo-types']), 'AMMO_TYPE_'),
            ShieldType: this._cv(Object.keys(this._rm.data.data['shield-types']), 'SHIELD_TYPE_'),
            Ability: this._cv(Object.values(CONSTS), 'ABILITY_'),
            AttackType: this._cv(Object.values(CONSTS), 'ATTACK_TYPE_'),
            DamageType: this._cv(Object.values(CONSTS), 'DAMAGE_TYPE_'),
            ImmunityType: this._cv(Object.values(CONSTS), 'IMMUNITY_TYPE_'),
            ItemProperties: Object.fromEntries(Object
                .entries(require('./public-assets/refs/item-properties.json'))
                .map(([sItemProperty, oItemProperty]) => [sItemProperty, {
                    description: this._cv1(sItemProperty, 'ITEM_PROPERTY_'),
                    parameters: oItemProperty
                }])),
            SavingThrow: this._cv(Object.values(CONSTS), 'SAVING_THROW_'),
            ClassType: this._cv(Object.values(CONSTS), 'CLASS_TYPE_'),
            Specie: this._cv(Object.values(CONSTS), 'SPECIE_'),
            Race: this._cv(Object.values(CONSTS), 'RACE_'),
            Conveys: processScripts(
                path.resolve(__dirname, 'scripts'),
                path.resolve(__dirname, 'modules'),
            )
        }
    }
}

module.exports = PublicAssets