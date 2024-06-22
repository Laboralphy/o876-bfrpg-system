const Manager = require('./src/Manager')
const Creature = require('./src/Creature')
const ItemProperties = require('./src/ItemProperties')
const CONSTS = require('./src/consts')
const oTypes = require('./src/types.doc')

module.exports = {
    Manager,
    Creature,
    ItemProperties,
    CONSTS,
    types: oTypes
}
