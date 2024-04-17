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
}

module.exports = CombatFighterState
