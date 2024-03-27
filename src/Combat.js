const Events = require('events')

class Combat {
    constructor () {
        this._attacker = null
        this._defender = null
        this._isNew = true
        this._turn = 0
        this._turnTick = 0
        this._turnTickCount = 6
        this._reverseTurnAttackOrder = false // Place les attaques en fin de round afin de coller à l'affichage du status de tour
        this._events = new Events()
    }

    get events () {
        return this._events
    }

    set reverseTurnAttackOrder (value) {
        this._reverseTurnAttackOrder = value
    }

    get reverseTurnAttackOrder () {
        return this._reverseTurnAttackOrder
    }

    static computePlanning (nAttackPerTurn, nTurnTickCount, reverseOrder = false) {
        const aPlan = new Array(nTurnTickCount)
        aPlan.fill(0)
        for (let i = 0; i < nAttackPerTurn; ++i) {
            const iRank = Math.floor(aPlan.length * i / nAttackPerTurn)
            const nIndex = reverseOrder
                ? nTurnTickCount - 1 - iRank
                : iRank
            ++aPlan[nIndex]
        }
        return aPlan
    }

    /**
     *
     * @param cf {CombatFighter}
     */
    updateTurnAttackCount (cf) {

        cf.attackPlanning = Combat.computePlanning()
    }

    playAttack () {

    }

    play () {
        let tick = this._turnTick
        let turn = this._turn
        const bStartTick = tick === 0
        ++tick
        const ttc = this._turnTickCount
        while (tick > ttc) {
            tick -= ttc
            ++turn
        }
        this._turn = turn
        this._turnTick = tick
    }
}

module.exports = Combat
