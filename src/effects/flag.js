/**
 * This effect adds a flag on creature. This is useful for inner mechanisms like temporary immunity
 * @param effect {BFEffect}
 * @param flag {string}
 * @param value {string|number}
 */
function init ({ effect, flag, value }) {
    effect.data.flag = flag
    effect.data.value = value
    effect.key = flag + '::' + value
}

module.exports = {
    init
}
