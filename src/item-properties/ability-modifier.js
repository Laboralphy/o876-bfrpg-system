const CONSTS = require("../consts");

function init ({ itemProperty, ability }) {
    if (!CONSTS[ability]) {
        throw new Error('unknown ability ' + ability)
    }
    itemProperty.data.ability = ability
}

module.exports = {
    init
}