const CONSTS = require('../consts')

function init ({ itemProperty, threat = CONSTS.SAVING_THROW_ANY }) {
    itemProperty.data.threat = threat
}

module.exports = {
    init
}