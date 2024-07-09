const Combat = require('./Combat')
const Events = require('events')
const CONSTS = require('../consts')

class CombatManager {
    constructor () {
        this._fighters = {}
        this._events = new Events()
        this._defaultDistance = 0
        this._defaultTickCount = 6
        this._rm = null
    }

    set resourceManager (value) {
        this._rm = value
    }

    get resourceManager () {
        return this._rm
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


    /**
     * Adds this instance to given object. Returns a new version of object with this instance insert in property 'combatManager'
     * @param oObject {*}
     * @returns {*&{combatManager: CombatManager}}
     * @private
     */
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
        combat.resourceManager = this.resourceManager
        combat.tickCount = this._defaultTickCount
        combat.events.on('combat.turn', ev => this._events.emit('combat.turn', this._addManagerToObject(ev)))
        combat.events.on('combat.tick.end', ev => this._events.emit('combat.tick.end', this._addManagerToObject(ev)))
        combat.events.on('combat.action', ev => this._sendCombatActionEvent(ev))
        combat.events.on('combat.script', ev => this._events.emit('combat.script', this._addManagerToObject(ev)))
        combat.events.on('combat.offensive-slot', ev => this._events.emit('combat.offensive-slot', this._addManagerToObject(ev)))
        combat.events.on('combat.distance', ev => {
            const { attacker, target, distance } = ev
            this._events.emit('combat.distance', this._addManagerToObject(ev))
            if (this.isCreatureFighting(attacker, target)) {
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

    /**
     * sends a combat action event.
     * if action is a multi melee attack, change target to match one of the offender (random)
     * this is because multi melee action have no default target
     * @param ev
     * @private
     */
    _sendCombatActionEvent (ev) {
        // Special case concerning multi melee actions :
        // Instead of striking target we strike a random offending target
        if (ev.action.attackType === CONSTS.ATTACK_TYPE_MULTI_MELEE) {
            const aOffenders = this.getOffenders(ev.attacker, this._rm.data.data['weapon-ranges'].WEAPON_RANGE_MELEE)
            if (aOffenders.length > 0) {
                const nChoice = Math.floor(ev.attacker.dice.random() * aOffenders.length)
                ev.target = aOffenders[nChoice]
            }
            // If attacker is not attacked back, there is no offender
        }
        this._events.emit('combat.action', this._addManagerToObject(ev))
    }

    /**
     * Processing all registered combats
     */
    processCombats () {
        this.combats
            .forEach(combat => {
                const oAttacker = combat.attacker.creature
                if (oAttacker.getters.isDead || combat.defender.getters.isDead) {
                    this.endCombat(oAttacker, true)
                } else {
                    combat.advance()
                }
            })
    }

    /**
     * Return true if Creature is involved in a combat (optionnaly with a specific target creature)
     * @param oCreature {Creature}
     * @param oTarget {Creature}
     * @returns {boolean}
     */
    isCreatureFighting (oCreature, oTarget = null) {
        return oTarget
            ? this.isCreatureFighting(oCreature) && this._fighters[oCreature.id].defender === oTarget
            : oCreature.id in this._fighters
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
     * All combats involved are to be ended.
     * Call this method when a creature is leaving the game or combat.
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

    /**
     * Will end combat where creature is involved.
     * Call this when you want to technically stop a combat, but all involved creature remain registered
     * @param oCreature {Creature}
     * @param bBothSides {boolean} if true and if this is a one-to-one combat : ends both combats
     */
    endCombat (oCreature, bBothSides = false) {
        if (this.isCreatureFighting(oCreature)) {
            const oCombat = this._fighters[oCreature.id]
            const oDefender = oCombat.defender
            oCombat.events.removeAllListeners()
            this._events.emit('combat.end', this._addManagerToObject({
                ...oCombat.defaultPayload,
            }))
            delete this._fighters[oCreature.id]
            if (bBothSides && this.isCreatureFighting(oDefender, oCreature)) {
                this.endCombat(oDefender)
            }
        }
    }

    /**
     * starts a new combat with creature.
     * if creature already in combat : switch to new combat, discard old combat
     * @param oCreature {Creature}
     * @param oTarget {Creature}
     * @return {Combat}
     */
    startCombat (oCreature, oTarget) {
        if (this.isCreatureFighting(oCreature, oTarget)) {
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
