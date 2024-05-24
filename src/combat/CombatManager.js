const Combat = require('./Combat')
const Events = require('events')
const CONSTS = require('../consts')
const DATA = require('../data')

class CombatManager {
    constructor () {
        this._fighters = {}
        this._events = new Events()
        this._defaultDistance = 0
        this._defaultTickCount = 6
    }

    get events () {
        return this._events
    }

    get combats () {
        return Object.values(this._fighters)
    }

    set defaultDistance (value) {
        this._defaultDistance = value
    }

    get defaultDistance () {
        return this._defaultDistance
    }

    set defaultTickCount (value) {
        this._defaultTickCount = value
    }

    get defaultTickCount () {
        return this._defaultTickCount
    }

    processCombats () {
        this.combats
            .forEach(combat => {
                const oAttacker = combat.attacker.creature
                if (oAttacker.getters.isDead || combat.defender.isDead) {
                    this.endCombat(oAttacker, true)
                } else {
                    combat.advance()
                }
            })
    }

    isCreatureFighting (oCreature) {
        return oCreature.id in this._fighters
    }

    /**
     * Will end combat where creature is involved.
     * @param oCreature {Creature}
     * @param bBothSides {boolean} if true and if this is a one-to-one combat : ends both combats
     */
    endCombat (oCreature, bBothSides = false) {
        if (this.isCreatureFighting(oCreature)) {
            const oCombat = this._fighters[oCreature.id]
            const oDefender = oCombat.defender
            oCombat.events.removeAllListeners()
            this._events.emit('combat.end', {
                attacker: oCombat.attacker.creature,
                target: oCombat.defender,
                combatManager: this
            })
            delete this._fighters[oCreature.id]
            if (bBothSides && this.isCreatureFightingWithTarget(oDefender, oCreature)) {
                this.endCombat(oDefender)
            }
        }
    }

    /**
     * Returns all creature attacking specified creature
     * @param oCreature {Creature}
     * @param nRange {number} maximum range
     * @return {Creature[]}
     */
    getOffenders (oCreature, nRange = Infinity) {
        return this.combats
            .filter(combat => combat.defender === oCreature && combat.distance <= nRange)
            .map(combat => combat.attacker.creature)
    }

    /**
     * This creature is being removed from the game
     * All combats involved are to be ended
     * @param oCreature {Creature}
     */
    removeFighter (oCreature) {
        this
            .getOffenders(oCreature)
            .forEach(creature => {
                this.endCombat(creature, true)
            })
        this.endCombat(oCreature)
    }

    _addManagerToObject (oObject) {
        return {
            ...oObject,
            combatManager: this
        }
    }

    /**
     * Creates a new combat and plugs events
     * @param oCreature {Creature}
     * @param oTarget {Creature}
     * @returns {Combat}
     * @private
     */
    _createCombat (oCreature, oTarget) {
        const combat = new Combat()
        combat.tickCount = this._defaultTickCount
        combat.events.on('combat.turn', ev => this._events.emit('combat.turn', this._addManagerToObject(ev)))
        combat.events.on('combat.action', ev => this._sendCombatActionEvent(ev))
        combat.events.on('combat.script', ev => this._events.emit('combat.script', this._addManagerToObject(ev)))
        combat.events.on('combat.offensive-slot', ev => this._events.emit('combat.offensive-slot', this._addManagerToObject(ev)))
        combat.events.on('combat.distance', ev => {
            const { attacker, target, distance } = ev
            this._events.emit('combat.distance', this._addManagerToObject(ev))
            if (this.isCreatureFightingWithTarget(attacker, target)) {
                // also change target distance with attacker if different
                const oTargetCombat = this.getCombat(oTarget)
                if (oTargetCombat && oTargetCombat.distance !== distance) {
                    oTargetCombat.distance = distance
                }
            }
        })
        combat.events.on('combat.move', ev => this._events.emit('combat.move', this._addManagerToObject(ev)))
        combat.setFighters(oCreature, oTarget)
        combat.distance = this._defaultDistance
        return combat
    }

    _sendCombatActionEvent (ev) {
        // Special case concerning multi melee actions :
        // Instead of striking target we strike a random offending target
        if (ev.action.attackType === CONSTS.ATTACK_TYPE_MULTI_MELEE) {
            const aOffenders = this.getOffenders(ev.attacker, DATA['weapon-ranges'].WEAPON_RANGE_MELEE)
            if (aOffenders.length > 0) {
                const nChoice = Math.floor(ev.attacker.dice.random() * aOffenders.length)
                ev.target = aOffenders[nChoice]
            }
            // If attacker is not attacked back, there is no offender
        }
        this._events.emit('combat.action', this._addManagerToObject(ev))
    }

    isCreatureFightingWithTarget (oCreature, oTarget) {
        return this.isCreatureFighting(oCreature) && this._fighters[oCreature.id].defender === oTarget
    }

    /**
     * starts a new combat with creature.
     * if creature already in combat : switch to new combat, discard old combat
     * @param oCreature {Creature}
     * @param oTarget {Creature}
     * @return {Combat}
     */
    startCombat (oCreature, oTarget) {
        if (this.isCreatureFightingWithTarget(oCreature, oTarget)) {
            // creature is already in fight with target
            return this._fighters[oCreature.id]
        }
        this.endCombat(oCreature)
        this._fighters[oCreature.id] = this._createCombat(oCreature, oTarget)
        if (!this.isCreatureFighting(oTarget)) {
            this._fighters[oTarget.id] = this._createCombat(oTarget, oCreature)
        }
        return this._fighters[oCreature.id]
    }

    getCombat (oCreature) {
        if (this.isCreatureFighting(oCreature)) {
            return this._fighters[oCreature.id]
        } else {
            return null
        }
    }
}

module.exports = CombatManager
