const { getId } = require('./unique-id')
const { buildStore } = require('./store')
const { aggregateModifiers } = require('./aggregator')
const EventEmitter = require('node:events')
const Dice = require('./libs/dice')
const CONSTS = require('./consts')
const { deepClone } = require("@laboralphy/object-fusion");


require('./types.doc')

/**
 * @class Creature
 */
class Creature {

    constructor () {
        this._id = getId()
        this._name = this._id
        this._dice = new Dice()
        /**
         * @type {EventEmitter}
         * @private
         */
        this._events = new EventEmitter()
        this._store = buildStore()
        this._ref = ''
        this.setHitPoints(Infinity)
    }

    set ref (value) {
        this._ref = value
    }

    get ref () {
        return this._ref
    }

    get data () {
        return this._store.externals
    }

    /**
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

    get state () {
        /**
         * @type {BFStoreState}
         */
        const state = this._store.state
        return deepClone({
            id: this._id,
            ref: this.ref,
            abilities: state.abilities,
            classType: state.classType,
            specie: state.specie,
            speed: state.speed,
            race: state.race,
            gender: state.gender,
            naturalArmorClass: state.naturalArmorClass,
            level: state.level,
            actions: state.actions,
            selectedAction: state.selectedAction,
            pools: state.pools,
            effects: state.effects,
            properties: state.properties,
            offensiveSlot: state.offensiveSlot,
            equipment: state.equipment,
            encumbrance: state.encumbrance
        })
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
            visibility: CONSTS.CREATURE_VISIBILITY_VISIBLE,
            opportunity: false,
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
        const bIgnoreArmor = weaponAttributeSet.has(CONSTS.WEAPON_ATTRIBUTE_IGNORE_ARMOR)
        oAttackOutcome.sneakable = oAttackOutcome.sneakable && !bRanged
        const oTarget = oAttackOutcome.target
        const oArmorClass = oTarget.getters.getArmorClass
        oAttackOutcome.ac = bIgnoreArmor
            ? oArmorClass.natural + oArmorClass.details.dexterity
            : bRanged ? oArmorClass.ranged : oArmorClass.melee
        oAttackOutcome.bonus += this.getters.getAttackBonus
        oAttackOutcome.weapon = weapon
        oAttackOutcome.ammo = ammo
    }

    /**
     * @param oAttackOutcome {BFAttackOutcome}
     */
    _attackUsingAction (oAttackOutcome) {
        const { attackType } = oAttackOutcome.action
        const oTarget = oAttackOutcome.target
        const oArmorClass = oTarget.getters.getArmorClass
        oAttackOutcome.bonus += this.getters.getAttackBonus
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
                oAttackOutcome.sneakable = false
                break
            }

            case CONSTS.ATTACK_TYPE_RANGED_TOUCH: {
                oAttackOutcome.ac = oArmorClass.natural
                oAttackOutcome.sneakable = false
                break
            }

            case CONSTS.ATTACK_TYPE_HOMING: {
                // Homing attacks require to clearly see target
                if (oAttackOutcome.visibility !== CONSTS.CREATURE_VISIBILITY_VISIBLE) {
                    oAttackOutcome.failed = true
                    oAttackOutcome.failure = CONSTS.ATTACK_FAILURE_VISIBILITY
                }
                break
            }

            default: {
                oAttackOutcome.sneakable = false
                break
            }
        }
    }

    /**
     * Revive a dead creature
     */
    revive () {
        if (this.getters.isDead) {
            this.mutations.setHitPoints({ value: 1 })
            this.events.emit('revive', {
                creature: this
            })
        }
    }

    modifyHitPoints (n) {
        this.setHitPoints(this.getters.getHitPoints + n)
    }

    setHitPoints (hp) {
        const nCurrHP = this.getters.getHitPoints
        if (this.getters.isDead) {
            // Cannot heal dead creature. Must call revive prior
            return
        }
        const nMaxHP = this.getters.getMaxHitPoints
        hp = Math.max(0, Math.min(hp, nMaxHP))
        if (hp === nCurrHP) {
            return
        }
        this.mutations.setHitPoints({ value: hp })
    }

    /**
     * Will roll a die and see if attack hits
     * @param oAttackOutcome {BFAttackOutcome}
     * @returns {BFAttackOutcome}
     */
    resolveAttackHit (oAttackOutcome) {
        /**
         * @var {{savingThrow: {fumble: number, success: number}, attack: {fumble: number, success: number}}}
         */
        const fs = this.getters.getFumbleSuccess
        const nRoll = this._dice.roll(20)
        oAttackOutcome.roll = nRoll
        const bAutoHit = nRoll >= fs.attack.success
        const bAutoMiss = nRoll <= fs.attack.fumble
        oAttackOutcome.critical = bAutoHit || bAutoMiss
        const nAtkRoll = nRoll + oAttackOutcome.bonus
        oAttackOutcome.hit = bAutoHit || (!bAutoMiss && nAtkRoll >= oAttackOutcome.ac)
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
     * @param sneak {boolean} if true then this is a sneak attack
     * @param opportunity {boolean} if true then this is an attack of opportunity (attack bonus, no retaliation)
     * @returns {BFAttackOutcome}
     */
    attack (oTarget, action, {
        distance = 0,
        sneak = false,
        opportunity = false
    } = {}) {
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
            range,
            sneakable: sneak,
            opportunity,
            visibility: this.getCreatureVisibility(oTarget)
        })
        if (oAttackOutcome.visibility !== CONSTS.CREATURE_VISIBILITY_VISIBLE) {
            oAttackOutcome.bonus -= this.data.variables.undetectableTargetAttackMalus
        }
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
        if (oAttackOutcome.opportunity) {
            oAttackOutcome.bonus += this.data.variables.opportunityAttackBonus
        }
        if (oAttackOutcome.sneakable) {
            oAttackOutcome.bonus += this.data.variables.sneakAttackBonus
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
        const sneakable = oAttackOutcome.sneakable
        let damage, material, damageType
        if (!action) {
            throw new Error('This attack outcome has no action specified')
        }
        if (action.name === CONSTS.DEFAULT_ACTION_WEAPON) {
            const { weapon, ammo } = this.getters.getOffensiveEquipment
            const wa = new Set(weapon.attributes)
            const waRanged = wa.has(CONSTS.WEAPON_ATTRIBUTE_RANGED)
            const wa2Hands = wa.has(CONSTS.WEAPON_ATTRIBUTE_TWO_HANDED)
            let nAbilityBonus = waRanged
                ? 0
                : this.getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH]
            if (wa2Hands) {
                nAbilityBonus *= 2
            }
            const rawWeaponDamage = this.dice.evaluate(weapon.damage)
            damage = rawWeaponDamage > 0 ? Math.max(1, rawWeaponDamage + nAbilityBonus) : 0
            damageType = (ammo && ammo.damageType)
                ? ammo.damageType
                : (weapon && weapon.damageType)
                    ? weapon.damageType
                    : CONSTS.DAMAGE_TYPE_PHYSICAL
            material = ammo ? ammo.material : weapon.material
        } else {
            const aat = action.attackType
            // Attack type melee touch will not use strength for damage bonus
            // as they often don't rely on physical strength to apply damage
            let nAbilityBonus =
                (aat === CONSTS.ATTACK_TYPE_MELEE ||
                aat === CONSTS.ATTACK_TYPE_MULTI_MELEE)
                    ? this.getters.getAbilityModifiers[CONSTS.ABILITY_STRENGTH]
                    : 0
            const rawWeaponDamage = this.dice.evaluate(action.damage)
            damage = rawWeaponDamage > 0 ? Math.max(1, rawWeaponDamage + nAbilityBonus) : 0
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
        const nSneakAttackMultiplier = this.data.variables.sneakAttackMultiplier
        if (sneakable) {
            damage *= nSneakAttackMultiplier
        }
        const oDamageTypes = {
            [damageType]: damage
        }
        Object.entries(oDamageBonusRegistry.sorter).forEach(([sType, { sum }]) => {
            if (sneakable) {
                sum *= nSneakAttackMultiplier
            }
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
     * Roll a skill
     * @param skill {string}
     * @param nDifficulty {number}
     * @returns {boolean}
     */
    rollSkill (skill, nDifficulty = 0) {
        const oRogueSkills = this.getters.getClassTypeData.rogueSkills
        const nSkillValue = oRogueSkills[skill]
        if (isNaN(nSkillValue)) {
            throw new Error('This skill in not valid : ' + skill + ', allowed skill values are : ' + Object.keys(oRogueSkills).join(', '))
        }
        const difficulty = 100 - nSkillValue + nDifficulty
        const roll = this.dice.roll(100)
        const success = roll >= difficulty
        const oPayload = {
            skill,
            skillValue: nSkillValue,
            difficulty,
            roll,
            success
        }
        this._events.emit('roll-skill', oPayload)
        return success
    }

    /**
     * @typedef SavingThrowOutcome {object}
     * @property success {boolean} if true then saving throw is success, threat is avoided or diminished
     * @property ability {string} ability involved in saving throw adjustment
     * @property savingThrow {string}
     * @property dc {number} difficulty class
     * @property roll {number} roll
     * @property bonus {number} bonus
     * @property adjustment {number} manual adjustment
     *
     * Rolls a saving throw
     * @param sSavingThrow {string} SAVING_THROW_*
     * @param adjustment {number}
     * @param ability {string} ABILITY_*
     */
    rollSavingThrow (sSavingThrow, { ability = '', adjustment = 0} = {}) {
        const st = this.getters.getClassTypeData.savingThrows
        if (sSavingThrow in st) {
            let sAbility = ability
            const nAbilityBonus = sAbility
                ? this.getters.getAbilityModifiers[sAbility]
                : 0
            const dc = st[sSavingThrow] + adjustment
            const nRoll = this.dice.roll(20)
            const nBonus = nAbilityBonus + this.aggregateModifiers([
                CONSTS.EFFECT_SAVING_THROW_MODIFIER,
                CONSTS.ITEM_PROPERTY_SAVING_THROW_MODIFIER
            ],  {
                effectFilter: effect => effect.data.savingThrow === sSavingThrow || effect.data.savingThrow === CONSTS.SAVING_THROW_ANY,
                propFilter: prop => prop.data.savingThrow === sSavingThrow || prop.data.savingThrow === CONSTS.SAVING_THROW_ANY
            }).sum
            const nRollBonus = nRoll + nBonus
            /**
             * @var {{savingThrow: {fumble: number, success: number}, attack: {fumble: number, success: number}}}
             */
            const fs = this.getters.getFumbleSuccess
            const success =
                nRoll >= fs.savingThrow.success ||
                (nRoll > fs.savingThrow.fumble && nRollBonus >= dc)
            const outcome = {
                success,
                ability: sAbility,
                savingThrow: sSavingThrow,
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

    /**
     * Returns true if this creature can detect its target
     * @param oTarget {Creature}
     * @return {string} CREATURE_VISIBILITY_*
     */
    getCreatureVisibility (oTarget) {
        if (oTarget === this) {
            return CONSTS.CREATURE_VISIBILITY_VISIBLE
        }
        const mg = this.getters
        const tg = oTarget.getters
        const myConditions = mg.getConditionSet
        const myEffects = mg.getEffectSet
        const myProps = mg.getPropertySet
        const targetEffects = tg.getEffectSet
        const targetProps = tg.getPropertySet
        if (myConditions.has(CONSTS.CONDITION_BLINDED)) {
            return CONSTS.CREATURE_VISIBILITY_BLINDED
        }
        if (targetEffects.has(CONSTS.EFFECT_INVISIBILITY) && !myEffects.has(CONSTS.EFFECT_SEE_INVISIBILITY)) {
            return CONSTS.CREATURE_VISIBILITY_INVISIBLE
        }
        if (targetEffects.has(CONSTS.EFFECT_STEALTH)) {
            return CONSTS.CREATURE_VISIBILITY_HIDDEN
        }
        const bInDarkness = mg.getEnvironment[CONSTS.ENVIRONMENT_DARKNESS]
        if (bInDarkness && !myEffects.has(CONSTS.EFFECT_DARKVISION) && !myProps.has(CONSTS.ITEM_PROPERTY_DARKVISION)) {
            // if environment is dark, then one of the two opponent must have a source light
            return (
                    myProps.has(CONSTS.ITEM_PROPERTY_LIGHT) ||
                    targetProps.has(CONSTS.ITEM_PROPERTY_LIGHT) ||
                    myEffects.has(CONSTS.EFFECT_LIGHT) ||
                    targetEffects.has(CONSTS.EFFECT_LIGHT)
                )
                ? CONSTS.CREATURE_VISIBILITY_VISIBLE
                : CONSTS.CREATURE_VISIBILITY_DARKNESS
        }
        return CONSTS.CREATURE_VISIBILITY_VISIBLE
    }
}

module.exports = Creature