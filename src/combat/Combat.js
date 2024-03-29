const Events = require('events')
const CombatFighterState = require('./CombatFighterState')

class Combat {
    constructor () {
        this._attacker = null
        this._defender = null
        this._bAttackerTurn = true
        this._turn = 0
        this._tick = 0
        this._tickCount = 6
        this._events = new Events()
    }

    get events () {
        return this._events
    }

    get attacker () {
        return this._attacker
    }

    get defender () {
        return this._defender
    }

    setFighters (attacker, defender) {
        // TODO compute initiaive here
        this._attacker = new CombatFighterState()
        this._attacker.creature = attacker
        this._defender = new CombatFighterState()
        this._defender.creature = defender
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
     * @param defender {CombatFighterState}
     */
    playFighterAction (attacker, defender) {
        const nAttackCount = attacker.getAttackCount(this._tick)
        if (nAttackCount > 0) {
            const action = attacker.nextAction
            this._events.emit('combat.action', {
                turn: this._turn,
                tick: this._tick,
                attacker: attacker.creature,
                target: defender.creature,
                action: action.name,
                script: action.script,
                amp: action.amp,
                data: action.data,
                count: nAttackCount
            })
        }
    }

    advance () {
        if (this._tick === 0 && this._bAttackerTurn) {
            // Start of turn
            // attack planning
            this._events.emit('combat.turn', {
                turn: this._turn,
                attacker: this._attacker.creature,
                target: this._defender.creature,
            })
            this.prepareTurn(this._attacker)
            this.prepareTurn(this._defender)
        }
        if (this._bAttackerTurn) {
            this.playFighterAction(this._attacker, this._defender)
        } else {
            this.playFighterAction(this._defender, this._attacker)
        }
        this._bAttackerTurn = !this._bAttackerTurn
        if (this._bAttackerTurn) {
            this.nextTick()
        }
    }
}

module.exports = Combat
