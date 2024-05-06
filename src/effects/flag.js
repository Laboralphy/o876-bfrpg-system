/**
 * This effect adds a flag on creature. This is useful for inner mechanisms like temporary immunity
 * @param oEffect {BFEffect}
 * @param flag {string}
 * @param value {string|number}
 */
function init (oEffect, { flag, value }) {
    oEffect.data.flag = flag
    oEffect.data.value = value
}

module.exports = {
    init
}
