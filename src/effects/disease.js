const CONSTS = require('../consts')
const { DURATION_INSTANT} = require('../data/durations')

/**
 * @typedef BFEffectDiseaseStageEffectDef {object}
 * @property type {string}
 * @property amp {number}
 * @property data {object}
 *
 * @typedef BFEffectDiseaseStage {object}
 * @property effect {BFEffectDiseaseStageEffectDef}
 * @property time {number}
 *
 * @param oEffect
 * @param disease {string}
 * @param stages {BFEffectDiseaseStage[]}
 */
function init (oEffect, { disease, stages }) {
    oEffect.data.disease = disease
    oEffect.data.stages = stages
    oEffect.data.index = 0
}

function mutate ({ effectProcessor, effect: eDisease, target }) {
    const aStages = eDisease.data.stages
    aStages.forEach(s => {
        --s.time
    })
    const aReadyStages = aStages.filter(s => s.time <= 0)
    aStages.data.stages = aStages.filter(s => s.time > 0)
    aReadyStages.forEach(({ type: sEffectType, amp = 0, duration = DURATION_INSTANT, data = {} }) => {
        const effect = effectProcessor.createEffect(sEffectType, amp, data)
        effect.subtype = CONSTS.EFFECT_SUBTYPE_EXTRAORDINARY
        effect.tags.push(CONSTS.EFFECT_TAG_DISEASE, eDisease.data.disease)
        this.applyEffect(effect, target, duration)
    })
}

module.exports = {
    init
}
