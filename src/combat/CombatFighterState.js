const { checkCombatActionSchema } = require('../libs/check-combat-action-schema')

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
        this._nextAction = null
        this._currentAction = null
        this._speedPenalty = 0
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

    get speedPenalty () {
        return this._speedPenalty
    }

    set speedPenalty (value) {
        this._speedPenalty = value
    }

    get speed () {
        return Math.ceil(this.creature.getters.getSpeed * this.speedFactor)
    }

    get speedFactor () {
        const nSpeedPenalty = Math.max(Math.min(4, this.speedPenalty + 1), 1)
        return 1 / nSpeedPenalty
    }

    healSpeedPenalty () {
        this.speedPenalty = 0
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
        checkCombatActionSchema(value)
        this._nextAction = value
    }

    /**
     *
     * @returns {null|BFStoreStateAction}
     */
    get nextAction () {
        if (!this._currentAction) {
            this._currentAction = this._nextAction
        }
        return this._currentAction
    }

    flushCurrentAction () {
        this._currentAction = null
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
        const acd = this._actionCooldown
        if (!(sAction in acd)) {
            return false
        } else {
            return acd[sAction] !== nTurn && (acd[sAction] + nCooldown) > nTurn
        }
    }
}

module.exports = CombatFighterState
