const CONSTS = require('../consts')

function init ({ effect, threat = CONSTS.SAVING_THROW_ANY }) {
    effect.data.threat = threat
}

module.exports = {
    init
}