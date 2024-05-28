/**
 * Registers a new damage
 * @param state {BFStoreState}
 * @param sDamageType {string} DAMAGE_TYPE_*
 * @param source {Creature}
 * @param amount {number}
 * @param resisted {number}
 */
module.exports = ({ state }, { damageType: sDamageType, source, amount, resisted }) => {
    state.recentDamages.push({
        damageType: sDamageType,
        source: source.id,
        amount,
        resisted
    })
}