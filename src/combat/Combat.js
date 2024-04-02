const Events = require('events')
const CombatFighterState = require('./CombatFighterState')

class Combat {
    constructor () {
        this._attacker = null
        this._defender = null
        this._turn = 0
        this._tick = 0
        this._tickCount = 6
        this._events = new Events()
        this._distance = 0
    }

    /**
     * @returns {Events}
     */
    get events () {
        return this._events
    }

    get attacker () {
        return this._attacker
    }

    get defender () {
        return this._defender
    }

    set distance (value) {
        this._distance = value
    }

    get distance () {
        return this._distance
    }

    setFighters (attacker, defender) {
        // TODO compute initiative here
        this._attacker = new CombatFighterState()
        this._attacker.creature = attacker
        this._defender = defender
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

    nextTick () {
        ++this._tick
        const ttc = this._tickCount
        if (this._tick >= ttc) {
            this._tick = 0
            ++this._turn
        }
    }

    /**
     * @param who {CombatFighterState}
     */
    prepareTurn (who) {
        // Plan all attacks this turn
        who.flushCurrentAction()
        const action = who.nextAction
        const nAttackCount = action ? action.count : 0
        who.plan = Combat.computePlanning(nAttackCount, this._tickCount, true)
    }

    /**
     *
     * @param attacker {CombatFighterState}
     * @param defender {Creature}
     */
    playFighterAction (attacker, defender) {
        const nAttackCount = attacker.getAttackCount(this._tick)
        if (nAttackCount > 0) {
            const action = attacker.nextAction
            action.scripts.forEach(script => {
                this._events.emit('combat.action', {
                    turn: this._turn,
                    tick: this._tick,
                    attacker: attacker.creature,
                    target: defender,
                    action: action.name,
                    script: script,
                    amp: action.amp,
                    data: script.data,
                    count: nAttackCount
                })
            })
        }
    }

    advance () {
        if (this._tick === 0) {
            // Start of turn
            // attack planning
            this._events.emit('combat.turn', {
                turn: this._turn,
                attacker: this._attacker.creature,
                target: this._defender,
            })
            this.prepareTurn(this._attacker)
        }
        this.playFighterAction(this._attacker, this._defender)
        this.nextTick()
    }
}

module.exports = Combat
