const { getId } = require('./unique-id')
const { buildStore } = require('./store')
const Dice = require('./libs/dice')
const CONSTS = require('./consts')

require('./types.doc')

/**
 * @class Creature
 */
class Creature {

    constructor () {
        this._id = getId()
        this._name = this._id
        this._dice = new Dice()
        this._store = buildStore()
    }

    /**
     * Creature store getters
     * @returns {BFStoreGetters}
     */
    get getters () {
        return this._store.getters
    }

    /**
     * Creature store mutations
     * @returns {BFStoreMutations}
     */
    get mutations () {
        return this._store.mutations
    }

    get id () {
        return this._id
    }

    set id (value) {
        this._id = value
    }

    get dice () {
        return this._dice
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @param value {string}
     */
    set name(value) {
        this._name = value;
    }

    /**
     * @param oDefault
     * @returns {BFAttackOutcome}
     * @private
     */
    _createAttackOutcome (oDefault = {}) {
        return {
            ac: 0, // target armor class
            bonus: 0, // attack bonus
            critical: false, // auto hit
            deflector: '', // part of armor that deflect the attack (critical missed, missed, dodged, equipped armor, natural armor)
            distance: 0, // distance between target and attacker
            hit: false, // target hit by attack
            range: 0, // weapon range
            roll: 0, // attack roll
            attacker: null, // attacking creature
            target: null, // target creature
            weapon: null, // weapon involved in attack
            ammo: null, // ammunition involved in attack
            action: null, // action involved in attack
            kill: false, // the attack killed the target
            failed: true, // could not attack
            failure: CONSTS.ATTACK_FAILURE_DID_NOT_ATTACK, // reason why attack failed (out of range, condition, etc...)
            sneakable: false, // This attack is made from behind, a rogue may have damage bonus
            damages: {
                amount: 0, // amount of damage if attack hit
                resisted: {}, // amount of resisted damage, by damage type
                types: {} // amount of damage by type
            },
            ...oDefault
        }
    }

    /**
     * Attack the target using the specified combatAction
     * @param oAttackOutcome {BFAttackOutcome}
     */
    _attackUsingWeapon (oAttackOutcome) {
        // Determine if attack is melee or ranged
        const weapon = this.getters.getSelectedWeapon
        const ammo = this.getters.isRangedWeaponLoaded
            ? this.getters.getEquipment[CONSTS.EQUIPMENT_SLOT_AMMO]
            : null
        const weaponAttributeSet = new Set(
            weapon ? weapon.attributes : [CONSTS.WEAPON_ATTRIBUTE_FINESSE]
        )
        const bRanged = weaponAttributeSet.has(CONSTS.WEAPON_ATTRIBUTE_RANGED)
        const bFinesse = weaponAttributeSet.has(CONSTS.WEAPON_ATTRIBUTE_FINESSE)
        const nStrength = this.getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH]
        const nDexterity = this.getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY]
        const nOffensiveAbilityModifier = bRanged
            ? nDexterity
            : bFinesse
                ? Math.max(nStrength, nDexterity)
                : nStrength
        const oTarget = oAttackOutcome.target
        const oArmorClass = oTarget.getters.getArmorClass
        oAttackOutcome.ac = bRanged ? oArmorClass.ranged : oArmorClass.melee
        oAttackOutcome.bonus = this.getters.getAttackBonus + nOffensiveAbilityModifier
        oAttackOutcome.weapon = weapon
        oAttackOutcome.ammo = ammo
    }

    /**
     * @param oAttackOutcome {BFAttackOutcome}
     */
    _attackUsingAction (oAttackOutcome) {
        const { amp, conveys, attackType } = oAttackOutcome.action
        const oTarget = oAttackOutcome.target
        const oArmorClass = oTarget.getters.getArmorClass
        oAttackOutcome.bonus = this.getters.getAttackBonus
        switch (attackType) {
            case CONSTS.ATTACK_TYPE_MELEE: {
                oAttackOutcome.ac = oArmorClass.melee
                break
            }

            case CONSTS.ATTACK_TYPE_MELEE_TOUCH: {
                oAttackOutcome.ac = oArmorClass.natural
                break
            }

            case CONSTS.ATTACK_TYPE_RANGED: {
                oAttackOutcome.ac = oArmorClass.ranged
                break
            }

            case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
                oAttackOutcome.ac = oArmorClass.natural
                break
            }
        }
    }

    /**
     * Will roll a die and see if attack hits
     * @param oAttackOutcome {BFAttackOutcome}
     * @returns {BFAttackOutcome}
     */
    resolveAttackHit (oAttackOutcome) {
        const nRoll = this._dice.roll(20)
        oAttackOutcome.roll = nRoll
        oAttackOutcome.critical = nRoll >= this.getters.getAttackRollCriticalValue
        oAttackOutcome.hit = (nRoll <= this.getters.getAttackRollFumbleValue) && (nRoll + oAttackOutcome.bonus >= oAttackOutcome.ac)
        return oAttackOutcome
    }

    /**
     * Use selected action or weapon to attack.
     * Does not check rules :
     * - No range checking
     * - Unloaded ranged weapon can still be used without ammo, missing ammo do not provide bonus
     * Will not select the most appropriate weapon or action prior to attack
     * @param oTarget {Creature}
     * @param action {CombatAction}
     * @returns {BFAttackOutcome}
     */
    attack (oTarget, action) {
        const oAttackOutcome = this._createAttackOutcome({
            attacker: this,
            target: oTarget,
            action: action || this.getters.getSelectedAction
        })
        if (!oAttackOutcome.action) {
            oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_NO_ACTION
            return oAttackOutcome
        }
        const weapon = action.name === CONSTS.DEFAULT_ACTION_WEAPON
            ? this.getters.getSelectedWeapon
            : null
        if (weapon) {
            // We have a weapon
            this._attackUsingWeapon(oAttackOutcome)
        } else if (action) {
            // ... but we have action
            this._attackUsingAction(oAttackOutcome)
        } else {
            // no weapon, no action
            oAttackOutcome.failed = true
            oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_NO_ACTION
        }
        if (!oAttackOutcome.failed) {
            this.resolveAttackHit(oAttackOutcome)
        }
        return oAttackOutcome
    }
}

module.exports = Creature