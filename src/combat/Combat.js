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
        this._distance = Math.max(0, value)
        this._events.emit('combat.distance', {
            attacker: this._attacker.creature,
            target: this._defender,
            distance: this._distance
        })
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
            action.conveys.forEach(convey => {
                this._events.emit('combat.action', {
                    turn: this._turn,
                    tick: this._tick,
                    attacker: attacker.creature,
                    target: defender,
                    action: action.name,
                    script: convey.script,
                    amp: action.amp,
                    data: convey.data,
                    count: nAttackCount
                })
            })
        }
    }

    advance () {
        if (this._tick === 0) {
            // Start of turn
            // attack-types planning
            this._events.emit('combat.turn', {
                turn: this._turn,
                attacker: this._attacker.creature,
                action: oAction => {
                    this._attacker.nextAction = oAction
                },
                target: this._defender,
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
     * @returns {CombatAction}
     */
    getMostSuitableAction () {
        const atkr = this._attacker.creature
        // are there any usable weapons ?
        const msw = this.getMostSuitableOffensiveSlot()
        if (msw) {
            // One of out offensive slot is suitable for attacking target
            atkr.mutations.setOffensiveSlot({ slot: msw })
            return DATA['default-actions'].DEFAULT_ACTION_WEAPON
        }
        // target cannot be attacked by one of our equipped weapons
        // are there any natural attacks ?
        const bTargetIsFar = this.distance > WEAPON_RANGE_MELEE
        const aActions = bTargetIsFar
            ? atkr.getters.getRangedActions
            : atkr.getters.getMeleeActions
        if (aActions.length > 0) {
            const iAction = atkr.dice.roll(aActions.length) - 1
            return aActions[iAction]
        }
        // Fallback actions
        // target must be close
        if (bTargetIsFar) {
            // target is too far
            return null
        }
        const oRangedWeapon = atkr.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_WEAPON_RANGED]
        return !!oRangedWeapon
            ? DATA['default-actions'].DEFAULT_ACTION_IMPROVISED
            : DATA['default-actions'].DEFAULT_ACTION_UNARMED
    }
}

module.exports = Combat
