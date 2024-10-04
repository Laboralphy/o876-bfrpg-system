const CONSTS = require('../consts')

/**
 * @typedef BFEffectDiseaseStageEffectDef {object}
 * @property type {string}
 * @property amp {number}
 * @property duration {number}
 * @property data {object}
 *
 * @typedef BFEffectDiseaseStage {object}
 * @property effect {BFEffectDiseaseStageEffectDef}
 * @property potency {number}
 * @property savingThrow {boolean}
 * @property endDisease {boolean} if true the disease ends when savingThrow is success
 * @property time {number}
 *
 * @param effect
 * @param disease {string}
 * @param stages {BFEffectDiseaseStage[]}
 */
function init ({ effect, disease, stages }) {
    effect.data.disease = disease
    effect.data.stages = stages
    effect.stackingRule = CONSTS.EFFECT_STACKING_RULE_UPDATE_DURATION
    effect.tags.push(CONSTS.EFFECT_TAG_DISEASE, disease)
    effect.key = disease
}

function doMutationStage ({ effectProcessor, effect: eDisease, target, source }, oReadyStage) {
    const { savingThrow = false, potency = 0 } = oReadyStage
    if (savingThrow && target.rollSavingThrow(CONSTS.SAVING_THROW_DEATH_RAY_POISON, {
        ability: CONSTS.ABILITY_CONSTITUTION,
        adjustment: potency
    }).success) {
        // this stage allow saving throw, and saving throw is success
        // No previously applied bad effects are removed, they must be cured separately with cure_disease effect or likewise
        if (oReadyStage.endDisease) {
            effectProcessor.removeEffect(eDisease, target, source)
        }
    } else {
        const oData = { ...oReadyStage.effect }
        delete oData.type
        delete oData.amp
        delete oData.duration
        const { type: sEffectType, amp = 0, duration = 0 } = oReadyStage.effect
        const effect = effectProcessor.createEffect(sEffectType, amp, oData)
        effect.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        effect.tags.push(CONSTS.EFFECT_TAG_DISEASE, eDisease.data.disease)
        // Effects applied by disease are autonomous effects, they keep the disease tag, so they can be removed by cure
        // but when disease end, those effects stay until their own duration depletion.
        effectProcessor.applyEffect(effect, target, duration, source)
    }
}

function mutateArrayTime (payload, oReadyStage) {
    for (let i = oReadyStage.time.length - 1; i >= 0; --i) {
        if (oReadyStage.time[i] <= 0) {
            doMutationStage (payload, oReadyStage)
            oReadyStage.time.splice(i, 1)
        } else {
            --oReadyStage.time[i]
        }
    }
    return oReadyStage.time.length
}

function mutateNumberTime (payload, oReadyStage) {
    if (oReadyStage.time <= 0) {
        doMutationStage(payload, oReadyStage)
        return 0
    } else {
        --oReadyStage.time
        return 1
    }
}

function mutate (payload) {
    const aStages = payload.effect.data.stages
    for (let iStage = aStages.length - 1; iStage >= 0; --iStage) {
        const s = aStages[iStage]
        const nStageValue = Array.isArray(s.time)
            ? mutateArrayTime(payload, s)
            : mutateNumberTime(payload, s)
        if (nStageValue === 0) {
            aStages.splice(iStage, 1)
        }
    }
}

module.exports = {
    init,
    mutate
}
