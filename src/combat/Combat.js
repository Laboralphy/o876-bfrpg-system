const Events = require('events')
const CombatFighterState = require('./CombatFighterState')
const CONSTS = require('../consts')
const DATA = require('../data')

const { WEAPON_RANGE_MELEE, WEAPON_RANGE_REACH } = DATA['weapon-ranges']

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

    get turn () {
        return this._turn
    }

    set turn (value) {
        this._turn = value
    }

    get tick () {
        return this._tick
    }

    set tick (value) {
        this._tick = value
    }

    get tickCount () {
        return this._tickCount
    }

    set tickCount (value) {
        this._tickCount = Math.max(1, value)
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
        const nOldDistance = this._distance
        if (nOldDistance !== value) {
            this._distance = Math.max(0, value)
            this._events.emit('combat.distance', {
                turn: this._turn,
                tick: this._tick,
                attacker: this._attacker.creature,
                target: this._defender,
                distance: this._distance,
                previousDistance: nOldDistance
            })
        }
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
        if (nAttackCount === 0) {
            this.approachTarget()
        }
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
            if (action) {
                attacker.setActionCooldown(action, this._turn)
                this._events.emit('combat.action', {
                    turn: this._turn,
                    tick: this._tick,
                    attacker: attacker.creature,
                    target: defender,
                    action: action,
                    count: nAttackCount
                })
            }
        }
    }

    advance () {
        this.selectMostSuitableAction()
        if (this._tick === 0) {
            // Start of turn
            // attack-types planning
            this._events.emit('combat.turn', {
                turn: this._turn,
                tick: this._tick,
                attacker: this._attacker.creature,
                action: oAction => {
                    this._attacker.nextAction = oAction
                },
                target: this._defender,
                distance: this._distance
            })
            this.prepareTurn(this._attacker)
        }
        this.playFighterAction(this._attacker, this._defender)
        this.nextTick()
    }

    _isTargetInWeaponRange (weapon) {
        if (!weapon) {
            return false
        }
        const aWeaponAttributeSet = new Set(weapon.attributes)
        if (aWeaponAttributeSet.has(CONSTS.WEAPON_ATTRIBUTE_RANGED)) {
            return this._distance > WEAPON_RANGE_MELEE
        }
        if (aWeaponAttributeSet.has(CONSTS.WEAPON_ATTRIBUTE_REACH)) {
            return this._distance <= WEAPON_RANGE_REACH
        }
        return this._distance <= WEAPON_RANGE_MELEE
    }

    /**
     * Returns true if target is in attacker's weapon range
     */
    get targetInRange () {
        const cg = this._attacker.creature.getters
        const weapon = cg.getSelectedWeapon
        const meleeWeapon = cg.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE]
        const rangedWeapon = cg.isRangedWeaponLoaded ? cg.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED] : null
        return {
            selected: this._isTargetInWeaponRange(weapon),
            melee: this._isTargetInWeaponRange(meleeWeapon),
            ranged: this._isTargetInWeaponRange(rangedWeapon)
        }
    }

    /**
     * Will set new offensive slot, and will fire an event.
     * Does nothing if offensive slot does not change
     * @param slot {string}
     * @returns {BFItem}
     * @private
     */
    _switchOffensiveSlot (slot) {
        const atkr = this._attacker.creature
        // we should compare new slot, and previous slot
        // no need to unecessarly fire an event
        const sOldSlot = atkr.getters.getOffensiveSlot
        if (sOldSlot !== slot) {
            // new offensive slot is different from previous offensive slot : fire an event
            atkr.mutations.setOffensiveSlot({ slot })
            this._events.emit('combat.offensive-slot', {
                turn: this._turn,
                tick: this._tick,
                slot,
                previousSlot: sOldSlot,
                attacker: atkr,
                target: this._defender,
                weapon: atkr.getters.getSelectedWeapon
            })
        }
        return atkr.getters.getSelectedWeapon
    }


    /**
     * Equip the most suitable weapon according to target distance
     * returns null if target is totally out of range
     * @returns {string}
     */
    getMostSuitableOffensiveSlot () {
        const oTargetInRange = this.targetInRange
        // will try to attack-types with ranged weapon whenever possible
        if (oTargetInRange.ranged) {
            // Ranged weapon is properly loaded, and target is afar : go for ranged
            return CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED
        }
        if (oTargetInRange.melee) {
            // Target is close and melee weapon is available in equipment slot : go for melee
            return CONSTS.EQUIPMENT_SLOT_WEAPON_MELEE
        }
        // none of our weapon may reach target
        return ''
    }


    /**
     *
     * @returns {BFStoreStateAction}
     */
    getMostSuitableAction () {
        const atkr = this._attacker.creature
        // are there any usable weapons ?
        const sBestWeaponSlot = this.getMostSuitableOffensiveSlot()
        if (sBestWeaponSlot) {
            // We should use our weapon
            // One of our offensive slots is suitable for attacking target
            this._switchOffensiveSlot(sBestWeaponSlot)
            return DATA['default-actions'].DEFAULT_ACTION_WEAPON
        }
        // We don't have suitable weapon at this point
        // target cannot be attacked by one of our equipped weapons
        // are there any natural attacks ?
        const bTargetIsFar = this.distance > WEAPON_RANGE_MELEE
        const oCreatureActionRegistry = atkr.getters.getActions
        const turn = this._turn
        const aActions = (bTargetIsFar
            ? atkr.getters.getRangedActions
            : atkr.getters.getMeleeActions)
            .filter(actid => {
                /**
                 * @type BFStoreStateAction
                 */
                const act = oCreatureActionRegistry[actid]
                return !this._attacker.isActionCoolingDown(act, turn)
            })
        if (aActions.length > 0) {
            // We have suitable action(s)
            const iAction = atkr.dice.roll(aActions.length) - 1
            const oSelectedAction = oCreatureActionRegistry[aActions[iAction]]
            if (this._attacker.isActionCoolingDown(oSelectedAction, turn)) {
                throw new Error('Should not be able to choose a cooling down action : ' + oSelectedAction.name)
            }
            return oSelectedAction
        }
        // At this point we have no weapon, and we have no action that can reach target.
        // Fallback actions
        if (bTargetIsFar) {
            // target is too far
            // There is no way to attack
            // must go closer
            return null
        }
        // Target is at melee range, we must use our unarmed attack
        return DATA['default-actions'].DEFAULT_ACTION_UNARMED
    }

    /**
     * Will use the most suitable action
     */
    selectMostSuitableAction () {
        const oDecidedAction = this.getMostSuitableAction()
        if (oDecidedAction) {
            this._attacker.nextAction = oDecidedAction
        } else if (this.attacker.isActionCoolingDown(this.attacker.nextAction)) {
            this._attacker.flushCurrentAction()
        }
    }

    /**
     * If a most suitable offensive slot is available, equip the corresponding weapon
     * else do nothing
     */
    switchToMostSuitableWeapon () {
        const sSuitabgleSlot = this.getMostSuitableOffensiveSlot()
        if (sSuitabgleSlot) {
            this._switchOffensiveSlot(sSuitabgleSlot)
        }
    }

    approachTarget () {
        const nRunSpeed = this._attacker.speed
        const previousDistance = this.distance
        const newDistance = Math.max(DATA['weapon-ranges'].WEAPON_RANGE_MELEE, this.distance - nRunSpeed)
        this._events.emit('combat.move', {
            turn: this._turn,
            tick: this._tick,
            attacker: this._attacker.creature,
            target: this._defender,
            speed: nRunSpeed,
            factor: this._attacker.speedFactor,
            previousDistance,
            distance: newDistance
        })
        this.distance = newDistance
        this._attacker.healSpeedPenalty()
    }
}

module.exports = Combat
