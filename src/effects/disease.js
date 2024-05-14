const { DURATION_INSTANT} = require("../data/durations");

/**
 * @typedef BFEffectDiseaseStage {object}
 * @property effect {*}
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

function mutate ({ effect, target }) {
    const aStages = effect.data.stages
    aStages.forEach(s => {
        --s.time
    })
    const aReadyStages = aStages.filter(s => s.time <= 0)
    effect.data.stages = aStages.filter(s => s.time > 0)
    aReadyStages.forEach(({ effect, amp = 0, duration = DURATION_INSTANT, data = {} }) => {
        target.events.emit('disease-stage', {
            disease: effect.data.disease,
            effect,
            amp,
            duration,
            data
        })
    })
}

module.exports = {
    init
}