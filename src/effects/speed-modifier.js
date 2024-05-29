const CONSTS = require('../consts')

function init ({ effect }) {
    effect.stackingRule = CONSTS.EFFECT_STACKING_RULE_REPLACE
}

module.exports = {
    init
}