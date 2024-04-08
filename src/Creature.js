const { getId } = require('./unique-id')
const { buildStore } = require('./store')
const Dice = require('./libs/dice')
const CONSTS = require('./consts')

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
            target: null, // target creature
            weapon: null, // weapon involved in attack
            kill: false, // the attack killed the target
            failed: false, // could not attack
            failure: '', // reason why attack failed (out of range, condition, etc...)
            sneakable: false, // This attack is made from behind, a rogue may have damage bonus
            damages: {
                amount: 0, // amount of damage if attack hit
                resisted: {}, // amount of resisted damage, by damage type
                types: {} // amount of damage by type
            },
            ...oDefault
        }
    }

    _completeAttackOutcomeWeapon (oOutcome, { finesse, ranged }) {
        const nStrength = this.getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH]
        const nDexterity = this.getters.getAbilityModifiers[CONSTS.ABILITY_DEXTERITY]
        const nOffensiveAbilityModifier = ranged
            ? nDexterity
            : finesse
                ? Math.max(nStrength, nDexterity)
                : nStrength
        const oAttackModifiers = this.getters.getAttackModifiers
        const nAttackModifiers = ranged ? oAttackModifiers.ranged : oAttackModifiers.melee
    }

    /**
     * Attack the target using the specified combatAction
     * @param oTarget {Creature}
     */
    attackWithSelectedWeapon (oTarget) {
        const nAttackBonus =
        // Determine if attack is melee or ranged
        const weapon = this.getters.getSelectedWeapon
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
        const oAttackModifiers = this.getters.getAttackModifiers
        const nAttackModifiers = bRanged ? oAttackModifiers.ranged : oAttackModifiers.melee
        const oArmorClass = oTarget.getters.getArmorClass
        return this._createAttackOutcome({
            ac: bRanged ? oArmorClass.ranged : oArmorClass.melee,
            bonus: nAttackModifiers + nOffensiveAbilityModifier,
            target: oTarget,
            weapon
        })
    }

    /**
     *
     * @param oTarget {Creature}
     * @param oCombatAction {CombatAction}
     */
    attackUsingAction (oTarget, oCombatAction) {
        const { amp, conveys, attackType } = oCombatAction
        const md = this.getters.getMonsterData
        const oArmorClass = oTarget.getters.getArmorClass
        const oAttackOutcome = this._createAttackOutcome({})
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

    resolveAttackOutcome (oAttackOutcome) {
        const nRoll = this._dice.roll(20)
        oAttackOutcome.roll = nRoll
        oAttackOutcome.critical = nRoll === 20
        oAttackOutcome.hit = (nRoll > 1) && (nRoll + oAttackOutcome.bonus >= oAttackOutcome.ac)
        return oAttackOutcome
    }
}

module.exports = Creature