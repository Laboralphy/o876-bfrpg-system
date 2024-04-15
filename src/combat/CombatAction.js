/**
 * @class
 */
class CombatAction {
    constructor ({ name = '', attackType, count = 1, conveys = [], damage = 0 }) {
        this._name = name
        this._count = count
        this._attackType = attackType
        this._conveys = conveys
        this._damage = damage
    }

    get name () {
        return this._name
    }

    get count () {
        return this._count
    }

    get attackType () {
        return this._attackType
    }

    get conveys () {
        return this._conveys
    }

    get damage () {
        return this._damage
    }
}

module.exports = CombatAction