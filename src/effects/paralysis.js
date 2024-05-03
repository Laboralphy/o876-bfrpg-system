const CONSTS = require('../consts')

/**
 * When success saving throw against paralysis the effect ends
 * @param effect
 * @param target
 */
function mutate ({ effect, target }) {
    if (target.rollSavingThrow(CONSTS.SAVING_THROW_PARALYSIS_PETRIFY, { ability: CONSTS.ABILITY_STRENGTH })) {
        target.mutations.removeEffect({ effect })
    }
}

module.exports = {
    mutate
}