/**
 * @class
 */
class CombatAction {
    constructor ({ name = '', attackType, count = 1, conveys = [], damage = 0, damageType = 'DAMAGE_TYPE_PHYSICAL' }) {
        this._name = name
        this._count = count
        this._attackType = attackType
        this._conveys = conveys
        this._damage = damage
        this._damageType = damageType
    }

    /**
     * @returns {string}
     */
    get name () {
        return this._name
    }

    /**
     * @returns {number}
     */
    get count () {
        return this._count
    }

    /**
     * @returns {string}
     */
    get attackType () {
        return this._attackType
    }

    /**
     * @returns {{script: string, data: Object<string, string|number|any>}[]}
     */
    get conveys () {
        return this._conveys
    }

    /**
     * @returns {number|string}
     */
    get damage () {
        return this._damage
    }

    get damageType () {
        return this._damageType
    }
}

module.exports = CombatAction