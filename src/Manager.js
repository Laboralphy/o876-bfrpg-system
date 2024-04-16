const EventEmitter = require('node:events')
const { getId } = require('./unique-id')
const Horde = require("./Horde");
const Creature = require("./Creature");
const EffectProcessor = require("./EffectProcessor");
const ItemBuilder = require("./ItemBuilder");
const SchemaValidator = require('./SchemaValidator')
const CombatManager = require('./combat/CombatManager')
const CreatureBuilder = require("./CreatureBuilder");

const EFFECTS = require('./effects')
const DATA = require('./data')
const CONSTS = require('./consts')
const SCRIPTS = require('./scripts')



require('./store/getters.doc')
require('./store/mutations.doc')
require('./types.doc')


const NEED_ATTACK_ROLL  = new Set([
    CONSTS.ATTACK_TYPE_ANY,
    CONSTS.ATTACK_TYPE_RANGED,
    CONSTS.ATTACK_TYPE_MELEE,
    CONSTS.ATTACK_TYPE_RANGED_TOUCH,
    CONSTS.ATTACK_TYPE_MELEE_TOUCH,
    CONSTS.ATTACK_TYPE_MULTI_MELEE
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
        this._data = Object.assign({}, DATA)
        this._blueprints = {}
        this._validBlueprints = {}
        this._events = new EventEmitter()

        ib.blueprints = this._blueprints
        ib.data = this._data

        cm.events.on('combat.action', ev => this._combatAction(ev))
        cm.events.on('combat.distance', ev => this._events.emit('combat.distance', ev))
        cm.events.on('combat.turn', ev => this._events.emit('combat.turn', ev))

        this._itemBuilder = ib
        this._creatureBuilder = cb
        this._schemaValidator = null
        this._combatManager = cm
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
    }

    /**
     * An effect has expired (duration reached 0)
     * @param effect {BFEffect}
     * @param target {Creature}
     * @param source {Creature}
     */
    _effectDisposed ({ effect, target, source }) {
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
     * @param action {CombatAction}
     * @param script {string}
     * @param count {number}
     * @private
     */
    _combatAction ({
       turn,
       tick,
       attacker,
       target,
       action,
       count
    }) {
        // New combat action
        this._events.emit('combat.action', {
            turn,
            tick,
            attacker,
            target,
            action,
            count
        })
        // weaponized action is an action that uses standard attack system (roll + bonus vs. ac)
        const bWeaponizedAction = action.name === CONSTS.DEFAULT_ACTION_WEAPON ||
            action.name === CONSTS.DEFAULT_ACTION_UNARMED
        for (let iAtk = 0; iAtk < count; ++iAtk) {
            // creates a new attack outcome if weaponized action
            const oAttackOutcome = bWeaponizedAction || NEED_ATTACK_ROLL.has(action.attackType)
                ? attacker.attack(target, action)
                : null
            if (oAttackOutcome) {
                if (oAttackOutcome.hit) {
                    // the attack has landed : rolling damages
                    const { material: sWeaponMaterial, types: oWeaponDamages} = attacker
                        .rollDamage(oAttackOutcome)
                    const aEffects = Object
                        .entries(oWeaponDamages)
                        .filter(([, nAmount]) => nAmount > 0)
                        .map(([sDamageType, nAmount]) => this
                            .effectProcessor
                            .createEffect(CONSTS.EFFECT_DAMAGE, nAmount, {
                                material: sDamageType === CONSTS.DAMAGE_TYPE_PHYSICAL
                                    ? sWeaponMaterial
                                    : CONSTS.MATERIAL_UNKNOWN,
                                type: sDamageType
                            })
                        )
                    aEffects.forEach(effect => this.effectProcessor.applyEffect(effect, target, 0, attacker))
                    oAttackOutcome.damages = target.getDamageReport(true)
                }
                this._events.emit('combat.attack', {
                    turn, tick,
                    outcome: oAttackOutcome
                })
            }
            action.conveys.forEach(({ script, data }) => {
                const sScriptRef = 'atk-' + script
                if (sScriptRef in SCRIPTS) {
                    SCRIPTS[sScriptRef]({
                        turn,
                        tick,
                        data,
                        attacker,
                        target,
                        attackOutcome: oAttackOutcome,
                        manager: this
                    })
                } else {
                    throw new Error('script not found : ' + sScriptRef)
                }
            })
        }
    }

    async init () {
        this._schemaValidator = new SchemaValidator()
        await this._schemaValidator.init()
    }

    /**
     * @returns {Horde}
     */
    get horde () {
        return this._horde
    }

    get data () {
        return this._data
    }

    /**
     * @returns {EffectProcessor}
     */
    get effectProcessor () {
        return this._effectProcessor
    }

    get combatManager () {
        return this._combatManager
    }

    /**
     * Load a module of additional assets (blueprints and data)
     * @param module {string} name of module (classic, modern, future)
     */
    loadModule (module) {
        const { DATA, BLUEPRINTS } = require('./modules/' + module)
        Object.assign(this._data, DATA)
        Object.assign(this._blueprints, BLUEPRINTS)
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
        if (sRef in this._blueprints) {
            const bp = this._blueprints[sRef]
            if (!this._schemaValidator) {
                throw new Error('schema validator has not been initialized (did you forgot to call Manager.init() ?)')
            }
            switch (bp.entityType) {
                case CONSTS.ENTITY_TYPE_ITEM: {
                    this._schemaValidator.validate(bp, 'blueprint-item')
                    break
                }

                case CONSTS.ENTITY_TYPE_ACTOR: {
                    this._schemaValidator.validate(bp, 'blueprint-actor')
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

    /**
     * Create a new creature
     * @param id {string}
     * @param ref {string}
     * @returns {Creature}
     */
    createCreature ({ id, ref = '' }) {
        const oCreature = new Creature()
        if (ref) {
            const oBlueprint = this.getBlueprint(ref)
            this._creatureBuilder.buildMonster(oCreature, oBlueprint)
            oBlueprint.equipment.forEach(eq => {
                const oItem = this.createItem({ ref: eq })
                oCreature.mutations.equipItem({ item: oItem })
            })
        }
        oCreature.id = id
        oCreature.mutations.setHitPoints({ value: oCreature.getters.getMaxHitPoints })
        this._horde.linkCreature(oCreature)
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
        const oItem = ib.createItem(oBlueprint, this._data)
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
}

module.exports = Manager