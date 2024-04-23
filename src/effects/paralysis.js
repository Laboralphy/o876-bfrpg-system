const CONSTS = require('../consts')

/**
 * When success saving throw against paralysis the effect ends
 * @param oEffect
 * @param target
 */
function mutate ({ effect: oEffect, target }) {
    if (target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY)) {
        target.mutations.removeEffect({ effect: oEffect })
    }
}

module.exports = {
    mutate
}