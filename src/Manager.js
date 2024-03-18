const Horde = require("./Horde");
const Creature = require("./Creature");
const ItemProperties = require('./ItemProperties')
require('./store/getters.doc')
require('./store/mutations.doc')
const EffectProcessor = require("./EffectProcessor");
const EFFECTS = require('./effects')
const CONSTS = require('./consts')
const DATA = require('./data')
const ItemBuilder = require("./ItemBuilder");
const { getId } = require('./unique-id')

/**
 * @typedef BFItem {object}
 * @property id {string}
 * @property ref {string} blueprint reference
 * @property entityType {string}
 * @property itemType {string}
 * @property [armorType] {string}
 * @property [weaponType] {string}
 * @property [shieldType] {string}
 * @property [ammoType] {string}
 * @property properties {[]}
 * @property data {{}}
 * @property equipmentSlots {string[]}
 * @property weight {number}
 * @property [size] {string}
 * @property [ac] {string}
 * @property [damage] {string}
 * @property material {string}
 */

/**
 * @class
 */
class Manager {
    constructor () {
        const h = new Horde()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        ep.events.on('effect-applied', ev => this.effectApplied(ev))
        ep.events.on('effect-disposed', ev => this.effectDisposed(ev))
        const ib = new ItemBuilder()

        this._horde = h
        this._effectProcessor = ep
        this._effectOptimRegistry = {}
        this._data = Object.assign({}, DATA)
        this._blueprints = {}
        this._itemBuilder = ib
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

    get blueprints () {
        return this._blueprints
    }

    /**
     * @returns {EffectProcessor}
     */
    get effectProcessor () {
        return this._effectProcessor
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
            ? this._blueprints[ref]
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
     * Destroy a creature
     * @param oCreature {Creature}
     */
    destroyCreature (oCreature) {
        // all effects cast by this creature must be ended immediatly
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
     * A new effect has been applied on a creature. The manager must keep track of this effect if duration is > 0
     * @param effect {BFEffect}
     * @param target {Creature}
     * @param source {Creature}
     */
    effectApplied ({ effect, target, source }) {
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
    effectDisposed ({ effect, target, source }) {
        delete this._effectOptimRegistry[effect.id]
    }
}

module.exports = Manager