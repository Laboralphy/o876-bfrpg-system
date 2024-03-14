const Horde = require("./Horde");
const Creature = require("./Creature");

class Manager {
    constructor () {
        this._horde = new Horde()
    }

    createCreature ({ id }) {
        const oCreature = new Creature()
        oCreature.id = id
        oCreature.effectProcessor.horde = this._horde
        this._horde.linkCreature(oCreature)
        return oCreature
    }

    destroyCreature (oCreature) {
        // all effects cast by this creature must be ended immediatly
        this._horde.forEach(creature => {
            const aEffects = creature
                .store
                .getters
                .getEffects
                .filter(effect => effect.source === oCreature.id)
            aEffects.forEach(effectToBeDispelled => {
                creature
                    .store
                    .mutations
                    .setEffectDuration({ effect: effectToBeDispelled, value: 0 })
            })
        })
        this._horde.unlinkCreature(oCreature)
    }
}