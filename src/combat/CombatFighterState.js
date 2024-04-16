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
