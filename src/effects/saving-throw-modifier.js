const CONSTS = require('../consts')

function init ({ effect, savingThrow = CONSTS.SAVING_THROW_ANY }) {
    effect.data.savingThrow = savingThrow
    effect.key = savingThrow
}

module.exports = {
    init
}