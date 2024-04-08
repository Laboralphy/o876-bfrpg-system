const Horde = require("./Horde");
const Creature = require("./Creature");
const EffectProcessor = require("./EffectProcessor");
const ItemBuilder = require("./ItemBuilder");
const SchemaValidator = require('./SchemaValidator')
const CombatManager = require('./combat/CombatManager')

const EFFECTS = require('./effects')
const DATA = require('./data')
const CONSTS = require('./consts')

const { getId } = require('./unique-id')

require('./store/getters.doc')
require('./store/mutations.doc')
require('./types.doc')


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

        this._horde = h
        this._effectProcessor = ep
        this._effectOptimRegistry = {}
        this._data = Object.assign({}, DATA)
        this._blueprints = {}
        this._validBlueprints = {}
        this._itemBuilder = ib
        this._schemaValidator = null
        this._combatManager = new CombatManager()
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
     * @param action {string}
     * @param script {string}
     * @param amp {string|number}
     * @param data {object}
     * @param count {number}
     * @private
     */
    _combatAction ({   turn,
       tick,
       attacker,
       target,
       action,
       script,
       amp,
       data,
       count
    }) {
        // New combat action
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
     * Load a module of additionnal assets (blueprints and data)
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
     * @returns {Creature}
     */
    createCreature ({ id }) {
        const oCreature = new Creature()
        oCreature.id = id
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
        oItem.ref = sTypeOfRef === '' ? ref  : ''
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