const CONSTS = require('../consts')

function init (oItemProperty, { threat = CONSTS.SAVING_THROW_ANY }) {
    oItemProperty.data.threat = threat
}

module.exports = {
    init
}