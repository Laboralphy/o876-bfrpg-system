const Horde = require("./Horde");
const Creature = require("./Creature");
require('./store/getters.doc')
require('./store/mutations.doc')
const EffectProcessor = require("./EffectProcessor");
const EFFECTS = require('./effects')

class Manager {
    constructor () {
        const h = new Horde()
        const ep = new EffectProcessor()
        ep.effectPrograms = EFFECTS
        ep.events.on('effect-applied', ev => this.effectApplied(ev))
        ep.events.on('effect-disposed', ev => this.effectDisposed(ev))

        this._horde = h
        this._effectProcessor = ep
        this._effectOptimRegistry = {}
    }

    /**
     * @returns {Horde}
     */
    get horde () {
        return this._horde
    }

    /**
     * @returns {EffectProcessor}
     */
    get effectProcessor () {
        return this._effectProcessor
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