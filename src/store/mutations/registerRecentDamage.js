/**
 * Registers a new damage
 * @param state {BFStoreState}
 * @param sDamageType {string} DAMAGE_TYPE_*
 * @param source {Creature}
 * @param amount {number}
 * @param resisted {number}
 */
module.exports = ({ state }, { type: sDamageType, source, amount, resisted }) => {
    state.recentDamages.push({
        type: sDamageType,
        source: source.id,
        amount,
        resisted
    })
}