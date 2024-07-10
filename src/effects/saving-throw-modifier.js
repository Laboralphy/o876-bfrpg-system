const CONSTS = require('../consts')

function init ({ effect, savingThrow = CONSTS.SAVING_THROW_ANY }) {
    effect.data.savingThrow = savingThrow
}

module.exports = {
    init
}