const CONSTS = require('../consts')

/**
 * Inflict damage
 * @param oEffect {BFEffect}
 * @param value {number}
 * @param sDamageType {string} DAMAGE_TYPE_
 * @param material {string} MATERIAL_
 * @param critical {boolean}
 */
function init (oEffect, { type: sDamageType, material = CONSTS.MATERIAL_UNKNOWN, critical = false }) {
    Object.assign(oEffect.data, {
        type: sDamageType,
        material,
        originalAmount: 0,
        appliedAmount: 0,
        resistedAmount: 0,
        critical
    })
}

/**
 * Apply effect modification on effect target
 * @param effect {BFEffect}
 * @param target {Creature}
 * @param source {Creature}
 */
function mutate ({ effect, target, source }) {
    // What is the damage resistance, vulnerability, reduction ?
    const oMitigation = target.getters.getDamageMitigation
    const sType = effect.data.type
    const aMaterials = effect.data.material
    let bMaterialVulnerable = false
    if (aMaterials) {
        bMaterialVulnerable = aMaterials.some(m => oMitigation[m] && oMitigation[m].vulnerability)
    }
    let amp = effect.amp
    if (sType in oMitigation) {
        const { resistance, vulnerability, factor, reduction, immunity } = oMitigation[sType]
        const nFinalFactor = bMaterialVulnerable ? Math.min(1, 2 * factor) : factor
        const appliedAmount = Math.ceil(Math.max(0, (amp - reduction)) * nFinalFactor)
        effect.data.resistedAmount += amp - appliedAmount
        effect.amp = amp - effect.data.resistedAmount
        effect.data.appliedAmount = appliedAmount
    } else {
        // no resistance no absorb no immunity
        effect.data.appliedAmount = amp
    }
    target.mutations.damage({ amount: effect.amp })
}

module.exports = {
    init,
    mutate
}