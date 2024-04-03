const CONSTS = require("../consts");

function init (oItemProperty, { ability }) {
    if (!CONSTS[ability]) {
        throw new Error('unknown ability ' + ability)
    }
    oItemProperty.data.ability = ability
}

module.exports = {
    init
}