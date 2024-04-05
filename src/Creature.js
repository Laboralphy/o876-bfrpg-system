const { getId } = require('./unique-id')
const { buildStore } = require('./store')
const Dice = require('./libs/dice')
const CONSTS = require('./consts')

/**
 * @class Creature
 */
class Creature {
    constructor () {
        this._id = getId()
        this._name = this._id
        this._dice = new Dice()
        this._store = buildStore()
    }

    /**
     * Creature store getters
     * @returns {BFStoreGetters}
     */
    get getters () {
        return this._store.getters
    }

    /**
     * Creature store mutations
     * @returns {BFStoreMutations}
     */
    get mutations () {
        return this._store.mutations
    }

    get id () {
        return this._id
    }

    set id (value) {
        this._id = value
    }

    get dice () {
        return this._dice
    }

    /**
     * Attack the target using the specified combatAction
     * @param oTarget {Creature}
     * @param weapon {BFItem|null}
     * @param attackType {string}
     */
    attack (oTarget, {
        attackType = ''
    }) {
        // Détermine if attack is melee or ranged
        let bRanged = false
        switch (attackType) {

            case CONSTS.ATTACK_TYPE_ANY: {
                // use equipped weapon
                bRanged = this.getters.isRangedWeaponLoaded
                break
            }

            case CONSTS.ATTACK_TYPE_RANGED_TOUCH:
            case CONSTS.ATTACK_TYPE_RANGED: {
                // attack is naturally ranged (spit, thrown rock...)
                bRanged = true
                break
            }

        }

    }
}

module.exports = Creature