const CONSTS = require('../consts')

function init (oEffect, { threat = CONSTS.SAVING_THROW_ANY }) {
    oEffect.data.threat = threat
}

module.exports = {
    init
}