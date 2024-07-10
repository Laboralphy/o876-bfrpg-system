const CONSTS = require('../consts')

function init ({ itemProperty, savingThrow = CONSTS.SAVING_THROW_ANY }) {
    itemProperty.data.savingThrow = savingThrow
}

module.exports = {
    init
}