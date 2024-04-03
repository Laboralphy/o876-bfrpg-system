const CONSTS = require("../../consts");
const DEF_EQUIPMENT_SLOTS = [
    CONSTS.EQUIPMENT_SLOT_HEAD,
    CONSTS.EQUIPMENT_SLOT_NECK,
    CONSTS.EQUIPMENT_SLOT_CHEST,
    CONSTS.EQUIPMENT_SLOT_BACK,
    CONSTS.EQUIPMENT_SLOT_ARMS,
    CONSTS.EQUIPMENT_SLOT_SHIELD,
    CONSTS.EQUIPMENT_SLOT_FINGER_LEFT,
    CONSTS.EQUIPMENT_SLOT_FINGER_RIGHT,
    CONSTS.EQUIPMENT_SLOT_AMMO,
    CONSTS.EQUIPMENT_SLOT_WAIST,
    CONSTS.EQUIPMENT_SLOT_FEET
]

/**
 * Returns list of properties on the defensive gear
 * @param state {BFStoreState}
 * @returns {BFItemProperty[]}
 */
module.exports = state =>
    DEF_EQUIPMENT_SLOTS
        .map(eqs => state.equipment[eqs] ? state.equipment[eqs].properties : null)
        .filter(props => !!props)
        .flat()
