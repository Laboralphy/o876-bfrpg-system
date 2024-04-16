/**
 * @param state
 * @returns {{ amount: number, types: Object<string, { amount: number, resisted: number }> }}
 */
module.exports = state => {
    const oRegistry = { amount: 0, types: {} }
    state.recentDamages.forEach(({ type: sType, amount, resisted }) => {
        if (sType in oRegistry.types) {
            const r = oRegistry.types[sType]
            r.amount += amount
            r.resisted += resisted
        } else {
            oRegistry.types[sType] = {
                amount,
                resisted
            }
        }
        oRegistry.amount += amount
    })
    return oRegistry
}
