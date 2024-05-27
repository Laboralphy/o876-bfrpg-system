const CONSTS = require('../consts')

function init (oEffect) {
    oEffect.stackingRule = CONSTS.EFFECT_STACKING_RULE_REPLACE
}

module.exports = {
    init
}