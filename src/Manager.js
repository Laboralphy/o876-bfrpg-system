const EventEmitter = require('node:events')
const { getId } = require('./unique-id')
const Horde = require("./Horde");
const Creature = require("./Creature");
const EffectProcessor = require("./EffectProcessor");
const ItemBuilder = require("./ItemBuilder");
const ItemProperties = require('./ItemProperties')
const SchemaValidator = require('./SchemaValidator')
const CombatManager = require('./combat/CombatManager')
const CreatureBuilder = require("./CreatureBuilder");
const ResourceManager = require('./libs/resource-manager')

const EFFECTS = require('./effects')
const DATA = require('./data')
const CONSTS = require('./consts')
const SCRIPTS = require('./scripts')

const RMK_BLUEPRINTS = 'blueprints'
const RMK_DATA = 'data'

require('./store/getters.doc')
require('./store/mutations.doc')
require('./types.doc')
const {BLUEPRINTS} = require("./modules/classic");

const NEED_ATTACK_ROLL  = new Set([
    CONSTS.ATTACK_TYPE_ANY,
    CONSTS.ATTACK_TYPE_RANGED,
    CONSTS.ATTACK_TYPE_MELEE,
    CONSTS.ATTACK_TYPE_MULTI_MELEE,
    CONSTS.ATTACK_TYPE_RANGED_TOUCH,
    CONSTS.ATTACK_TYPE_MELEE_TOUCH
])

/**
 * @class
 */
class Manager {
    constructor () {
        const h = new Horde()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        ep.events.on('effect-applied', ev => this._effectApplied(ev))
        ep.events.on('effect-disposed', ev => this._effectDisposed(ev))
        const ib = new ItemBuilder()
        const cb = new CreatureBuilder()
        const cm = new CombatManager()

        this._horde = h
        this._effectProcessor = ep
        this._effectOptimRegistry = {}
        this._rm = new ResourceManager()
        this._rm.assign(RMK_BLUEPRINTS, {})
        this._rm.assign(RMK_DATA, DATA)
        this._validBlueprints = {}
        this._events = new EventEmitter()

        cm.defaultDistance = 50
        cm.resourceManager = this._rm
        cm.events.on('combat.action', ev => this._combatAction(ev))
        cm.events.on('combat.distance', ev => this._events.emit('combat.distance', ev))
        cm.events.on('combat.move', ev => this._events.emit('combat.move', ev))
        cm.events.on('combat.turn', ev => {
            this._processCreaturePassiveProperties(ev.attacker)
            this.runPropEffectScript(ev.attacker, 'combatTurn', {
                action: ev.action,
                combat: ev.combat
            })
            this._events.emit('combat.turn', ev)
        })
        cm.events.on('combat.tick.end', ev => {
            this._events.emit('combat.tick.end', ev)
        })
        cm.events.on('combat.offensive-slot', ev => {
            this._events.emit('combat.offensive-slot', ev)
        })

        this._itemBuilder = ib
        this._creatureBuilder = cb
        this._schemaValidator = null
        this._combatManager = cm

        this._scripts = {
            ...SCRIPTS
        }
    }

    get events () {
        return this._events
    }

    /**
     * A new effect has been applied on a creatures. The manager must keep track of this effect if duration is > 0
     * @param effect {BFEffect}
     * @param target {Creature}
     * @param source {Creature}
     */
    _effectApplied ({ effect, target, source }) {
        if (effect.duration > 0) {
            this._effectOptimRegistry[effect.id] = { effect, target, source }
        }
        this.events.emit('creature.effect.applied', { manager: this, effect, target, source })
    }

    /**
     * An effect has expired (duration reached 0)
     * @param effect {BFEffect}
     * @param target {Creature}
     * @param source {Creature}
     */
    _effectDisposed ({ effect, target, source }) {
        this.events.emit('creature.effect.disposed', { manager: this, effect, target, source })
        delete this._effectOptimRegistry[effect.id]
    }

    /**
     * A new turn for a combat
     * @param turn {number}
     * @param attacker {Creature}
     * @param target {Creature}
     * @private
     */
    _combatTurn ({ turn, attacker, target }) {
        // New combat turn
    }

    /**
     * An action occurred in a combat
     * @param turn {number}
     * @param tick {number}
     * @param attacker {Creature}
     * @param target {Creature}
     * @param action {BFStoreStateAction}
     * @param script {string}
     * @param count {number}
     * @private
     */
    _combatAction ({
       turn,
       tick,
       attacker,
       target,
       combat,
       action,
       count,
       combatManager
    }) {
        // action null = target unreachable

        // New combat action
        this._events.emit('combat.action', {
            turn,
            tick,
            attacker,
            target,
            combat,
            action,
            count,
            combatManager
        })
        // weaponized action is an action that uses standard attack system (roll + bonus vs. ac)
        const bWeaponizedAction = action.name === CONSTS.DEFAULT_ACTION_WEAPON ||
            action.name === CONSTS.DEFAULT_ACTION_UNARMED
        for (let iAtk = 0; iAtk < count; ++iAtk) {
            // creates a new attack outcome if weaponized action
            const oAttackOutcome = bWeaponizedAction || NEED_ATTACK_ROLL.has(action.attackType)
                ? attacker.attack(target, action, combat.distance)
                : attacker.getNoAttackOutcome(action)
            if (oAttackOutcome) {
                if (oAttackOutcome.hit) {
                    // the attack has landed : rolling damages
                    const { material: sWeaponMaterial, types: oWeaponDamages} = attacker
                        .rollDamage(oAttackOutcome)
                    const aEffects = Object
                        .entries(oWeaponDamages)
                        .filter(([, nAmount]) => nAmount > 0)
                        .map(([sDamageType, nAmount]) => {
                            const effect = this
                                .effectProcessor
                                .createEffect(CONSTS.EFFECT_DAMAGE, nAmount, {
                                    material: sDamageType === CONSTS.DAMAGE_TYPE_PHYSICAL
                                        ? sWeaponMaterial
                                        : CONSTS.MATERIAL_UNKNOWN,
                                    damageType: sDamageType
                                })
                            effect.subtype = CONSTS.EFFECT_SUBTYPE_WEAPON
                            return effect
                        })
                    oAttackOutcome.damages = {
                        amount: 0,
                        types: {}
                    }
                    aEffects.forEach(effect => {
                        const eAppliedDamage = this.effectProcessor.applyEffect(effect, target, 0, attacker)
                        const wdrt = oAttackOutcome.damages.types
                        if (!wdrt[eAppliedDamage.data.damageType]) {
                            wdrt[eAppliedDamage.data.damageType] = {
                                amount: 0,
                                resisted: 0
                            }
                        }
                        const wdrtar = wdrt[eAppliedDamage.data.damageType]
                        wdrtar.amount += eAppliedDamage.data.appliedAmount
                        wdrtar.resisted += eAppliedDamage.data.resistedAmount
                        oAttackOutcome.damages.amount += eAppliedDamage.data.appliedAmount
                    })
                    // the target will have penalty of speed
                    const oTargetCombat = this.combatManager.getCombat(target)
                    if (oTargetCombat) {
                        ++oTargetCombat.attacker.speedPenalty
                    }
                    this.runPropEffectScript(target, 'attacked', {
                        attacker,
                        creature: target,
                        attackOutcome: oAttackOutcome
                    })
                }
                if (oAttackOutcome.failure !== CONSTS.ATTACK_FAILURE_NO_NEED) {
                    this._events.emit('combat.attack', {
                        turn, tick, attackIndex: iAtk,
                        outcome: oAttackOutcome
                    })
                }
            }
            if (action.attackType === CONSTS.ATTACK_TYPE_HOMING || oAttackOutcome.hit) {
                action.conveys.forEach(({ script: sScriptRef, data }) => {
                    this.runScript(sScriptRef, {
                        turn,
                        tick,
                        data,
                        script: sScriptRef,
                        attacker,
                        target,
                        attackOutcome: oAttackOutcome,
                        action,
                        manager: this
                    })
                })
            }
        }
    }

    runScript (sScriptRef, ...aParams) {
        if (sScriptRef in this._scripts) {
            return this._scripts[sScriptRef](...aParams)
        } else {
            throw new Error('script not found : ' + sScriptRef)
        }
    }

    async init () {
        this._schemaValidator = new SchemaValidator()
        return this._schemaValidator.init()
    }

    /**
     * @returns {Horde}
     */
    get horde () {
        return this._horde
    }

    get data () {
        return this._rm.data[RMK_DATA]
    }

    get blueprints () {
        return this._rm.data[RMK_BLUEPRINTS]
    }

    /**
     * @returns {EffectProcessor}
     */
    get effectProcessor () {
        return this._effectProcessor
    }

    /**
     * @returns {CombatManager}
     */
    get combatManager () {
        return this._combatManager
    }

    /**
     * Load a module of additional assets (blueprints and data)
     * @param module {string} name of module (classic, modern, future)
     */
    loadModule (module) {
        const { DATA, BLUEPRINTS, SCRIPTS } = require('./modules/' + module)
        this._rm.assign('data', DATA)
        this._rm.assign('blueprints', BLUEPRINTS)
        Object.assign(this._scripts, SCRIPTS)
    }

    /**
     *
     * @param sRef {string|object}
     * @returns {object}
     */
    getBlueprint (sRef) {
        const sType = typeof sRef
        if (sType === 'object') {
            this._schemaValidator.validate(sRef, 'blueprint-item')
            this._validBlueprints[sRef] = sRef
            return sRef
        }
        if (typeof sRef !== 'string') {
            throw new TypeError('reference must be a string')
        }
        if (sRef in this._validBlueprints) {
            return this._validBlueprints[sRef]
        }
        if (sRef in this.blueprints) {
            const bp = this.blueprints[sRef]
            if (!this._schemaValidator) {
                throw new Error('schema validator has not been initialized (did you forgot to call Manager.init() ?)')
            }
            switch (bp.entityType) {
                case CONSTS.ENTITY_TYPE_ITEM: {
                    try {
                        this._schemaValidator.validate(bp, 'blueprint-item')
                    } catch (e) {
                        throw new Error('Error while getting blueprint ref : ' + sRef, {
                            cause: e
                        })
                    }
                    break
                }

                case CONSTS.ENTITY_TYPE_ACTOR: {
                    try {
                        this._schemaValidator.validate(bp, 'blueprint-actor')
                    } catch (e) {
                        throw new Error('Error while getting blueprint ref : ' + sRef, {
                            cause: e
                        })
                    }
                    break
                }

                default: {
                    throw new Error('this entity type is invalid : "' + bp.entityType + '"')
                }
            }
            this._validBlueprints[sRef] = bp
            return bp
        } else {
            throw new Error('this reference "' + sRef + '" is not in blueprint collection')
        }
    }

    runPropEffectScript (oCreature, sScript, oParams) {
        for (const effect of oCreature.getters.getEffects) {
            const source = this._horde.creatures[effect.source]
            this.effectProcessor.invokeEffectMethod(effect, sScript, oCreature, source, oParams)
        }
        for (const prop of oCreature.getters.getProperties) {
            ItemProperties.runScript(prop, sScript, {
                ...oParams,
                manager: this,
                creature: oCreature
            })
        }
    }

    /**
     * Create a new creature
     * @param id {string}
     * @param ref {string}
     * @param importData {*}
     * @returns {Creature}
     */
    createCreature ({ id = '', ref = '', importData = null } = {}) {
        const oCreature = new Creature()
        if (ref) {
            const oBlueprint = this.getBlueprint(ref)
            this._creatureBuilder.buildMonster(oCreature, oBlueprint)
            oCreature.ref = ref
            oBlueprint.equipment.forEach(eq => {
                const oItem = this.createItem({ ref: eq })
                oCreature.mutations.equipItem({ item: oItem })
            })
        }
        if (importData) {
            oCreature.mutations.importCreatureState({ data: importData })
            if (importData.id) {
                oCreature.id = importData.id
            }
            if (importData.ref) {
                oCreature.ref = importData.ref
            }
        }
        if (id !== '') {
            oCreature.id = id
        }
        oCreature.setHitPoints(oCreature.getters.getMaxHitPoints)
        this._horde.linkCreature(oCreature)
        oCreature.events.on('saving-throw', ev => this._events.emit('creature.saving-throw', {
            ...ev,
            creature: oCreature,
            manager: this
        }))
        oCreature.events.on('friend-check', ev => this._events.emit('creature.friend-check', {
            ...ev,
            creature: oCreature,
            manager: this
        }))
        oCreature.events.on('damaged', ev => {
            const oPayload = {
                ...ev,
                creature: oCreature,
                manager: this
            }
            this._events.emit('creature.damage', oPayload)
            this.runPropEffectScript(oCreature, 'damaged', oPayload)
        })
        oCreature.events.on('heal', ev => {
            const oPayload = {
                ...ev,
                creature: oCreature,
                manager: this
            }
            this._events.emit('creature.heal', oPayload)
        })
        oCreature.events.on('death', ev => {
            const oPayload = {
                ...ev,
                manager: this
            }
            this._events.emit('creature.death', oPayload)
        })
        return oCreature
    }

    createItem ({ id = '', ref }) {
        const ib = this._itemBuilder
        const sTypeOfRef = typeof ref
        const oBlueprint = sTypeOfRef === 'string'
            ? this.getBlueprint(ref)
            : sTypeOfRef === 'object'
                ? ref
                : null
        if (!oBlueprint) {
            throw new Error('Could not evaluate blueprint ' + ref)
        }
        const oItem = ib.createItem(oBlueprint, this.data)
        oItem.id = id || getId()
        oItem.ref = sTypeOfRef === 'string' ? ref  : ''
        return oItem
    }

    /**
     * Destroy a creatures
     * @param oCreature {Creature}
     */
    destroyCreature (oCreature) {
        // all effects cast by this creatures must be ended immediatly
        this._horde.forEach(creature => {
            const aEffects = creature
                .getters
                .getEffects
                .filter(effect => effect.source === oCreature.id)
            aEffects.forEach(effectToBeDispelled => {
                creature
                    .mutations
                    .setEffectDuration({ effect: effectToBeDispelled, value: 0 })
            })
        })
        this._combatManager.removeFighter(oCreature)
        this._horde.unlinkCreature(oCreature)
    }

    /**
     * Processes all effects in the effect optimization registry
     */
    processEffects () {
        Object.values(this._effectOptimRegistry).forEach(({ effect, target, source }) => {
            this._effectProcessor.processEffect(effect, target, source)
        })
    }

    /**
     * TODO not sure of i keep this method, i don't know when to call it
     * TODO need a better system to deal with periodic item properties
     * @param oCreature {Creature}
     */
    _processCreaturePassiveProperties (oCreature) {
        // regeneration
        const am = oCreature.aggregateModifiers([
            CONSTS.ITEM_PROPERTY_REGENERATION
        ], {
            propFilter: prop => prop.amp > 0,
            propAmpMapper: prop => typeof prop.amp === 'string' ? oCreature.dice.evaluate(prop.amp) : prop.amp,
        })
        const nRegen = am.sum
        if (oCreature.getters.getHitPoints < oCreature.getters.getMaxHitPoints) {
            oCreature.setHitPoints(oCreature.getters.getHitPoints + nRegen)
        }
    }

    createEffect (sType, amp = 0, oParams = {}) {
        return this._effectProcessor.createEffect(sType, amp, oParams)
    }

    applyEffect (effect, target, duration = 0, source = null) {
        return this._effectProcessor.applyEffect(effect, target, duration, source)
    }

    applyEffectGroup (aEffects, tags, target, duration = 0, source = null) {
        return this._effectProcessor.applyEffectGroup(aEffects, tags, target, duration, source)
    }

    dispelEffect (effect) {
        const target = this._horde.creatures(effect.target)
        const source = this._horde.creatures(effect.source)
        return this._effectProcessor.removeEffect(effect, target, source)
    }
}

module.exports = Manager