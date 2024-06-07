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
        this._data = {} // custom combat state
    }

    get data () {
        return this._data
    }

    get attackerActions () {
        return this
            ._attacker
            .creature
            .getters
            .getActions
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
            }
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

    checkCurrentActionCooldown () {
        if (this._attacker.nextAction && this._attacker.isActionCoolingDown(this._attacker.nextAction, this._turn)) {
            throw new Error('check action error : cooling down')
        }
    }

    advance () {
        if (this._tick === 0) {
            this.selectMostSuitableAction()
            this.checkCurrentActionCooldown()
            // Start of turn
            // attack-types planning
            this.prepareTurn(this._attacker)
            if (this._tick !== 0) throw 'WTF'
            this._events.emit('combat.turn', {
                turn: this._turn,
                tick: this._tick,
                attacker: this._attacker.creature,
                combat: this,
                action: action => {
                    let oDecidedAction = null
                    if (typeof action === 'string') {
                        const oCreatureActions = this.attackerActions
                        if (action in oCreatureActions) {
                            oDecidedAction = oCreatureActions[action]
                        } else {
                            throw new Error('unknown action : ' + action)
                        }
                    } else {
                        oDecidedAction = action
                        // this._attacker.nextAction = action
                    }
                    if (this._attacker.isActionCoolingDown(this._attacker.nextAction, this._turn)) {
                        // nope : selected action is cooling down
                        return
                    }
                    this._attacker.nextAction = oDecidedAction
                }
            })
        }
        this.playFighterAction(this._attacker, this._defender)
        this._events.emit('combat.tick.end', {
            turn: this._turn,
            tick: this._tick,
            attacker: this._attacker.creature,
            target: this._defender,
            distance: this._distance
        })
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

    _isTargetInActionRange (action) {
        if (!action) {
            return false
        }
        let nDistance = this._distance
        switch (action.attackType) {
            case CONSTS.ATTACK_TYPE_MELEE_TOUCH:
            case CONSTS.ATTACK_TYPE_MELEE:
            case CONSTS.ATTACK_TYPE_MULTI_MELEE: {
                return nDistance <= WEAPON_RANGE_MELEE
            }

            default: {
                return true
            }
        }
    }

    /**
     * Returns true if target is in attacker's weapon range
     */
    get targetInWeaponRange () {
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
        const oTargetInRange = this.targetInWeaponRange
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
        // by default, all creature use their weapon, if they have any
        // if we want to use special abilities, we must define ai-script

        // are there any usable weapons ?
        const sBestWeaponSlot = this.getMostSuitableOffensiveSlot()
        if (sBestWeaponSlot) {
            // We should use our weapon
            // One of our offensive slots is suitable for attacking target
            this._switchOffensiveSlot(sBestWeaponSlot)
            return this.defaultActionWeapon
        }
        // We don't have suitable weapon at this point
        // target cannot be attacked by one of our equipped weapons
        // are there any natural attacks ?
        const bTargetIsFar = this.distance > WEAPON_RANGE_MELEE
        const oCreatureActionRegistry = this.attackerActions
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
            return oCreatureActionRegistry[aActions[iAction]]
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
        return this.defaultActionUnarmed
    }

    /**
     * Will use the most suitable action
     */
    selectMostSuitableAction () {
        const oDecidedAction = this.getMostSuitableAction()
        if (oDecidedAction) {
            this._attacker.nextAction = oDecidedAction
            this.checkCurrentActionCooldown()
        } else {
            this._attacker.nextAction = null
        }
    }

    get defaultActionUnarmed () {
        return DATA['default-actions'].DEFAULT_ACTION_UNARMED
    }

    get defaultActionWeapon () {
        return DATA['default-actions'].DEFAULT_ACTION_WEAPON
    }

    get nextActionName () {
        return this._attacker.nextAction === null
            ? ''
            : this._attacker.nextAction.name
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
        const newDistance = Math.max(WEAPON_RANGE_MELEE, this.distance - nRunSpeed)
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

    /**
     * Returns an object associating actions with cooldown turn
     * @returns {*}
     */
    getActionCooldownRegistry () {
        return this._attacker.getActionCooldownRegistry(this._turn)
    }
}

module.exports = Combat
