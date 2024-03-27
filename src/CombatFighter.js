class CombatFighter {
    constructor () {
        this._plan = []
        /**
         * @type {Creature}
         * @private
         */
        this._creature = null
        this._turnAttackCount = 0
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
    set attackPlanning (value) {
        this._plan = value
    }

    /**
     * @returns {number[]}
     */
    get attackPlanning () {
        return this._plan
    }

    /**
     * get the number of attack at the specified tick
     * @param tick {number}
     * @returns {number}
     */
    getTickAttackCount (tick) {
        return this._plan[tick]
    }

    /**
     * Return the number of attack per turn
     */
    get creatureAttackCount () {

    }
}

module.exports = CombatFighter
