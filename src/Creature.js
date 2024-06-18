const { getId } = require('./unique-id')
const { buildStore } = require('./store')
const { aggregateModifiers } = require('./aggregator')
const EventEmitter = require('node:events')
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
        this._events = new EventEmitter()
        this._ref = ''
    }

    set ref (value) {
        this._ref = value
    }

    get ref () {
        return this._ref
    }

    get _data () {
        return this._store.externals.data.data
    }

    /**
     *
     * @returns {EventEmitter}
     */
    get events () {
        return this._events
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

    /**
     * @returns {Dice}
     */
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
     * Proxy to aggregateModifiers
     * @param aEffectsAndProps
     * @param oFunctions
     * @returns {{sorter: Object<String, {sum: number, max: number, count: number}>, max: number, min: number, sum: number, count: number, effects: number, ip: number}}
     */
    aggregateModifiers (aEffectsAndProps, oFunctions) {
        return aggregateModifiers(aEffectsAndProps, this.getters, oFunctions)
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
            failed: false, // could not attack
            failure: '', // reason why attack failed (out of range, condition, etc...)
            sneakable: false, // This attack is made from behind, a rogue may have damage bonus
            damages: {
                amount: 0, // amount of damage if attack hit
                types: {} // amount of damage taken and resisted by type
            },
            ...oDefault
        }
    }

    getNoAttackOutcome (action) {
        return this._createAttackOutcome({
            action,
            failure: CONSTS.ATTACK_FAILURE_NO_NEED
        })
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
        const { damage, conveys, attackType } = oAttackOutcome.action
        const oTarget = oAttackOutcome.target
        const oArmorClass = oTarget.getters.getArmorClass
        oAttackOutcome.bonus = this.getters.getAttackBonus
        switch (attackType) {
            case CONSTS.ATTACK_TYPE_MULTI_MELEE:
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

    setHitPoints (hp) {
        const nCurrHP = this.getters.getHitPoints
        const nMaxHP = this.getters.getMaxHitPoints
        hp = Math.max(0, Math.min(hp, nMaxHP))
        if (hp === nCurrHP) {
            return
        }
        this.mutations.setHitPoints({ value: hp })
        if (hp === 0) {
            this.events.emit('death', {
                creature: this
            })
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
        oAttackOutcome.hit = (nRoll > this.getters.getAttackRollFumbleValue) && (nRoll + oAttackOutcome.bonus >= oAttackOutcome.ac)
        return oAttackOutcome
    }

    /**
     * Use selected action or weapon to attack.
     * Does not check rules :
     * - No range checking
     * - Unloaded ranged weapon can still be used without ammo, missing ammo do not provide bonus
     * Will not select the most appropriate weapon or action prior to attack
     * @param oTarget {Creature}
     * @param action {BFStoreStateAction}
     * @param distance {number} Distance at which attack is done (default 0 means : we don't mind)
     * @returns {BFAttackOutcome}
     */
    attack (oTarget, action, distance = 0) {
        if (!oTarget) {
            throw new Error('Creature.attack target must be defined')
        }
        // selected action
        const oSelectedAction = action || this.getters.getSelectedAction
        // selected weapon if any
        const oSelectedWeapon = this.getters.getSelectedWeapon
        // if bWeapon true then we are using a weapon
        const bUseWeapon = !!oSelectedWeapon &&
            (
                (oSelectedAction.name === CONSTS.DEFAULT_ACTION_WEAPON) ||
                !oSelectedAction
            )
        if (!bUseWeapon && action) {
            this.mutations.selectAction({ action: action.name })
        }
        // if bWeapon we fetch the weapon reference, else we use null
        const weapon = bUseWeapon ? oSelectedWeapon : null
        const range = weapon ? this.getters.getAttackRanges.weapon : this.getters.getAttackRanges.action

        const oAttackOutcome = this._createAttackOutcome({
            attacker: this,
            target: oTarget,
            action: oSelectedAction,
            distance,
            range
        })
        if (distance > range) {
            oAttackOutcome.failed = true
            oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_TARGET_UNREACHABLE
            return oAttackOutcome
        }
        if (!this.getters.getCapabilities.fight) {
            oAttackOutcome.failed = true
            oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_CONDITION
            return oAttackOutcome
        } else {
            // check if can attack THIS target specifically (friend or master)
            let bPreventAttack = this.getters.getCharmerSet.has(oTarget.id)
            const oPlayloadFriendCheck = {
                target: oTarget,
                preventAttack: () => {
                    bPreventAttack = true
                }
            }
            this.events.emit('friend-check', oPlayloadFriendCheck)
            if (bPreventAttack) {
                oAttackOutcome.failed = true
                oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_FRIEND
                return oAttackOutcome
            }
        }
        if (!oAttackOutcome.action) {
            oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_NO_ACTION
            return oAttackOutcome
        }
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
            return oAttackOutcome
        }
        if (!oAttackOutcome.failed) {
            this.resolveAttackHit(oAttackOutcome)
        }
        return oAttackOutcome
    }

    /**
     * @param oAttackOutcome {BFAttackOutcome}
     * @returns {{types: {[p: string]: number}, material: string}}
     */
    rollDamage (oAttackOutcome) {
        const action = oAttackOutcome.action
        let damage, material, damageType
        if (action.name === CONSTS.DEFAULT_ACTION_WEAPON) {
            const { weapon, ammo } = this.getters.getOffensiveEquipment
            damage = this.dice.evaluate(weapon.damage)
            damageType = CONSTS.DAMAGE_TYPE_PHYSICAL
            material = ammo ? ammo.material : weapon.material
        } else {
            damage = this.dice.evaluate(action.damage)
            damageType = action.damageType
            material = CONSTS.MATERIAL_UNKNOWN
        }
        const ampMapper = ({ amp }) => this.dice.evaluate(amp)
        const sorterFunc = x => x.data.damageType
        const oDamageBonusRegistry = this.aggregateModifiers([
            CONSTS.ITEM_PROPERTY_DAMAGE_MODIFIER,
            CONSTS.EFFECT_DAMAGE_MODIFIER
        ], {
            effectAmpMapper: ampMapper,
            propAmpMapper: ampMapper,
            effectSorter: sorterFunc,
            propSorter: sorterFunc
        })
        const oDamageTypes = {
            [damageType]: damage
        }
        Object.entries(oDamageBonusRegistry.sorter).forEach(([sType, { sum }]) => {
            if (!(sType in oDamageTypes)) {
                oDamageTypes[sType] = sum
            } else {
                oDamageTypes[sType] += sum
            }
        })
        return {
            material,
            types: oDamageTypes
        }
    }


    /**
     * @typedef SavingThrowOutcome {object}
     * @property success {boolean} if true then saving throw is success, threat is avoided or diminished
     * @property ability {string} ability involved in saving throw adjustment
     * @property threat {string} threat involved in saving throw adjustement
     * @property dc {number} difficulty class
     * @property roll {number} roll
     * @property bonus {number} bonus
     * @property adjustment {number} manual adjustment
     *
     * Rolls a saving throw
     * @param sSavingThrow {string} SAVING_THROW_*
     * @param adjustment {number}
     * @param ability {string} ABILITY_*
     * @param threat {string} THREAT_*
     *
     */
    rollSavingThrow (sSavingThrow, { ability = '', adjustment = 0, threat = '' } = {}) {
        const st = this.getters.getClassTypeData.savingThrows
        if (sSavingThrow in st) {
            let sAbility = ability
            if (ability === '') {
                switch (threat) {
                    case '': {
                        break
                    }

                    case CONSTS.THREAT_POISON: {
                        sAbility = CONSTS.ABILITY_CONSTITUTION
                        break
                    }

                    case CONSTS.THREAT_ILLUSION: {
                        sAbility = CONSTS.ABILITY_INTELLIGENCE
                        break
                    }

                    case CONSTS.THREAT_MIND_SPELL: {
                        sAbility = CONSTS.ABILITY_WISDOM
                        break
                    }

                    default: {
                        throw new Error('Unsupported threat : ' + threat)
                    }
                }
            }
            const nAbilityBonus = sAbility
                ? this.getters.getAbilityModifiers[sAbility]
                : 0
            const dc = st[sSavingThrow] + adjustment
            const nRoll = this.dice.roll(20)
            const nBonus = nAbilityBonus + this.aggregateModifiers([
                CONSTS.EFFECT_SAVING_THROW_MODIFIER,
                CONSTS.ITEM_PROPERTY_SAVING_THROW_MODIFIER
            ],  {
                effectFilter: effect => effect.data.threat === sSavingThrow || effect.data.threat === CONSTS.SAVING_THROW_ANY,
                propFilter: prop => prop.data.threat === sSavingThrow || prop.data.threat === CONSTS.SAVING_THROW_ANY
            }).sum
            const nRollBonus = nRoll + nBonus
            const success =
                nRoll >= this.getters.getSavingThrowSucessValue ||
                (nRoll > this.getters.getSavingThrowFailureValue && nRollBonus >= dc)
            const outcome = {
                success,
                ability: sAbility,
                savingThrow: sSavingThrow,
                threat,
                dc,
                roll: nRoll,
                bonus: nBonus,
                total: nRollBonus,
                adjustment: adjustment
            }
            this._events.emit('saving-throw', outcome)
            return outcome
        } else {
            throw new Error('this threat cannot be saved : ' + sSavingThrow)
        }
    }
}

module.exports = Creature