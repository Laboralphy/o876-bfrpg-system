const CONSTS = require("../consts");

function init (oItemProperty, { ability, value }) {
    if (!CONSTS[ability]) {
        throw new Error('unknown ability ' + ability)
    }
    oItemProperty.amp = value
    oItemProperty.data.ability = ability
}

module.exports = {
    init
}