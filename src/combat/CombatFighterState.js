const { checkCombatActionSchema } = require('../libs/check-combat-action-schema')
const {shallowMap} = require("@laboralphy/object-fusion");

class CombatFighterState {
    constructor () {
        /**
         * @type {number[]}
         * @private
         */
        this._plan = [0]
        /**
         * @type {Creature}
         * @private
         */
        this._creature = null
        this._currentAction = null
        this._actionCooldown = {}
    }

    /**
     * @param value {Creature}
     */
    set creature (value) {
        this._creature = value
    }

    /**
     * @returns {Creature}
     */
    get creature () {
        return this._creature
    }

    /**
     * @param value {number[]}
     */
    set plan (value) {
        this._plan = value
    }

    /**
     * @return value {number[]}
     */
    get plan () {
        return this._plan
    }

    /**
     * @param tick
     * @returns {number}
     */
    getAttackCount (tick) {
        return this._plan[tick % this._plan.length]
    }

    /**
     *
     * @param value {BFStoreStateAction}
     */
    set nextAction (value) {
        if (value) {
            checkCombatActionSchema(value)
        }
        this._currentAction = value
    }

    /**
     * @returns {null|BFStoreStateAction}
     */
    get nextAction () {
        return this._currentAction
    }

    setActionCooldown (oAction, nTurn) {
        const { name: sAction } = oAction
        if (this.isActionCoolingDown(oAction, nTurn)) {
            throw new Error('Action unavailable : cooling down : ' + sAction + ' turn ' + nTurn)
        }
        const acd = this._actionCooldown
        acd[sAction] = nTurn
    }

    isActionCoolingDown (oAction, nTurn) {
        const { name: sAction, cooldown: nCooldown } = oAction
        if (nCooldown === 0) {
            return false
        }
        const acd = this._actionCooldown
        if (!(sAction in acd)) {
            return false
        } else {
            return acd[sAction] !== nTurn && (acd[sAction] + nCooldown) > nTurn
        }
    }

    getActionCooldown (oAction, nTurn) {
        const { name: sAction, cooldown: nCooldown } = oAction
        const acd = this._actionCooldown
        if (sAction in acd) {
            return Math.max(0, nCooldown - nTurn + acd[sAction])
        } else {
            return 0
        }
    }

    getActionCooldownRegistry (nTurn) {
        const oActions = this._creature.getters.getActions
        return shallowMap(oActions, action => this.getActionCooldown(action, nTurn))
    }
}

module.exports = CombatFighterState
